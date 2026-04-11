import 'dotenv/config';
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const prisma = new PrismaClient();

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
// 콘티 폴더명 → 날짜 (YYMMDD → Date)
// ──────────────────────────────────────────────
function parseContiDate(folderName) {
  // YYMMDD 형식: 260322 → 2026-03-22
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
  // YYYYMM_N 형식: 202604_1 → 2026년 4월 1번째 일요일
  const m = folderName.match(/^(\d{4})(\d{2})_(\d+|.+)$/);
  if (!m) return null;
  const year = parseInt(m[1]);
  const month = parseInt(m[2]);
  const weekOrLabel = m[3];

  const weekNum = parseInt(weekOrLabel);
  if (isNaN(weekNum)) {
    // 특별 행사 (송구영신 등) → 해당 월 마지막 날
    const lastDay = new Date(year, month, 0).getDate();
    return new Date(`${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`);
  }

  // N번째 일요일 계산
  const firstDay = new Date(year, month - 1, 1);
  const firstSunday = firstDay.getDay() === 0 ? 1 : 8 - firstDay.getDay();
  const targetDay = Math.min(firstSunday + (weekNum - 1) * 7, new Date(year, month, 0).getDate());
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`);
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

  // 기존 파일명 목록
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
      // 중복 체크
      if (existingNames.has(file)) {
        skipped++;
        continue;
      }

      const filePath = join(folderPath, file);
      const buffer = readFileSync(filePath);
      const ext = extname(file).toLowerCase();

      // 제목: 순번 제거 (예: "1 지존하신 주님 이름 앞에.pdf" → "지존하신 주님 이름 앞에")
      const title = file
        .replace(/\.[^.]+$/, '')        // 확장자 제거
        .replace(/^\d+\s*/, '');        // 앞 순번 제거

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
// 주보 동기화
// ──────────────────────────────────────────────
async function syncBulletins() {
  console.log(`\n📁 주보 폴더: ${BULLETIN_DIR}`);
  if (!existsSync(BULLETIN_DIR)) {
    console.log('  폴더가 존재하지 않습니다. 건너뜁니다.');
    return { synced: 0, skipped: 0 };
  }

  // 기존 파일명 목록
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

    const folderPath = join(BULLETIN_DIR, folder);
    const files = readdirSync(folderPath).filter(f =>
      !f.startsWith('.') && /\.(pdf)$/i.test(f)
    );

    // presentation_*.pdf → PPT, print_*.pdf → BULLETIN
    const presentationFile = files.find(f => f.startsWith('presentation_'));
    const printFile = files.find(f => f.startsWith('print_'));

    for (const [file, type] of [[presentationFile, 'PPT'], [printFile, 'BULLETIN']]) {
      if (!file) continue;
      if (existingNames.has(file)) {
        skipped++;
        continue;
      }

      const filePath = join(folderPath, file);
      const buffer = readFileSync(filePath);

      // 주차 라벨 추출 (202604_1 → "2026년 4월 1주")
      const m = folder.match(/^(\d{4})(\d{2})_(.+)$/);
      const label = m
        ? `${m[1]}년 ${parseInt(m[2])}월 ${isNaN(m[3]) ? m[3] : m[3] + '주'}`
        : folder;
      const title = type === 'PPT' ? `${label} 주보 PPT` : `${label} 주보`;

      console.log(`  ${folder}/${file} → "${title}"`);

      const blob = await put(`bulletins/${file}`, buffer, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      // Bulletin 레코드 찾거나 생성
      let bulletin = await prisma.bulletin.findFirst({
        where: {
          serviceDate,
          bulletinType: type,
        },
      });

      if (!bulletin) {
        bulletin = await prisma.bulletin.create({
          data: {
            title,
            serviceDate,
            bulletinType: type,
          },
        });
      }

      await prisma.bulletinFile.create({
        data: {
          fileName: file,
          fileUrl: blob.url,
          fileSize: buffer.length,
          bulletinId: bulletin.id,
        },
      });

      existingNames.add(file);
      synced++;
    }
  }

  return { synced, skipped };
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const syncAll = args.length === 0;
  const doConti = syncAll || args.includes('--conti');
  const doBulletin = syncAll || args.includes('--bulletin');

  console.log('=== 로컬 폴더 → 사이트 동기화 ===');

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
