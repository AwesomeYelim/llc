# 인수인계 — 주보 예배일이 토요일로 표시되던 문제

> 작업 끝나면 이 파일은 지워도 됩니다.
> 보기 좋은 버전: https://claude.ai/code/artifact/efc4d685-6857-4ee1-bcfe-b8b76e647c42

원인 네 가지를 고쳐 **main 푸시와 배포까지 끝났고, 사이트 표시는 정상으로 확인**했습니다.
남은 건 Mac에서 실행해야 하는 **DB 백필**과, 저장소 밖에 있는 **파일서버 cron 점검**입니다.

| 항목 | 상태 | 비고 |
| --- | --- | --- |
| 코드 수정 | ✅ 완료 | 커밋 3개 |
| 테스트 / 타입체크 | ✅ 통과 | vitest 27 passed · tsc exit 0 |
| main 푸시 | ✅ 완료 | `a696b2b..701652a` |
| Vercel 배포 | ✅ 반영 확인 | 주보 상위 6건 모두 주일 (9/6, 8/30, 8/23, 8/16, 8/9, 8/2) |
| **기존 DB 백필** | ⏳ 대기 | Mac에서 실행 — 아래 1번 |
| **파일서버 cron** | ⏳ 대기 | 저장소 밖 — 아래 2번 |

---

## 무엇이 잘못돼 있었나

### 1. 표시 단계 타임존 — 주보 64건 전부가 토요일

`serviceDate`가 KST 자정(= 전날 `15:00Z`)으로 저장되는데, `formatDate`가
`getFullYear/getMonth/getDate`를 써서 실행 환경의 로컬 시간을 따랐습니다.
Vercel 런타임은 `TZ=UTC`라 `2026-09-05T15:00Z`가 그대로 9월 5일 토요일로 찍혔습니다.

`vercel.json`의 `regions: ["icn1"]`은 배포 리전일 뿐 런타임 타임존이 아닙니다.

→ 포맷을 `Asia/Seoul` 고정으로 변경. DB에 섞여 있는 두 저장 규약을 모두 같은 날짜로 표시합니다.

### 2. 주보 "N주" 계산 — 5번째 주일이 없는 달

`Math.min(firstSunday + (N-1)*7, 말일)` 때문에 4주뿐인 달의 `_5` 폴더가
토요일(말일)로 저장됐습니다. → 클램프 제거해 다음 달로 이어지게 했습니다.

### 3. 찬양 콘티 예배일 — 193건 중 153건이 평일

`sync-keynote.mjs`는 `birthtime`, `sync-local.mjs`는 `mtime`을 예배일로 썼습니다.
→ 해당 날짜가 속한 주일로 스냅.

바뀌는 153건의 원래 요일: 화 42 · 토 38 · 금 29 · 월 22 · 목 16 · 수 6

### 4. 파일명 유니코드 정규화 — 같은 주보가 2건

`202512_송구영신.zip`이 주보 레코드 2건으로 들어가 있습니다.
macOS 파일시스템이 돌려주는 **NFD**(자모 분리)와 파일서버 cron이 올린 **NFC**(완성형)가
바이트로 달라, `existingNames.has()` 중복 체크가 이미 있는 파일을 못 찾고 새로 만들었습니다.

```
#132  NFD  created 2026-04-26  12,586,435 bytes  ← 구 sync-local
#151  NFC  created 2026-05-24  12,585,873 bytes  ← 파일서버 cron
```

→ 비교를 NFC로 맞추는 `fileKey()`를 두고 주보 중복 체크와 콘티 조회 맵에 적용.
저장값은 안 건드립니다 — `fileName`은 다운로드 표시용이고 실제 내려받기는 `fileUrl`로 합니다.

콘티는 193건 전부 NFD로 저장돼 있고 조회도 NFD라 **아직 깨지진 않았습니다.**
다른 경로가 NFC로 올리는 순간 같은 일이 나서 미리 막아둔 것입니다.
(실데이터 193건을 디스크 NFD 이름으로 조회해 193/193 매칭 확인)

---

## Mac에서 할 일

### 1. 기존 DB 예배일 백필

배포는 *표시*만 고칩니다. 원인 2·3·4로 *저장 자체가* 틀린 레코드는 이 스크립트로 고칩니다.
기본이 dry-run이라 그냥 실행하면 바뀔 목록만 보여줍니다.

```bash
git pull

# 1) 무엇이 바뀌는지 확인 (DB 안 건드림)
npm run fix:dates

# 2) 확인했으면 반영 (트랜잭션, 전부 아니면 전무)
npm run fix:dates -- --apply
```

**⚠️ 되돌리기 장치가 없습니다.** `--apply`는 `serviceDate`를 덮어쓰고 중복 레코드를 삭제합니다.
이전 값을 어디에도 남기지 않아 자동 롤백이 불가능합니다. 실행 전에 백업을 뜨세요.

```bash
pg_dump "$DATABASE_URL" -t bulletins -t praise_contis \
  --data-only > ~/llc-servicedate-backup.sql
```

실서버 데이터로 미리 돌려본 결과 — **주보 3건**의 날짜가 바뀝니다:

| id | 전 | 후 | 제목 |
| --- | --- | --- | --- |
| #140 | 2026-02-28 (토) | 2026-03-01 (일) | 2026년 2월 5주 주보 |
| #137 | 2026-01-31 (토) | 2026-02-01 (일) | 2026년 1월 5주 주보 |
| #106 | 2025-05-31 (토) | 2025-06-01 (일) | 2025년 5월 5주 주보 |

그 밖에:

- 콘티 **153건**의 날짜가 바뀝니다.
- 주보 44건 · 콘티 40건은 **달력상 날짜 그대로**, 저장 시각만 KST 자정으로 통일됩니다.
- 중복 주보 **#132이 삭제**되고 #151이 남습니다 (첨부 파일은 `onDelete: Cascade`로 함께 삭제).
- 반영 후 주일이 아닌 레코드는 **송구영신 1건(12/31 수)뿐**이어야 합니다. 이건 정상입니다.

### 2. 파일서버 cron 스크립트 점검

**지금 주보를 실제로 올리는 건 이 저장소가 아닙니다.**
커밋 `f90ba51`에서 파일서버 cron + rclone 방식으로 옮겨갔고, 그 스크립트는
`138.2.119.220`에 있어 확인하지 못했습니다.
(최근 주보의 `createdAt`이 매일 `10:0x UTC`로 일정한 것도 cron 실행 흔적입니다.)

```bash
ssh ubuntu@138.2.119.220
crontab -l                       # 어떤 스크립트가 도는지
grep -rn "Math.min" ~/           # 같은 클램프가 있는지
```

- 같은 `Math.min(..., 말일)` 클램프가 있으면 **4주뿐인 달에 `_5` 폴더가 올라올 때 또 토요일이 됩니다.**
- 한글 라벨 폴더(`송구영신`, `종려주일` 등)를 NFC/NFD 구분 없이 비교하는지도 같이 보세요. 원인 4번이 여기서 났습니다.
- 고칠 땐 `scripts/lib/service-date.mjs`의 `parseBulletinFolderDate`와 `scripts/lib/filename.mjs`의 `fileKey`를 그대로 쓰면 됩니다.
- 2026-05 이후로는 5주가 실제로 존재하는 달만 있어서 아직 터지지 않았을 뿐입니다.

---

## 적용된 규칙

모두 `scripts/lib/` 아래에 모여 있습니다. 규칙을 바꾸려면 여기만 고치면 됩니다.

| 규칙 | 내용 | 근거 |
| --- | --- | --- |
| 주보 "N주" | 그 달의 N번째 주일. 없으면 **다음 달로 이어짐**<br>`202601_5` → `2026-02-01` | 실데이터 64건 중 60건에서 "N주 = N번째 주일"이 일관. `202601_5` 다음에 `202602_1`이, `202602_5` 다음에 `202603_1`이 없음 |
| 콘티 예배일 | 파일 날짜에서 가장 가까운 주일<br>일·월·화·수 → 직전 / 목·금·토 → 다음 | 월요일 파일은 어제 예배분, 금·토 파일은 내일 예배 준비분이라는 실제 작업 흐름 |
| 저장 시각 | KST 자정 (= 전날 `15:00Z`) | 현 파일서버 cron이 쓰는 규약에 맞춤. 구 UTC 자정 레코드도 표시는 동일 |
| 표시 | `Asia/Seoul` 고정 | 서버(UTC)·브라우저(임의 TZ) 어디서 렌더해도 같은 날짜 |
| 파일명 비교 | NFC 정규화 후 비교 (`fileKey()`) | macOS는 NFD, 파일서버 cron은 NFC. 정규화 없이 비교하면 같은 파일을 중복 등록 |

한국은 1988년 이후 서머타임이 없어 `+09:00` 고정 오프셋으로 계산합니다.
경계 케이스는 `tests/service-date.test.ts`와 `tests/filename.test.ts`에 27개로 잠가뒀습니다 —
연말 넘김, UTC 15:00 경계, 2025~2027 전 주차가 항상 주일인지, NFD/NFC 동치까지 포함.

---

## 바뀐 파일

**신규**

```
scripts/lib/service-date.mjs      KST 주일 계산 공용 모듈
scripts/lib/filename.mjs          파일명 NFC 정규화 (fileKey)
scripts/fix-service-dates.mjs     DB 백필 + 중복 정리 (dry-run 기본)
tests/service-date.test.ts        22 케이스
tests/filename.test.ts            5 케이스
.gitattributes                    셸 스크립트 LF 고정
```

**수정**

```
src/lib/utils.ts                  KST 고정 포맷 + toDateInputValue
scripts/sync-local.mjs            주보 파서 교체 · 콘티 주일 스냅 · 변경감지 createdAt · NFC 비교
scripts/sync-keynote.mjs          콘티 주일 스냅 · NFC 비교
.husky/pre-push                   맥 nvm 절대경로 → 머신 독립
src/app/admin/{bulletins,praise}/[id]/edit, sermons/edit
src/components/admin/{FileUploadForm,SermonForm}.tsx
package.json                      npm run fix:dates
```

관리자 `<input type="date">` 5곳도 `toISOString().split("T")[0]`(UTC)를 쓰고 있어,
수정 폼에서 저장만 눌러도 날짜가 하루 앞으로 밀렸습니다. 같이 고쳤습니다.

`sync-local.mjs`의 콘티 변경 감지가 `serviceDate(=mtime)` 비교였는데, 주일로 스냅하면
같은 주 안의 수정을 못 잡습니다. `sync-keynote.mjs`와 동일하게 `createdAt` vs `mtime`
기준으로 바꾸고 업데이트 시 `createdAt`을 갱신하도록 했습니다.

---

## 되돌려야 한다면

```bash
# 코드만 되돌리기
git revert 701652a 2ceee46 73ad9ec

# DB는 자동 롤백 없음 — 위에서 뜬 백업으로 복구
psql "$DATABASE_URL" < ~/llc-servicedate-backup.sql
```

---

## 관련 커밋

```
701652a  fix: NFD/NFC 파일명 차이로 같은 주보가 두 번 등록되던 문제
2ceee46  fix: pre-push 훅을 머신에 독립적으로 수정
73ad9ec  fix: 주보/콘티 예배일이 주일 대신 토요일로 표시되는 문제
```
