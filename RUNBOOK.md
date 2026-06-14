# StaFin Mark II — 실행 & 검증 RUNBOOK

직접 실행하실 수 있도록 절차를 순서대로 정리했습니다. (Windows / PowerShell 기준)

## 0. 사전 준비
- Node.js 18+ (현재 환경 v24 확인됨)
- 모바일에서 볼 경우: 휴대폰에 **Expo Go** 앱 설치 (App Store / Play Store)

## 1. 백엔드 실행

```powershell
cd S:\Workspace\stafin-mk2\server
npm install            # 최초 1회
npm run db:reset       # DB 생성 + 시드 데이터 (최초 1회 또는 데이터 초기화 시)
npm run dev            # http://localhost:4000  (코드 수정 시 자동 재시작)
```

확인: 브라우저에서 http://localhost:4000/api/health → `{"ok":true,...}`

## 2. 앱 실행

```powershell
cd S:\Workspace\stafin-mk2\app
npm install            # 최초 1회
npm run start          # Expo Dev Server
```

이후 터미널에서:
- **웹으로 보기**: `w` 키 → 브라우저에서 모바일 프레임으로 실행
- **휴대폰으로 보기**: 터미널의 QR 코드를 Expo Go로 스캔
  - 이때 앱이 백엔드(localhost:4000)에 접속하려면 PC와 폰이 같은 Wi-Fi여야 하고,
    `app/lib/api.ts`의 `API_BASE`를 PC의 LAN IP(예: `http://192.168.0.10:4000`)로 바꿔야 합니다.
    (웹 실행 시에는 localhost 그대로 동작)

## 3. 데모 시나리오 (전체 플로우 체험)

1. 앱 진입 → (신규 손님) **초기 투자 성향 진단 안내**
2. **11문항 진단** → StaFin 캐릭터 애니메이션, 다음/이전
3. **결과 등급** + 투자 가능 상품 안내
4. **관심 시사 선택**(복수) → StaFin 입장
5. **전일 시사 요약**(관심 Top3 섹터 × 전일 Top5) → 날짜 계기판 애니 → 메인
6. **핫 트랜드**: 필수 시사 5개(N/5) + 금융팁, 좌우 스와이프=불호(가중치↓)/아래=호감, 무제한 시사
7. **MyFin**: 성향 계기판, (안전 시사를 깊게 읽으면) **±1 등급 변동 시 조정 팝업**, 테마 상품관
8. **맞춤 포트폴리오**: 유명 포폴 → 투자목표 설정 → 나만의 포폴 + 시사 선호 반영 제안 → 예상 결과

> 온보딩을 다시 보려면 MyFin 화면 하단의 **"데모 초기화"** 버튼을 누르면 신규 손님 상태로 돌아갑니다.

## 4. Google Stitch MCP (선택)
이미 `claude mcp add stitch ...`로 등록했습니다. **Claude Code를 재시작**하면 도구가 활성화됩니다.
⚠️ 공유해주신 API 키가 평문으로 노출되어 있으니 **재발급(폐기 후 새 키 발급)**을 권장합니다.
