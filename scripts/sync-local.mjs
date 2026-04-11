import 'dotenv/config';
import { put, del, list } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const prisma = new PrismaClient();
const TEMP_DIR = '/tmp/sync-local';

// ──────────────────────────────────────────────
// Config — 로컬 폴더 경로
// ──────────────────────────────────────────────
const CONTI_DIR = process.env.CONTI_DIR || join(process.env.HOME, 'Downloads/교회관련/오후예배콘티');
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
  const m = folderName.match(/^(\d{4})(\d{2})_(\d+|.+)$/);
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

  // Blob에서 bulletins/ 프리픽스 파일 삭제
  let cursor;
  let deletedBlobs = 0;
  do {
    const result = await list({ prefix: 'bulletins/', cursor, limit: 100 });
    if (result.blobs.length > 0) {
      await del(result.blobs.map(b => b.url));
      deletedBlobs += result.blobs.length;
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  // DB 레코드 삭제 (BulletinFile → Bulletin 순서)
  const { count: fileCount } = await prisma.bulletinFile.deleteMany({});
  const { count: bulletinCount } = await prisma.bulletin.deleteMany({});

  console.log(`  Blob: ${deletedBlobs}개 삭제, DB: ${bulletinCount}개 주보 + ${fileCount}개 파일 삭제`);
}

// ──────────────────────────────────────────────
// 콘티 동기화
// ──────────────────────────────────────────────
async function syncConti() {
  console.log(`\n📁 콘티 폴더: ${CONTI_DIR}`);
  if (!existsSync(CONTI_DIR)) {
    console.log('  폴더가 존재하지 않습니다. 건너뜁니다.');
    return { synced: 0, skipped: 0 };
  }

  const existing = await prisma.praiseConti.findMany({ select: { fileName: true } });
  const existingNames = new Set(existing.map(e => e.fileName));

  const folders = readdirSync(CONTI_DIR).filter(f => {
    const full = join(CONTI_DIR, f);
    return statSync(full).isDirectory() && /^\d{6}$/.test(f);
  }).sort();

  let synced = 0, skipped = 0;

  for (const folder of folders) {
    const serviceDate = parseContiDate(folder);
    if (!serviceDate) continue;

    const folderPath = join(CONTI_DIR, folder);
    const files = readdirSync(folderPath).filter(f =>
      !f.startsWith('.') && /\.(pdf|key)$/i.test(f)
    ).sort();

    for (const file of files) {
      if (existingNames.has(file)) {
        skipped++;
        continue;
      }

      const filePath = join(folderPath, file);
      const buffer = readFileSync(filePath);
      const ext = extname(file).toLowerCase();

      const title = file
        .replace(/\.[^.]+$/, '')
        .replace(/^\d+\s*/, '');

      console.log(`  ${folder}/${file} → "${title}"`);

      const blob = await put(`praise/${file}`, buffer, {
        access: 'public',
        contentType: ext === '.pdf' ? 'application/pdf' : 'application/octet-stream',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      const season = detectSeason(file) || detectSeason(folder);

      await prisma.praiseConti.create({
        data: {
          title,
          serviceDate,
          fileName: file,
          fileUrl: blob.url,
          fileSize: buffer.length,
          musicalKey: null,
          theme: null,
          season,
        },
      });

      existingNames.add(file);
      synced++;
    }
  }

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
    return statSync(full).isDirectory() && /^\d{6}_/.test(f);
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

    // 주차 라벨
    const m = folder.match(/^(\d{4})(\d{2})_(.+)$/);
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

    const zipBuffer = readFileSync(zipPath);
    console.log(`    → ZIP: ${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB`);

    // Vercel Blob 업로드
    const blob = await put(`bulletins/${zipName}`, zipBuffer, {
      access: 'public',
      contentType: 'application/zip',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    // DB 생성: 하나의 Bulletin + 하나의 BulletinFile (ZIP)
    const bulletin = await prisma.bulletin.create({
      data: {
        title,
        serviceDate,
        bulletinType: 'BULLETIN',
        files: {
          create: {
            fileName: zipName,
            fileUrl: blob.url,
            fileSize: zipBuffer.length,
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
    await cleanBulletins();
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
