# 동남생명의빛교회 홈페이지

> **배포 URL**: [https://llc-beta.vercel.app](https://llc-beta.vercel.app)
>
> **GitHub**: [https://github.com/AwesomeYelim/llc](https://github.com/AwesomeYelim/llc)

**동남생명의빛교회**(충북 청주시 상당구)의 공식 홈페이지입니다.
설교 영상, 찬양 콘티, 주보/PPT, 설교 원고(칼럼), 갤러리 등 교회 콘텐츠를 관리하고 성도들에게 제공하기 위한 풀스택 웹 애플리케이션입니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | Next.js 16 (App Router) |
| **언어** | TypeScript 5 |
| **스타일링** | Tailwind CSS 4 |
| **애니메이션** | Framer Motion 12 |
| **데이터베이스** | PostgreSQL |
| **ORM** | Prisma 6 |
| **인증** | Auth.js (next-auth) v5 beta |
| **파일 저장소** | Vercel Blob |
| **리치 텍스트 에디터** | Tiptap 3 |
| **런타임** | React 19, Node.js 20+ |
| **폰트** | Pretendard Variable, Noto Serif KR |

---

## 사전 요구사항

- **Node.js** 20 이상
- **npm** (Node.js에 포함)
- **PostgreSQL** 데이터베이스 (로컬 또는 클라우드 -- Neon, Supabase, Railway 등)
- **Vercel Blob** 스토리지 토큰 (파일 업로드용)

---

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd llc
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 변수를 설정합니다.

```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/dongnam_church"

# Auth.js
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob (파일 업로드)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxx"
```

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `NEXTAUTH_SECRET` | Auth.js 세션 암호화에 사용되는 비밀 키. `openssl rand -base64 32`로 생성 가능 |
| `NEXTAUTH_URL` | 사이트 기본 URL. 로컬 개발 시 `http://localhost:3000` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 읽기/쓰기 토큰. Vercel 대시보드에서 발급 |

### 3. 의존성 설치

```bash
npm install
```

> `postinstall` 스크립트가 자동으로 `prisma generate`를 실행합니다.

### 4. 데이터베이스 초기화

```bash
npx prisma db push
```

### 5. 시드 데이터 생성

기본 관리자 계정, 사이트 설정, 샘플 설교 데이터를 생성합니다.

```bash
npm run db:seed
```

### 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

---

## 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (hot reload) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 코드 검사 |
| `npm run db:push` | Prisma 스키마를 데이터베이스에 반영 |
| `npm run db:seed` | 시드 데이터 생성 |
| `npm run db:migrate` | Prisma 마이그레이션 배포 |

---

## 프로젝트 구조

```
llc/
├── prisma/
│   ├── schema.prisma          # 데이터베이스 스키마 정의
│   └── seed.ts                # 시드 데이터 (관리자, 설정, 샘플 설교)
├── public/                    # 정적 파일
├── src/
│   ├── app/
│   │   ├── (public)/          # 공개 페이지 (Route Group)
│   │   │   ├── about/         #   교회 소개
│   │   │   ├── sermons/       #   설교 목록 및 상세
│   │   │   ├── blog/          #   블로그
│   │   │   ├── praise/        #   찬양 콘티
│   │   │   ├── bulletin/      #   주보/PPT
│   │   │   └── columns/       #   설교 원고(칼럼) 목록 및 상세
│   │   ├── admin/             # 관리자 페이지
│   │   │   ├── login/         #   로그인
│   │   │   ├── dashboard/     #   대시보드
│   │   │   ├── sermons/       #   설교 CRUD
│   │   │   ├── praise/        #   찬양 콘티 관리
│   │   │   ├── bulletins/     #   주보/PPT 관리
│   │   │   ├── columns/       #   설교 원고 관리
│   │   │   ├── gallery/       #   갤러리 관리
│   │   │   └── settings/      #   사이트 설정
│   │   ├── api/               # API 라우트
│   │   │   ├── auth/          #   NextAuth 인증
│   │   │   ├── sermons/       #   설교 API
│   │   │   ├── praise/        #   찬양 콘티 API
│   │   │   ├── bulletins/     #   주보 API
│   │   │   ├── columns/       #   칼럼 API
│   │   │   ├── gallery/       #   갤러리 API
│   │   │   ├── settings/      #   사이트 설정 API
│   │   │   ├── upload/        #   파일 업로드 (Vercel Blob)
│   │   │   └── page-views/    #   페이지 조회수
│   │   ├── page.tsx           # 랜딩 페이지 (홈)
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── sitemap.ts         # 사이트맵 생성
│   │   └── robots.ts          # robots.txt 생성
│   ├── components/
│   │   ├── admin/             # 관리자 전용 컴포넌트
│   │   │   ├── SermonForm.tsx
│   │   │   ├── ColumnForm.tsx
│   │   │   ├── FileUploadForm.tsx
│   │   │   ├── RichTextEditor.tsx
│   │   │   └── DeleteButton.tsx
│   │   ├── landing/           # 랜딩 페이지 섹션 컴포넌트
│   │   │   ├── Hero.tsx
│   │   │   ├── BrandMessage.tsx
│   │   │   ├── ServiceTimes.tsx
│   │   │   ├── RecentSermons.tsx
│   │   │   ├── KakaoMap.tsx
│   │   │   ├── QuickLinks.tsx
│   │   │   └── CTA.tsx
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   └── AdminSidebar.tsx
│   │   ├── seo/               # SEO 컴포넌트
│   │   │   └── JsonLd.tsx
│   │   └── ui/                # 공통 UI 컴포넌트
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── FileUpload.tsx
│   │       ├── Badge.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── Pagination.tsx
│   └── lib/
│       ├── auth.ts            # Auth.js 설정
│       ├── prisma.ts          # Prisma 클라이언트 싱글톤
│       ├── seo.ts             # SEO 상수 및 유틸
│       └── utils.ts           # 유틸리티 함수
├── .env                       # 환경 변수 (git에 포함하지 않음)
├── next.config.ts             # Next.js 설정
├── tsconfig.json              # TypeScript 설정
└── package.json
```

---

## 데이터베이스 모델

| 모델 | 설명 |
|------|------|
| `Admin` | 관리자 계정 (이메일, 해시된 비밀번호) |
| `Sermon` | 설교 (제목, 성경 구절, 날짜, 예배 유형, 유튜브 URL, 시리즈, 태그) |
| `Column` | 설교 원고/칼럼 (제목, 본문 HTML, 연결 설교, 커버 이미지) |
| `PraiseConti` | 찬양 콘티 파일 (제목, 날짜, 파일 URL, 다운로드 수) |
| `Bulletin` | 주보/PPT (제목, 날짜, 유형) |
| `BulletinFile` | 주보 첨부 파일 (파일 URL, 다운로드 수) |
| `GalleryImage` | 갤러리 이미지 (URL, 제목, 카테고리, 정렬 순서) |
| `SiteSetting` | 사이트 설정 (key-value 형태) |
| `PageView` | 페이지 조회 기록 |

---

## 배포 (Vercel)

이 프로젝트는 [Vercel](https://vercel.com)에 최적화되어 있습니다.

### 배포 순서

1. GitHub 저장소를 Vercel에 연결합니다.
2. Vercel 대시보드에서 환경 변수를 설정합니다:
   - `DATABASE_URL` -- PostgreSQL 연결 문자열 (Neon, Supabase 등)
   - `NEXTAUTH_SECRET` -- 세션 암호화 키
   - `NEXTAUTH_URL` -- 배포된 사이트 URL (예: `https://dongnam.church`)
   - `BLOB_READ_WRITE_TOKEN` -- Vercel Blob 토큰 (Vercel Storage 탭에서 생성)
3. 배포 후 Vercel 콘솔이나 로컬에서 시드 데이터를 실행합니다:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### Vercel Blob 설정

파일 업로드(찬양 콘티, 주보, 갤러리 이미지) 기능을 사용하려면 Vercel Blob 스토리지가 필요합니다:

1. Vercel 대시보드 > Storage 탭에서 Blob 스토어를 생성합니다.
2. 생성된 `BLOB_READ_WRITE_TOKEN`을 환경 변수에 추가합니다.

---

## 주요 기능

- **랜딩 페이지** -- 히어로 배너, 비전 메시지, 예배 시간, 최근 설교, 카카오맵, 빠른 링크
- **설교 관리** -- 설교 등록/수정/삭제, 유튜브 영상 연동, 시리즈 및 태그 분류
- **설교 원고(칼럼)** -- Tiptap 리치 텍스트 에디터로 설교 원고 작성 및 발행
- **찬양 콘티** -- PDF/HWP/DOCX 파일 업로드 및 다운로드
- **주보/PPT** -- 주보 및 예배 PPT 파일 업로드 및 다운로드
- **갤러리** -- 교회 사진 업로드 및 카테고리별 관리
- **사이트 설정** -- 교회 정보, 예배 시간, 유튜브/블로그 URL 등 동적 설정
- **SEO** -- 사이트맵, robots.txt, JSON-LD 구조화 데이터, Open Graph 메타태그
- **반응형 디자인** -- 모바일/태블릿/데스크톱 대응

---

## 라이선스

이 프로젝트는 동남생명의빛교회를 위해 제작되었습니다.
