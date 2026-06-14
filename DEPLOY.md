# StaFin Mark II — 인터넷 배포 가이드

**구조**: Express 백엔드 하나가 **API(`/api/*`)와 Expo 웹 빌드(나머지 경로)를 같은 도메인에서 함께 서빙**합니다.
→ 서비스 1개, URL 1개. CORS·API주소 설정이 필요 없습니다.

> 부팅 시 DB 스키마 생성 + 시드가 자동 실행됩니다. (무료 플랜의 SQLite는 휘발성이라 재시작 시 데이터가
> 초기화되지만, 정적 데이터는 매번 자동 재시드되고 손님 데이터는 익명이라 데모에 문제없습니다.)

---

## 방법 A. Render.com (추천 · 무료 · 신용카드 불필요)

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
4) **Apply** 클릭 → 빌드 시작 (Expo 웹 빌드 때문에 첫 배포는 5~10분 소요)
5) 완료되면 `https://stafin-mk2.onrender.com` 같은 **공개 URL**이 생깁니다 → 끝!

### 참고
- **무료 플랜**은 15분 무접속 시 잠들고, 다음 접속 때 깨어나는 데 ~50초 걸립니다(콜드 스타트).
- 데이터 영구 저장이 필요하면 아래 "Postgres 전환"을 참고하세요.

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
```
배포 후 `https://<앱이름>.fly.dev` URL이 생성됩니다.

### 로컬 Docker로 먼저 테스트
```powershell
docker build -t stafin .
docker run -p 4000:4000 stafin
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

## 데이터 영구 저장 — Postgres 전환 (선택)

무료 플랜 SQLite의 휘발성이 싫다면 Postgres로 바꾸면 됩니다.
1) Neon(neon.tech) 또는 Render Postgres에서 무료 DB 생성 → 연결 문자열 복사
2) `server/prisma/schema.prisma` 의 datasource 수정:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
3) 호스트 환경변수에 `DATABASE_URL` 등록
4) 재배포 (부팅 시 `prisma db push` + 시드가 자동 수행)

---

## 체크리스트
- [ ] `git push` 로 GitHub에 올림
- [ ] Render Blueprint로 배포 → 공개 URL 확인
- [ ] URL 접속 → 온보딩(진단 11문항) → 메인 3탭 동작 확인
- [ ] (선택) 커스텀 도메인 연결 (Render → Settings → Custom Domain)
