import { PrismaClient, ServiceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ──────────────────────────────────────────────
  // 1. Admin user
  // ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Hyl0115!", 12);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@dongnam.church" },
    update: { hashedPassword },
    create: {
      email: "admin@dongnam.church",
      hashedPassword,
      name: "관리자",
      role: "ADMIN",
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // ──────────────────────────────────────────────
  // 2. Default site settings
  // ──────────────────────────────────────────────
  const defaultSettings: Record<string, string> = {
    church_name: "동남 생명의 빛 교회",
    church_address: "충북 청주시 상당구 중고개로125번길 29",
    church_phone: "",
    pastor_name: "홍은익",
    vision: "하나님의 일을 성공시켜라",
    youtube_url: "https://www.youtube.com/@%EB%8F%99%EB%82%A8%EC%83%9D%EB%AA%85%EC%9D%98%EB%B9%9B%EA%B5%90%ED%9A%8C",
    blog_url: "https://blog.naver.com/hey0190",
    sunday_main_time: "주일 오전 11:00",
    sunday_afternoon_time: "주일 오후 2:00",
    wednesday_time: "수요일 저녁 7:30",
    friday_time: "금요일 저녁 8:00",
    special_time: "",
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log(`Site settings created: ${Object.keys(defaultSettings).length} entries`);

  // ──────────────────────────────────────────────
  // 3. Sample sermons
  // ──────────────────────────────────────────────
  const sermons = [
    {
      title: "믿음의 사람들이 걸어가는 길",
      scripture: "히브리서 11:1-6",
      sermonDate: new Date("2025-03-30"),
      serviceType: ServiceType.SUNDAY_MAIN,
      summary:
        "믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거입니다. 하나님을 기쁘시게 하는 믿음의 삶에 대해 살펴봅니다.",
      series: "믿음 시리즈",
      tags: "믿음,히브리서,신앙생활",
    },
    {
      title: "하나님의 일을 성공시키는 비결",
      scripture: "여호수아 1:7-9",
      sermonDate: new Date("2025-04-06"),
      serviceType: ServiceType.SUNDAY_MAIN,
      summary:
        "하나님께서 여호수아에게 주신 약속과 명령을 통해, 우리가 어떻게 하나님의 일을 성공시킬 수 있는지 배웁니다.",
      series: "여호수아 시리즈",
      tags: "여호수아,성공,순종",
    },
    {
      title: "성령의 열매를 맺는 삶",
      scripture: "갈라디아서 5:22-26",
      sermonDate: new Date("2025-04-13"),
      serviceType: ServiceType.SUNDAY_MAIN,
      summary:
        "성령의 아홉 가지 열매를 살펴보며, 성령 충만한 삶을 통해 열매를 맺어가는 그리스도인의 모습을 묵상합니다.",
      series: null,
      tags: "성령,열매,갈라디아서",
    },
  ];

  for (const sermon of sermons) {
    await prisma.sermon.create({ data: sermon });
  }
  console.log(`Sample sermons created: ${sermons.length} entries`);

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
