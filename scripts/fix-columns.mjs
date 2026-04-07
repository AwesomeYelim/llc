import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const BLOG_ID = 'hey0190';

async function fetchBlogContent(postId) {
  const viewUrl = `https://blog.naver.com/PostView.naver?blogId=${BLOG_ID}&logNo=${postId}&redirect=Dlog&widgetTypeCall=true`;
  const res = await fetch(viewUrl);
  if (!res.ok) return '';
  const html = await res.text();

  const paragraphs = [];
  const re = /<p class="se-text-paragraph[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    let text = m[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
      .trim();
    if (text) paragraphs.push(text);
  }
  if (paragraphs.length === 0) return '';

  return paragraphs
    .map(p => {
      if (/^\d+:\d+/.test(p)) return `<p class="bible-verse">${p}</p>`;
      if (/^\d+\.\s/.test(p) && p.length < 100) return `<h3>${p}</h3>`;
      return `<p>${p}</p>`;
    })
    .join('\n');
}

async function main() {
  // 모든 Column 확인
  const columns = await prisma.column.findMany({
    include: { sermon: { select: { blogUrl: true } } }
  });

  console.log(`Total columns: ${columns.length}`);
  const short = columns.filter(c => c.content.length < 100);
  console.log(`Short/empty content: ${short.length}`);

  let fixed = 0;
  for (const col of short) {
    const blogUrl = col.sermon?.blogUrl;
    if (!blogUrl) {
      console.log(`  SKIP (no blogUrl): ${col.title}`);
      continue;
    }

    const postId = blogUrl.match(/\/(\d+)(?:\?|$)/)?.[1];
    if (!postId) {
      console.log(`  SKIP (no postId): ${col.title}`);
      continue;
    }

    console.log(`  Fetching: ${col.title}...`);
    const content = await fetchBlogContent(postId);
    if (!content || content.length < 100) {
      console.log(`  SKIP (scrape failed): ${col.title}`);
      continue;
    }

    await prisma.column.update({
      where: { id: col.id },
      data: { content },
    });
    fixed++;
    console.log(`  FIXED: ${col.title} (${content.length} chars)`);
  }

  console.log(`\nFixed: ${fixed} / ${short.length}`);
  await prisma.$disconnect();
}

main().catch(console.error);
