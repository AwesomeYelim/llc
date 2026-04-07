import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const totalSermons = await prisma.sermon.count();
  const withYoutube = await prisma.sermon.count({ where: { youtubeId: { not: null } } });
  const withoutYoutube = await prisma.sermon.count({ where: { youtubeId: null } });
  const totalColumns = await prisma.column.count();

  console.log(`=== DB 현황 ===`);
  console.log(`설교 총: ${totalSermons}`);
  console.log(`  - YouTube 있음: ${withYoutube}`);
  console.log(`  - YouTube 없음: ${withoutYoutube}`);
  console.log(`칼럼 총: ${totalColumns}`);

  // YouTube 없는 설교들 확인
  if (withoutYoutube > 0) {
    const noYt = await prisma.sermon.findMany({
      where: { youtubeId: null },
      select: { id: true, title: true, blogUrl: true },
      take: 5
    });
    console.log(`\n--- YouTube 없는 설교 (첫 5개) ---`);
    noYt.forEach(s => console.log(`  ${s.id}: ${s.title} | blog: ${s.blogUrl ? 'yes' : 'no'}`));
  }

  await prisma.$disconnect();
}

main().catch(console.error);
