import 'dotenv/config';
import { put, del } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const prisma = new PrismaClient();
const TEMP_DIR = '/tmp/drive-sync';
const BATCH_SIZE = 10;

function launchKeynote() {
  // Don't kill - user has real Keynote open manually
  console.log('  [Keynote check]');
}

function convertKeyToPdf(keyFilePath, pdfFilePath) {
  const scriptContent = `
tell application "/Applications/Keynote.app"
  set theDoc to open POSIX file "${keyFilePath}"
  delay 4
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
    try { unlinkSync(scriptPath); } catch {}
    return false;
  }
}

async function main() {
  if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

  // Get all .key records that need PDF conversion
  const keyRecords = await prisma.praiseConti.findMany({
    where: { fileName: { endsWith: '.key' } },
    orderBy: { id: 'asc' },
  });

  console.log(`Found ${keyRecords.length} .key files to convert to PDF\n`);
  if (keyRecords.length === 0) {
    console.log('Nothing to do!');
    await prisma.$disconnect();
    return;
  }

  let converted = 0, failed = 0;

  // Process in batches
  for (let i = 0; i < keyRecords.length; i += BATCH_SIZE) {
    const batch = keyRecords.slice(i, i + BATCH_SIZE);
    console.log(`\n--- Batch ${Math.floor(i/BATCH_SIZE)+1}: files ${i+1}-${Math.min(i+BATCH_SIZE, keyRecords.length)} ---`);

    // Restart Keynote for each batch
    console.log('Restarting Keynote...');
    launchKeynote();

    for (const record of batch) {
      const pdfName = record.fileName.replace(/\.key$/i, '.pdf');
      console.log(`[${i + batch.indexOf(record) + 1}/${keyRecords.length}] ${record.fileName}`);

      // Download .key from blob
      try {
        const res = await fetch(record.fileUrl);
        const buffer = Buffer.from(await res.arrayBuffer());
        const localPath = join(TEMP_DIR, record.fileName);
        writeFileSync(localPath, buffer);

        const pdfPath = join(TEMP_DIR, pdfName);
        const ok = convertKeyToPdf(localPath, pdfPath);

        if (ok && existsSync(pdfPath)) {
          const pdfBuffer = readFileSync(pdfPath);

          // Upload PDF to blob
          const blob = await put(`praise/${pdfName}`, pdfBuffer, {
            access: 'public',
            contentType: 'application/pdf',
            addRandomSuffix: false,
            allowOverwrite: true,
          });

          // Delete old .key blob
          try { await del(record.fileUrl); } catch {}

          // Update DB record
          await prisma.praiseConti.update({
            where: { id: record.id },
            data: {
              fileName: pdfName,
              fileUrl: blob.url,
              fileSize: pdfBuffer.length,
            },
          });

          console.log(`  PDF OK (${(pdfBuffer.length/1024).toFixed(0)}KB)`);
          converted++;
          unlinkSync(pdfPath);
        } else {
          console.log(`  FAILED`);
          failed++;
        }

        if (existsSync(localPath)) unlinkSync(localPath);
      } catch (e) {
        console.error(`  ERROR: ${e.message}`);
        failed++;
      }
    }
  }

  // Kill Keynote when done
  try { execSync('pkill -f Keynote', { timeout: 5000 }); } catch {}

  console.log(`\n===========================`);
  console.log(`Converted: ${converted}, Failed: ${failed}, Total: ${keyRecords.length}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
