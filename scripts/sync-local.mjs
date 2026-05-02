import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { readdirSync, statSync, existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';
import { execSync } from 'child_process';

// ──────────────────────────────────────────────
// 파일 서버 설정
// ──────────────────────────────────────────────
const FILE_SERVER_HOST = process.env.FILE_SERVER_HOST || '138.2.119.220';
const FILE_SERVER_USER = process.env.FILE_SERVER_USER || 'ubuntu';
const FILE_SERVER_ASSETS_DIR = process.env.FILE_SERVER_ASSETS_DIR || '/var/www/assets';
const FILE_SERVER_BASE_URL = process.env.FILE_SERVER_BASE_URL || `http://${FILE_SERVER_HOST}/assets`;

function uploadToServer(localPath, remoteSubpath) {
  const remotePath = `${FILE_SERVER_ASSETS_DIR}/${remoteSubpath}`;
  execSync(
    `scp -o StrictHostKeyChecking=no "${localPath}" ${FILE_SERVER_USER}@${FILE_SERVER_HOST}:"${remotePath}"`,
    { timeout: 120000 }
  );
  return `${FILE_SERVER_BASE_URL}/${remoteSubpath}`;
}

function deleteFromServer(remoteSubpath) {
  try {
    execSync(
      `ssh -o StrictHostKeyChecking=no ${FILE_SERVER_USER}@${FILE_SERVER_HOST} "rm -f '${FILE_SERVER_ASSETS_DIR}/${remoteSubpath}'"`,
      { timeout: 30000 }
    );
  } catch {}
}

const prisma = new PrismaClient();
const TEMP_DIR = '/tmp/sync-local';

// ──────────────────────────────────────────────
// Config — 로컬 폴더 경로
// ──────────────────────────────────────────────
const CONTI_DIR = process.env.CONTI_DIR ||
  join(process.env.HOME, 'Library/Mobile Documents/com~apple~Keynote/Documents/콘티& 악보');
const BULLETIN_DIR = process.env.BULLETIN_DIR || join(process.env.HOME, 'Downloads/교회관련/주보 및 pdf');

// ──────────────────────────────────────────────
// 절기 키워드
// ──────────────────────────────────────────────
const SEASON_KEYWORDS = {
  '성탄': '성탄절', '크리스마스': '성탄절',
  '부활': '부활절',
  '추수감사': '추수감사절', '추수': '추수감사절',
  '사순': '사순절', '고난': '고난주간',
  '대림': '대림절', '강림': '강림절',
  '종려': '종려주일', '성령강림': '성령강림절', '오순': '성령강림절',
  '맥추': '맥추감사절', '송구영신': '송구영신',
};

function detectSeason(name) {
  const lower = name.toLowerCase();
  for (const [keyword, season] of Object.entries(SEASON_KEYWORDS)) {
    if (lower.includes(keyword.toLowerCase())) return season;
  }
  return null;
}

// ──────────────────────────────────────────────
// PDF 경량화 (ghostscript)
// ──────────────────────────────────────────────
function compressPdf(inputPath, outputPath) {
  try {
    execSync(
      `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook ` +
      `-dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`,
      { timeout: 60000 }
    );
    return existsSync(outputPath);
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────
// 콘티 폴더명 → 날짜 (YYMMDD → Date)
// ──────────────────────────────────────────────
function parseContiDate(folderName) {
  const m = folderName.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (!m) return null;
  const year = 2000 + parseInt(m[1]);
  const month = parseInt(m[2]);
  const day = parseInt(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
}

// ──────────────────────────────────────────────
// 주보 폴더명 → 날짜 (YYYYMM_N → 해당 월 N번째 일요일)
// ──────────────────────────────────────────────
function parseBulletinDate(folderName) {
  // sun_YYYYMM_N 또는 YYYYMM_N 둘 다 지원
  const m = folderName.replace(/^sun_/i, '').match(/^(\d{4})(\d{2})_(\d+|.+)$/);
  if (!m) return null;
  const year = parseInt(m[1]);
  const month = parseInt(m[2]);
  const weekOrLabel = m[3];

  const weekNum = parseInt(weekOrLabel);
  if (isNaN(weekNum)) {
    const lastDay = new Date(year, month, 0).getDate();
    return new Date(`${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`);
  }

  const firstDay = new Date(year, month - 1, 1);
  const firstSunday = firstDay.getDay() === 0 ? 1 : 8 - firstDay.getDay();
  const targetDay = Math.min(firstSunday + (weekNum - 1) * 7, new Date(year, month, 0).getDate());
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`);
}

// ──────────────────────────────────────────────
// 기존 주보 데이터 정리
// ──────────────────────────────────────────────
async function cleanBulletins() {
  console.log('\n🧹 기존 주보 데이터 정리...');

  // 서버에서 bulletins/ 디렉토리 파일 삭제
  try {
    execSync(
      `ssh -o StrictHostKeyChecking=no ${FILE_SERVER_USER}@${FILE_SERVER_HOST} "rm -f '${FILE_SERVER_ASSETS_DIR}/bulletins/'*.zip"`,
      { timeout: 30000 }
    );
    console.log('  서버 bulletins/ 파일 삭제 완료');
  } catch (e) {
    console.log('  서버 파일 삭제 실패 (무시):', e.message);
  }

  // DB 레코드 삭제 (BulletinFile → Bulletin 순서)
  const { count: fileCount } = await prisma.bulletinFile.deleteMany({});
  const { count: bulletinCount } = await prisma.bulletin.deleteMany({});

  console.log(`  DB: ${bulletinCount}개 주보 + ${fileCount}개 파일 삭제`);
}

// ──────────────────────────────────────────────
// 기존 콘티 데이터 정리
// ──────────────────────────────────────────────
async function cleanConti() {
  console.log('\n🧹 기존 콘티 데이터 정리...');

  // 서버에서 praise/ 디렉토리 전체 삭제 후 재생성
  try {
    execSync(
      `ssh -o StrictHostKeyChecking=no ${FILE_SERVER_USER}@${FILE_SERVER_HOST} "rm -rf '${FILE_SERVER_ASSETS_DIR}/praise' && mkdir -p '${FILE_SERVER_ASSETS_DIR}/praise'"`,
      { timeout: 30000 }
    );
    console.log('  서버 praise/ 디렉토리 초기화 완료');
  } catch (e) {
    console.log('  서버 파일 삭제 실패 (무시):', e.message);
  }

  // DB 레코드 삭제
  const { count } = await prisma.praiseConti.deleteMany({});
  console.log(`  DB: ${count}개 콘티 삭제`);
}

// ──────────────────────────────────────────────
// Keynote → PDF 변환 (macOS osascript)
// ──────────────────────────────────────────────
function exportKeynoteToPdf(keyPath, pdfPath) {
  const script = `tell application "Keynote Creator Studio"
  activate
  open POSIX file ${JSON.stringify(keyPath)}
  delay 4
  set theDoc to front document
  export theDoc to POSIX file ${JSON.stringify(pdfPath)} as PDF with properties {PDF image quality:Best}
  close theDoc saving no
end tell`;
  const scriptFile = `/tmp/_keynote_export_${Date.now()}.applescript`;
  writeFileSync(scriptFile, script);
  try {
    execSync(`osascript ${JSON.stringify(scriptFile)}`, { timeout: 120000 });
    return existsSync(pdfPath);
  } catch (e) {
    console.log(`    ⚠ PDF 변환 실패: ${e.message}`);
    return false;
  } finally {
    try { unlinkSync(scriptFile); } catch {}
  }
}

// ──────────────────────────────────────────────
// 파일명에서 키/테마 파싱
// 형식: (A:테마명)..., (G:테마)..., (A)(찬)..., (A,G:테마)...
// ──────────────────────────────────────────────
function parseKeyTheme(fileName) {
  const base = fileName.replace(/\.[^.]+$/, '');
  const m = base.match(/^\(([A-Gb#♭,]+)(?::([^)]+))?\)/);
  if (!m) return { musicalKey: null, theme: null };
  const musicalKey = m[1].split(',')[0].trim() || null;
  const theme = m[2]?.trim() || null;
  return { musicalKey, theme };
}

// ──────────────────────────────────────────────
// 콘티 동기화 — Keynote Cloud 평탄 구조
// ~/Library/Mobile Documents/com~apple~Keynote/Documents/콘티& 악보/
// ──────────────────────────────────────────────
async function syncConti() {
  console.log(`\n📁 콘티 폴더: ${CONTI_DIR}`);
  if (!existsSync(CONTI_DIR)) {
    console.log('  폴더가 존재하지 않습니다. 건너뜁니다.');
    return { synced: 0, skipped: 0 };
  }

  // 기존 DB: DB의 fileName(.pdf) → record  +  .key명 → record (변경 감지용)
  // fileSize 는 원본 .key 파일 크기를 저장해 변경 감지에 사용
  const existing = await prisma.praiseConti.findMany({
    select: { id: true, fileName: true, serviceDate: true, fileSize: true },
  });
  // DB fileName 이 .pdf 형태이므로 .key 이름으로도 조회할 수 있게 양쪽 매핑
  const existingMap = new Map(existing.map(e => [
    e.fileName.replace(/\.pdf$/i, '.key'),  // .key 기준 조회
    e,
  ]));

  // 평탄 구조: .key 파일만 (숨김 파일 제외)
  const files = readdirSync(CONTI_DIR).filter(f => {
    if (f.startsWith('.')) return false;
    const full = join(CONTI_DIR, f);
    return statSync(full).isFile() && /\.key$/i.test(f);
  }).sort();

  let synced = 0, skipped = 0, updated = 0;

  for (const file of files) {
    const filePath = join(CONTI_DIR, file);
    const stat = statSync(filePath);
    const serviceDate = new Date(stat.mtime);   // 수정일 = 최근 사용일
    const fileSize = stat.size;

    // 제목: (코드) 접두사 제거, + → 공백
    const title = file
      .replace(/\.[^.]+$/, '')
      .replace(/^\([^)]+\)\s*/g, '')   // (A:테마) 제거
      .replace(/\+/g, ' + ')
      .trim();

    const { musicalKey, theme } = parseKeyTheme(file);
    const season = detectSeason(file);

    // mtime 기준 변경 감지 (2초 오차 허용)
    const existingRec = existingMap.get(file);
    if (existingRec) {
      const diff = Math.abs(existingRec.serviceDate.getTime() - serviceDate.getTime());
      if (diff < 2000) {
        skipped++;
        continue;
      }
      console.log(`  ↻ ${file} (수정됨)`);
    } else {
      console.log(`  + ${file} → "${title}"`);
    }

    // .key → PDF 변환
    const pdfName = file.replace(/\.key$/i, '.pdf');
    const pdfPath = `/tmp/${pdfName}`;
    const ok = exportKeynoteToPdf(filePath, pdfPath);
    if (!ok) {
      console.log(`    건너뜀 (변환 실패)`);
      skipped++;
      continue;
    }
    const pdfSize = statSync(pdfPath).size;

    const fileUrl = uploadToServer(pdfPath, `praise/${encodeURIComponent(pdfName)}`);
    try { unlinkSync(pdfPath); } catch {}

    if (existingRec) {
      await prisma.praiseConti.update({
        where: { id: existingRec.id },
        data: { serviceDate, fileUrl, fileName: pdfName, fileSize: pdfSize, musicalKey, theme, season, title },
      });
      updated++;
    } else {
      await prisma.praiseConti.create({
        data: { title, serviceDate, fileName: pdfName, fileUrl, fileSize: pdfSize, musicalKey, theme, season },
      });
      synced++;
    }
  }

  if (updated > 0) console.log(`  (수정 업데이트: ${updated}개)`);
  return { synced, skipped };
}

// ──────────────────────────────────────────────
// 주보 동기화 (폴더별 ZIP + PDF 경량화)
// ──────────────────────────────────────────────
async function syncBulletins() {
  console.log(`\n📁 주보 폴더: ${BULLETIN_DIR}`);
  if (!existsSync(BULLETIN_DIR)) {
    console.log('  폴더가 존재하지 않습니다. 건너뜁니다.');
    return { synced: 0, skipped: 0 };
  }

  if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

  const existingFiles = await prisma.bulletinFile.findMany({ select: { fileName: true } });
  const existingNames = new Set(existingFiles.map(e => e.fileName));

  const folders = readdirSync(BULLETIN_DIR).filter(f => {
    const full = join(BULLETIN_DIR, f);
    return statSync(full).isDirectory() && /^(sun_)?\d{6}_/.test(f);
  }).sort();

  let synced = 0, skipped = 0;

  for (const folder of folders) {
    const serviceDate = parseBulletinDate(folder);
    if (!serviceDate) continue;

    const zipName = `${folder}.zip`;

    // 이미 올라간 폴더는 건너뜀
    if (existingNames.has(zipName)) {
      skipped++;
      continue;
    }

    const folderPath = join(BULLETIN_DIR, folder);
    const files = readdirSync(folderPath).filter(f =>
      !f.startsWith('.') && /\.pdf$/i.test(f)
    );

    if (files.length === 0) continue;

    // 주차 라벨 (sun_ 접두사 제거 후 파싱)
    const folderBase = folder.replace(/^sun_/i, '');
    const m = folderBase.match(/^(\d{4})(\d{2})_(.+)$/);
    const label = m
      ? `${m[1]}년 ${parseInt(m[2])}월 ${isNaN(parseInt(m[3])) ? m[3] : m[3] + '주'}`
      : folder;
    const title = `${label} 주보`;

    console.log(`  ${folder}/ (${files.length}개 파일) → "${title}"`);

    // PDF 경량화 후 ZIP
    const compressedDir = join(TEMP_DIR, folder);
    if (!existsSync(compressedDir)) mkdirSync(compressedDir, { recursive: true });

    for (const file of files) {
      const srcPath = join(folderPath, file);
      const srcSize = statSync(srcPath).size;
      const destPath = join(compressedDir, file);

      // 5MB 이상이면 ghostscript로 경량화
      if (srcSize > 5 * 1024 * 1024) {
        const ok = compressPdf(srcPath, destPath);
        if (ok) {
          const newSize = statSync(destPath).size;
          console.log(`    ${file}: ${(srcSize / 1024 / 1024).toFixed(1)}MB → ${(newSize / 1024 / 1024).toFixed(1)}MB`);
        } else {
          // 경량화 실패 시 원본 복사
          execSync(`cp "${srcPath}" "${destPath}"`);
          console.log(`    ${file}: 경량화 실패, 원본 사용 (${(srcSize / 1024 / 1024).toFixed(1)}MB)`);
        }
      } else {
        execSync(`cp "${srcPath}" "${destPath}"`);
        console.log(`    ${file}: ${(srcSize / 1024 / 1024).toFixed(1)}MB (경량화 불필요)`);
      }
    }

    // ZIP 생성
    const zipPath = join(TEMP_DIR, zipName);
    try { unlinkSync(zipPath); } catch {}
    execSync(`cd "${compressedDir}" && zip -j "${zipPath}" *.pdf`, { timeout: 30000 });

    const zipSize = statSync(zipPath).size;
    console.log(`    → ZIP: ${(zipSize / 1024 / 1024).toFixed(1)}MB`);

    // 파일 서버 업로드
    const fileUrl = uploadToServer(zipPath, `bulletins/${zipName}`);

    // DB 생성: 하나의 Bulletin + 하나의 BulletinFile (ZIP)
    const bulletin = await prisma.bulletin.create({
      data: {
        title,
        serviceDate,
        bulletinType: 'BULLETIN',
        files: {
          create: {
            fileName: zipName,
            fileUrl,
            fileSize: zipSize,
          },
        },
      },
    });

    existingNames.add(zipName);
    synced++;

    // 임시 파일 정리
    try {
      execSync(`rm -rf "${compressedDir}" "${zipPath}"`);
    } catch {}
  }

  return { synced, skipped };
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const syncAll = args.length === 0 || args.includes('--all');
  const doConti = syncAll || args.includes('--conti');
  const doBulletin = syncAll || args.includes('--bulletin');
  const doClean = args.includes('--clean');

  console.log('=== 로컬 폴더 → 사이트 동기화 ===');

  if (doClean) {
    if (doBulletin) await cleanBulletins();
    if (doConti) await cleanConti();
  }

  let totalSynced = 0, totalSkipped = 0;

  if (doConti) {
    const r = await syncConti();
    totalSynced += r.synced;
    totalSkipped += r.skipped;
    console.log(`\n  콘티: ${r.synced}개 업로드, ${r.skipped}개 건너뜀`);
  }

  if (doBulletin) {
    const r = await syncBulletins();
    totalSynced += r.synced;
    totalSkipped += r.skipped;
    console.log(`\n  주보: ${r.synced}개 업로드, ${r.skipped}개 건너뜀`);
  }

  console.log(`\n=== 완료: ${totalSynced}개 업로드, ${totalSkipped}개 건너뜀 ===`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
