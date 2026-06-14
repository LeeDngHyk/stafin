# StaFin Mark II — 인터넷 배포 가이드

**구조**: Express 백엔드 하나가 **API(`/api/*`)와 Expo 웹 빌드(나머지 경로)를 같은 도메인에서 함께 서빙**합니다.
→ 서비스 1개, URL 1개. CORS·API주소 설정이 필요 없습니다.

> **DB는 영구 보존되는 Postgres**(Neon 등)를 사용합니다. 부팅 시 스키마 동기화 + (비어있으면) 시드가
> 자동 실행되고, 한 번 저장된 데이터는 재배포·재시작해도 그대로 유지됩니다.
> → 배포 전 **Postgres DB 1개 생성 + `DATABASE_URL` 등록**이 필요합니다(아래 0단계).

---

## 방법 A. Render.com (추천 · 무료 · 신용카드 불필요)

### 0단계 — Postgres DB 생성 (Neon, 무료) ★먼저
1) https://neon.tech 가입(GitHub 계정 가능) → **New Project** 생성
2) 프로젝트 생성 후 **Connection string**(연결 주소)을 복사
   - 형식: `postgresql://<user>:<password>@<host>/<db>?sslmode=require`
   - "Pooled"/"Direct" 중 **아무거나** 가능(단일 서버라 Direct 권장)
3) 이 주소를 잠시 보관 → 2단계에서 Render에 입력합니다.
> ⚠️ 연결 주소에는 비밀번호가 들어 있으니 **외부에 공유하지 마세요.**

### 1단계 — GitHub에 코드 올리기
GitHub 계정이 필요합니다. (없으면 github.com 에서 무료 가입)

1) https://github.com/new 에서 **빈 저장소** 생성 (예: `stafin-mk2`, Private 가능, README 체크 해제)
2) 로컬에서 푸시 (PowerShell, `S:\Workspace\stafin-mk2` 에서):
```powershell
git remote add origin https://github.com/<내아이디>/stafin-mk2.git
git branch -M main
git push -u origin main
```
> git 커밋은 제가 이미 만들어 두었습니다. 위 명령은 원격 연결 + 푸시만 합니다.
> 푸시 시 GitHub 로그인(브라우저/토큰)이 뜨면 본인 계정으로 인증하세요.

### 2단계 — Render에서 배포
1) https://render.com 가입 후 로그인 (GitHub 계정으로 가입하면 편함)
2) 대시보드 → **New +** → **Blueprint**
3) 방금 올린 `stafin-mk2` 저장소 선택 → Render가 `render.yaml`을 자동 인식
4) **`DATABASE_URL` 입력칸**이 나타납니다 → 0단계에서 복사한 Neon 연결 주소를 붙여넣기
5) **Apply** 클릭 → 빌드 시작 (Expo 웹 빌드 때문에 첫 배포는 5~10분 소요)
6) 완료되면 `https://stafin-mk2.onrender.com` 같은 **공개 URL**이 생깁니다 → 끝!
   - 부팅 시 Neon에 테이블이 자동 생성되고 시드가 들어갑니다. 이후 데이터는 영구 보존됩니다.

> 이미 배포돼 있다면: Render 대시보드 → 서비스 → **Environment** → `DATABASE_URL` 추가 → 저장하면
> 자동 재배포되며 Postgres로 전환됩니다.

### 참고
- **무료 플랜**은 15분 무접속 시 잠들고, 다음 접속 때 깨어나는 데 ~50초 걸립니다(콜드 스타트).
  단, 이제 DB는 Neon에 영구 저장되므로 **데이터는 사라지지 않습니다.**

---

## 방법 B. Docker (Fly.io / Railway / Cloud Run / VPS 등)

저장소에 `Dockerfile`이 있어 컨테이너 호스트 어디든 배포 가능합니다.

### Fly.io 예시 (CLI, GitHub 불필요)
```powershell
# 1) flyctl 설치
iwr https://fly.io/install.ps1 -useb | iex
# 2) 로그인(본인 계정, 결제수단 등록 필요)
fly auth login
# 3) S:\Workspace\stafin-mk2 에서
fly launch --dockerfile Dockerfile --internal-port 4000 --now
# 4) Postgres 연결 주소 등록 (Neon)
fly secrets set DATABASE_URL="postgresql://...?sslmode=require"
```
배포 후 `https://<앱이름>.fly.dev` URL이 생성됩니다.

### 로컬 Docker로 먼저 테스트
```powershell
docker build -t stafin .
docker run -p 4000:4000 -e DATABASE_URL="postgresql://...?sslmode=require" stafin
# → http://localhost:4000 접속
```

---

## 모바일 네이티브 앱으로 배포 (선택)

웹이 아닌 진짜 앱으로 내보내려면 **EAS(Expo Application Services)**를 씁니다.
```powershell
cd S:\Workspace\stafin-mk2\app
npm i -g eas-cli
eas login            # Expo 계정
eas build -p android # 또는 ios (ios는 Apple 개발자 계정 $99/년 필요)
```
- 이때 앱이 바라볼 백엔드 주소를 환경변수로 지정하세요:
  `app/.env` 에 `EXPO_PUBLIC_API_URL=https://stafin-mk2.onrender.com`
- 스토어 출시는 Google Play($25 1회) / Apple($99/년) 계정과 심사가 필요합니다.

---

## DB 관리 / 로컬 개발

DB는 Postgres(Neon)입니다. 데이터를 직접 보고/수정하려면:

- **Neon 대시보드**: 웹 SQL 콘솔에서 바로 조회·편집
- **Prisma Studio**(엑셀형 GUI): `server/.env` 에 `DATABASE_URL`을 넣고
  ```powershell
  cd S:\Workspace\stafin-mk2\server
  npm run db:studio      # http://localhost:5555
  ```
- **시드/초기화**: `npm run db:seed`(비어있으면 주입) · `npm run db:reset`(전체 비우고 재생성+시드)

> 로컬에서 서버를 돌리려면(`npm run dev`) `server/.env` 에 `DATABASE_URL`이 필요합니다.
> (`.env.example` 참고. Neon에서 dev용 브랜치를 따로 만들면 운영 데이터와 분리할 수 있어요.)

---

## 체크리스트
- [ ] Neon에서 Postgres 생성 → 연결 주소 확보
- [ ] `git push` 로 GitHub에 올림
- [ ] Render Blueprint 배포 시 `DATABASE_URL` 입력 → 공개 URL 확인
- [ ] URL 접속 → 온보딩(진단 11문항) → 메인 3탭 동작 확인
- [ ] 재배포 후에도 데이터 유지되는지 확인(영구 보존)
- [ ] (선택) 커스텀 도메인 연결 (Render → Settings → Custom Domain)
