import 'dotenv/config';
import { google } from 'googleapis';
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const prisma = new PrismaClient();

// Load service account key
const keyPath = join(import.meta.dirname, '..', 'lls-church-3a04fca53c02.json');
const key = JSON.parse(readFileSync(keyPath, 'utf8'));

const FOLDER_ID = '1Wiw2KIQRjwYH_BvVtOwHrSAS7B5-iH_S';
const TEMP_DIR = '/tmp/drive-sync';

// 절기 키워드 매핑
const SEASON_KEYWORDS = {
  '성탄': '성탄절', '크리스마스': '성탄절', 'christmas': '성탄절',
  '부활': '부활절', 'easter': '부활절',
  '추수감사': '추수감사절', '추수': '추수감사절',
  '사순': '사순절', '고난': '고난주간',
  '대림': '대림절', '강림': '강림절',
  '종려': '종려주일', '성령강림': '성령강림절', '오순': '성령강림절',
  '맥추': '맥추감사절', '송구영신': '송구영신',
};

function getDriveClient() {
  const jwtAuth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({ version: 'v3', auth: jwtAuth });
}

// Parse filename to extract musical key and theme
// Patterns: (A)제목, (A:주제)제목, (C,G:주제)제목, (A:주제1,주제2)제목
function parseFilename(name) {
  const match = name.match(/^\(([A-Ga-g♭♯#b,\s]+)(?::([^)]+))?\)/);
  let musicalKey = null;
  let theme = null;
  let season = null;

  if (match) {
    // Extract musical keys (e.g., "A", "C,G", "Bb")
    musicalKey = match[1].replace(/\s/g, '').toUpperCase();
    // Extract theme (e.g., "은혜", "성령,부흥")
    if (match[2]) {
      theme = match[2].trim();
    }
  }

  // Check for season keywords in the entire filename
  const lowerName = name.toLowerCase();
  for (const [keyword, seasonName] of Object.entries(SEASON_KEYWORDS)) {
    if (lowerName.includes(keyword.toLowerCase())) {
      season = seasonName;
      break;
    }
  }

  return { musicalKey, theme, season };
}

// Convert .key to PDF using Keynote via AppleScript
function convertKeyToPdf(keyFilePath, pdfFilePath) {
  const scriptContent = `
tell application "Keynote"
  set theDoc to open POSIX file "${keyFilePath}"
  delay 3
  export theDoc to POSIX file "${pdfFilePath}" as PDF
  close theDoc saving no
end tell
`;
  const scriptPath = join(TEMP_DIR, '_convert.scpt');
  writeFileSync(scriptPath, scriptContent);
  try {
    execSync(`osascript "${scriptPath}"`, { timeout: 60000 });
    unlinkSync(scriptPath);
    return true;
  } catch (e) {
    console.error(`  Failed to convert: ${e.message}`);
    try { unlinkSync(scriptPath); } catch {}
    return false;
  }
}

async function main() {
  if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

  const drive = getDriveClient();

  console.log('Listing files in Google Drive folder...');
  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and trashed = false`,
    fields: 'files(id, name, size, mimeType, createdTime)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  });

  const files = res.data.files || [];
  console.log(`Found ${files.length} files\n`);

  // Get existing records
  const existing = await prisma.praiseConti.findMany({ select: { fileName: true } });
  const existingNames = new Set(existing.map(e => e.fileName));

  let synced = 0, skipped = 0, failed = 0;

  for (const file of files) {
    if (!file.name || !file.id) continue;

    // Check PDF filename for dedup
    const pdfName = file.name.replace(/\.key$/i, '.pdf');
    if (existingNames.has(pdfName) || existingNames.has(file.name)) {
      skipped++;
      continue;
    }

    console.log(`\n[${synced + skipped + failed + 1}/${files.length}] ${file.name}`);

    try {
      const download = await drive.files.get(
        { fileId: file.id, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      const buffer = Buffer.from(download.data);
      const isKey = file.name.toLowerCase().endsWith('.key');
      const localPath = join(TEMP_DIR, file.name);
      writeFileSync(localPath, buffer);

      let uploadBuffer = buffer;
      let uploadName = file.name;
      let contentType = file.mimeType || 'application/octet-stream';

      if (isKey) {
        const pdfPath = join(TEMP_DIR, pdfName);
        const ok = convertKeyToPdf(localPath, pdfPath);
        if (ok && existsSync(pdfPath)) {
          uploadBuffer = readFileSync(pdfPath);
          uploadName = pdfName;
          contentType = 'application/pdf';
          console.log(`  PDF OK (${(uploadBuffer.length / 1024).toFixed(0)}KB)`);
          unlinkSync(pdfPath);
        } else {
          console.log(`  PDF fail, uploading .key`);
        }
      }

      // Upload to Vercel Blob
      const blob = await put(`praise/${uploadName}`, uploadBuffer, {
        access: 'public',
        contentType,
      });

      // Parse category info from filename
      const { musicalKey, theme, season } = parseFilename(file.name);

      // Extract date from filename
      const dateMatch = file.name.match(/(\d{4})[\.\-_\s]?(\d{1,2})[\.\-_\s]?(\d{1,2})/);
      let serviceDate;
      if (dateMatch) {
        serviceDate = new Date(`${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`);
      } else {
        serviceDate = file.createdTime ? new Date(file.createdTime) : new Date();
      }

      // Create DB record
      await prisma.praiseConti.create({
        data: {
          title: file.name.replace(/\.[^.]+$/, ''),
          serviceDate,
          fileName: uploadName,
          fileUrl: blob.url,
          fileSize: uploadBuffer.length,
          musicalKey,
          theme,
          season,
        },
      });

      console.log(`  Done → ${blob.url.substring(0, 60)}...`);
      if (musicalKey || theme || season) {
        console.log(`  Tags: key=${musicalKey || '-'} theme=${theme || '-'} season=${season || '-'}`);
      }
      synced++;

      // Cleanup
      if (existsSync(localPath)) unlinkSync(localPath);
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n===========================`);
  console.log(`Synced: ${synced}, Skipped: ${skipped}, Failed: ${failed}, Total: ${files.length}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
