import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // seed에서 만든 샘플 설교 삭제 (YouTube도 blog도 없는 것)
  const deleted = await prisma.sermon.deleteMany({
    where: {
      youtubeId: null,
      blogUrl: null,
    },
  });
  console.log(`Deleted ${deleted.count} sample sermons (no youtube, no blog)`);

  // 중복 제거: 같은 blogUrl을 가진 설교 중 Column이 연결되지 않은 것 삭제
  const sermons = await prisma.sermon.findMany({
    where: { blogUrl: { not: null } },
    include: { columns: true },
  });

  let dupDeleted = 0;
  const seenUrls = new Set();
  for (const s of sermons) {
    if (seenUrls.has(s.blogUrl)) {
      if (s.columns.length === 0) {
        await prisma.sermon.delete({ where: { id: s.id } });
        dupDeleted++;
      }
    } else {
      seenUrls.add(s.blogUrl);
    }
  }
  console.log(`Deleted ${dupDeleted} duplicate sermons`);

  const remaining = await prisma.sermon.count();
  console.log(`Remaining sermons: ${remaining}`);

  await prisma.$disconnect();
}

main().catch(console.error);
