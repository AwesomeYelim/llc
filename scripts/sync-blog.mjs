import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BLOG_ID = 'hey0190';
const RSS_URL = `https://rss.blog.naver.com/${BLOG_ID}`;

function parseCDATA(text) {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function parseRSS(xml) {
  const posts = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = parseCDATA(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
    const link = parseCDATA(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '');
    const description = parseCDATA(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? '');
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? '';
    const category = parseCDATA(item.match(/<category>([\s\S]*?)<\/category>/)?.[1] ?? '');
    if (title && link) posts.push({ title, link, description, pubDate, category });
  }
  return posts;
}

function cleanBlogUrl(url) {
  return url.replace(/\?fromRss.*$/, '');
}

function extractPostId(url) {
  return url.match(/\/(\d+)(?:\?|$)/)?.[1] ?? '';
}

function extractScripture(text) {
  const match = text.match(/본문\s*[:：]\s*([^\n(]+)/i);
  return match?.[1]?.trim() ?? '';
}

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
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
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
  console.log('Fetching RSS...');
  const res = await fetch(RSS_URL);
  const xml = await res.text();
  const posts = parseRSS(xml);
  const sermonPosts = posts.filter(p => p.category === '설교');
  console.log(`Found ${sermonPosts.length} sermon posts`);

  let synced = 0;
  let skipped = 0;

  for (const post of sermonPosts) {
    const blogUrl = cleanBlogUrl(post.link);
    const postId = extractPostId(blogUrl);
    const cleanTitle = post.title.replace(/[""]/g, '').replace(/^제목\s*[:：]\s*/, '').trim();

    // Column 중복 체크
    const existingColumn = await prisma.column.findFirst({
      where: { title: cleanTitle },
    });

    if (existingColumn) {
      console.log(`  SKIP (exists): ${cleanTitle}`);
      skipped++;
      continue;
    }

    // 본문 스크래핑
    console.log(`  Fetching: ${cleanTitle} (${postId})...`);
    const content = postId ? await fetchBlogContent(postId) : '';
    if (!content) {
      console.log(`  SKIP (no content): ${cleanTitle}`);
      skipped++;
      continue;
    }

    const scripture = extractScripture(post.description);
    const pubDate = post.pubDate ? new Date(post.pubDate) : new Date();

    // Sermon 찾기 또는 생성
    let sermon = await prisma.sermon.findFirst({
      where: { blogUrl },
    });

    if (!sermon) {
      sermon = await prisma.sermon.create({
        data: {
          title: cleanTitle,
          scripture,
          sermonDate: pubDate,
          serviceType: 'SUNDAY_MAIN',
          blogUrl,
          summary: post.description.replace(/<[^>]*>/g, '').slice(0, 500),
        },
      });
    }

    // Column 생성
    await prisma.column.create({
      data: {
        title: cleanTitle,
        content,
        scripture,
        sermonId: sermon.id,
      },
    });

    synced++;
    console.log(`  SYNCED: ${cleanTitle} (${content.length} chars)`);
  }

  console.log(`\nDone! Synced: ${synced}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
