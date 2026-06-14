# StaFin Mark II

하나은행 기반 2030 세대용 핀테크 앱. 시사/뉴스 소비 **행동**을 추적해 투자 성향을 **동적으로**
예측하고, 적합성·적정성 원칙에 맞는 금융상품/포트폴리오를 추천한다. 마스코트는 별 모양 캐릭터 **StaFin**.

> 기획서 `StaFin Mark II 기획서.pdf`, 개발 명세서 `StaFin MK2 개발 명세서.xlsx`, IA 스크린샷, 시뮬레이터
> `stafin_mark2_simulator.html` 의 모든 요구사항을 누락 없이 반영했다.

## 구조 (모노레포)

```
stafin-mk2/
├─ server/   Express + TypeScript + Prisma + SQLite  (REST API + AI 동적 성향 엔진)
└─ app/      Expo (React Native) + TypeScript         (모바일 앱)
```

## 빠른 시작

### 1) 백엔드

```bash
cd server
npm install
npm run db:reset      # 스키마 생성 + 시드 데이터 주입
npm run dev           # http://localhost:4000
```

### 2) 앱 (Expo)

```bash
cd app
npm install
npm run start         # Expo Dev Server (QR → Expo Go, 또는 w 키로 웹)
```

자세한 실행/검증 절차는 `RUNBOOK.md` 참고.
