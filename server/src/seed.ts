// StaFin Mark II — 시드 데이터
// 7개 섹터, 11개 진단 문항, 전일/당일 시사, 금융 상품, 유명 포트폴리오, 금융팁
import { pathToFileURL } from "url";
import { prisma } from "./db.js";

// 오전 7시 기준 일자 계산과 동일한 포맷 사용
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}
const TODAY = new Date();
const YESTERDAY = new Date(TODAY.getTime() - 24 * 3600 * 1000);
const TODAY_STR = ymd(TODAY);
const YESTERDAY_STR = ymd(YESTERDAY);

// ── 1) 섹터 7개 (시사 카테고리 = 투자 섹터). riskBias: 1=공격 ~ 5=안정 ──
const SECTORS = [
  { id: 1, slug: "semi", name: "반도체·AI", emoji: "🤖", riskBias: 2.0, hotScore: 98, returnRate: 24.5, description: "AI 가속기·HBM·파운드리 등 기술 성장 섹터" },
  { id: 2, slug: "battery", name: "2차전지·친환경", emoji: "🔋", riskBias: 2.2, hotScore: 86, returnRate: 18.2, description: "전기차 배터리·신재생에너지·ESS" },
  { id: 3, slug: "bio", name: "바이오·헬스케어", emoji: "🧬", riskBias: 1.8, hotScore: 74, returnRate: 21.0, description: "신약·의료기기·디지털 헬스케어" },
  { id: 4, slug: "finance", name: "금융·은행", emoji: "🏦", riskBias: 3.8, hotScore: 81, returnRate: 9.4, description: "은행·보험·증권 및 금리 정책" },
  { id: 5, slug: "realestate", name: "부동산·건설", emoji: "🏗️", riskBias: 3.5, hotScore: 69, returnRate: 7.1, description: "리츠(REITs)·건설·부동산 정책" },
  { id: 6, slug: "consumer", name: "소비재·유통", emoji: "🛍️", riskBias: 3.2, hotScore: 64, returnRate: 11.3, description: "필수소비재·리테일·엔터·여행" },
  { id: 7, slug: "crypto", name: "가상자산·원자재", emoji: "₿", riskBias: 1.2, hotScore: 92, returnRate: 41.0, description: "비트코인·금·원유 등 고변동 자산" },
];

// ── 2) 진단 문항 11개 (하나은행 스타일 적합성 진단) ──
// option.stability: 1=가장 공격적 선택 ~ 5=가장 안정적 선택
const QUESTIONS = [
  {
    order: 1,
    title: "손님의 연령대는 어떻게 되시나요?",
    helper: "투자 가능 기간을 가늠하기 위한 질문이에요.",
    animation: "wave",
    options: [
      { label: "19세 이하", stability: 1 },
      { label: "20~40세", stability: 2 },
      { label: "41~50세", stability: 3 },
      { label: "51~60세", stability: 4 },
      { label: "61세 이상", stability: 5 },
    ],
  },
  {
    order: 2,
    title: "투자하려는 자금의 투자 가능 기간은?",
    helper: "오래 묻어둘수록 변동성을 견딜 여력이 커져요.",
    animation: "clock",
    options: [
      { label: "6개월 이내", stability: 5 },
      { label: "6개월~1년", stability: 4 },
      { label: "1~2년", stability: 3 },
      { label: "2~3년", stability: 2 },
      { label: "3년 이상", stability: 1 },
    ],
  },
  {
    order: 3,
    title: "전체 자산 중 투자자산의 비중은 어느 정도인가요?",
    helper: "별 4마리 중 몇 마리가 투자에 나설지 보여드릴게요!",
    animation: "split4",
    options: [
      { label: "10% 이하", stability: 5 },
      { label: "10~20%", stability: 4 },
      { label: "20~30%", stability: 3 },
      { label: "30~40%", stability: 2 },
      { label: "40% 초과", stability: 1 },
    ],
  },
  {
    order: 4,
    title: "투자 경험이 있는 금융 상품을 모두 떠올려 본다면?",
    helper: "경험이 많을수록 위험을 다룰 줄 아신다는 뜻이에요.",
    animation: "think",
    options: [
      { label: "예·적금만", stability: 5 },
      { label: "채권·펀드(원금보존형)", stability: 4 },
      { label: "주식·ETF", stability: 3 },
      { label: "ELS·DLS 등 파생결합", stability: 2 },
      { label: "선물·옵션·가상자산", stability: 1 },
    ],
  },
  {
    order: 5,
    title: "금융 상품에 대한 지식 수준은?",
    helper: "솔직하게 골라주셔도 괜찮아요.",
    animation: "book",
    options: [
      { label: "거의 없음", stability: 5 },
      { label: "기초 수준", stability: 4 },
      { label: "일반적 수준", stability: 3 },
      { label: "상당히 높음", stability: 2 },
      { label: "전문가 수준", stability: 1 },
    ],
  },
  {
    order: 6,
    title: "기대하는 연 수익률과 감내 가능한 손실은?",
    helper: "하이리스크 하이리턴, StaFin의 눈에 불꽃이 켜질까요?",
    animation: "fire",
    options: [
      { label: "원금 보존 최우선", stability: 5 },
      { label: "예금금리 +2%p, 손실 -5%까지", stability: 4 },
      { label: "연 8%, 손실 -15%까지", stability: 3 },
      { label: "연 15%, 손실 -30%까지", stability: 2 },
      { label: "연 30%+, 큰 손실도 감수", stability: 1 },
    ],
  },
  {
    order: 7,
    title: "투자 원금에 손실이 발생한다면 어떻게 하시겠어요?",
    helper: "위기 상황에서의 마음가짐을 알려주세요.",
    animation: "shield",
    options: [
      { label: "절대 손실은 안 된다", stability: 5 },
      { label: "원금의 -10%까지는 감내", stability: 4 },
      { label: "-20%까지는 감내", stability: 3 },
      { label: "-30%까지는 감내", stability: 2 },
      { label: "기대수익이 크면 -50%도 감수", stability: 1 },
    ],
  },
  {
    order: 8,
    title: "수입원은 어떻게 구성되어 있나요?",
    helper: "안정적 현금흐름은 투자 여력의 바탕이에요.",
    animation: "coin",
    options: [
      { label: "일정한 급여, 향후 유지/증가", stability: 2 },
      { label: "일정한 급여, 향후 감소 예상", stability: 3 },
      { label: "일정치 않은 수입", stability: 4 },
      { label: "연금 등 고정 수입", stability: 5 },
      { label: "현재 수입 없음", stability: 5 },
    ],
  },
  {
    order: 9,
    title: "이번 투자 자금의 성격은?",
    helper: "여유자금일수록 더 적극적으로 운용할 수 있어요.",
    animation: "wallet",
    options: [
      { label: "당장 필요한 생활비", stability: 5 },
      { label: "곧 쓸 목적자금", stability: 4 },
      { label: "1~2년 뒤 목적자금", stability: 3 },
      { label: "여유자금", stability: 2 },
      { label: "장기 여유·노후 외 자금", stability: 1 },
    ],
  },
  {
    order: 10,
    title: "시장이 급락할 때 손님의 반응에 가까운 것은?",
    helper: "선택지를 따라 StaFin의 눈동자가 움직여요.",
    animation: "eyes",
    options: [
      { label: "바로 전량 매도한다", stability: 5 },
      { label: "일부 줄인다", stability: 4 },
      { label: "지켜본다", stability: 3 },
      { label: "추가 매수 기회를 본다", stability: 2 },
      { label: "공격적으로 저점 매수한다", stability: 1 },
    ],
  },
  {
    order: 11,
    title: "마지막으로, 투자에서 가장 중요하게 생각하는 가치는?",
    helper: "StaFin이 손님의 방향을 기억할게요.",
    animation: "star",
    options: [
      { label: "원금의 안전성", stability: 5 },
      { label: "안정 속 약간의 추가 수익", stability: 4 },
      { label: "위험과 수익의 균형", stability: 3 },
      { label: "높은 수익 추구", stability: 2 },
      { label: "최대 수익, 큰 변동성 수용", stability: 1 },
    ],
  },
];

// ── 3) 금융팁 ──
const FINTIPS = [
  { name: "파킹통장", summary: "하루만 맡겨도 이자가 붙는 수시입출금 통장", detail: "파킹통장은 자유롭게 입출금하면서 일반 입출금통장보다 높은 금리를 주는 상품이에요. 비상금이나 투자 대기자금을 잠깐 넣어두기 좋아요. 단, 한도 초과분은 금리가 낮아질 수 있으니 우대 조건을 꼭 확인하세요." },
  { name: "CMA(종합자산관리계좌)", summary: "증권사 입출금 계좌, 하루만 넣어도 수익", detail: "CMA는 증권사에서 만드는 입출금이 자유로운 계좌예요. RP형·발행어음형 등이 있고, 예치한 자금을 단기 채권 등에 운용해 매일 수익을 지급해요. 예금자보호 여부는 유형에 따라 다르니 가입 전 확인이 필요해요." },
  { name: "ISA(개인종합자산관리계좌)", summary: "한 계좌로 여러 상품, 세제 혜택까지", detail: "ISA는 예금·펀드·ETF·국내주식 등을 한 계좌에 담아 운용하고, 순이익에서 일정 한도까지 비과세·분리과세 혜택을 받는 절세 계좌예요. 의무가입기간(3년)을 채우면 혜택이 커져요." },
  { name: "달러 분산투자", summary: "환율 변동에 대비하는 통화 분산", detail: "자산의 일부를 달러로 보유하면 원화 약세 구간에서 방어력이 생겨요. 달러 RP, 달러 예금, 미국 국채 ETF 등으로 접근할 수 있고, 환전 수수료와 환율 흐름을 함께 고려해야 해요." },
  { name: "정기적금 풍차돌리기", summary: "매달 새 적금을 굴려 유동성과 금리 둘 다", detail: "매달 1년짜리 적금을 새로 가입해 12개를 만드는 전략이에요. 1년 뒤부터 매달 만기가 돌아와 유동성을 확보하면서 적금 금리 혜택도 누릴 수 있어요." },
];

// ── 4) 유명 포트폴리오 ──
const PORTFOLIOS = [
  {
    name: "올웨더 포트폴리오",
    tagline: "어떤 경제 국면에도 견디는 사계절 전략",
    description: "레이 달리오가 제안한 전략으로 주식·장기채·중기채·금·원자재에 분산해 경기 사이클 어디서든 큰 손실을 피하도록 설계됐어요.",
    stability: 88,
    expectedReturn: 7.5,
    riskGrade: 4,
    composition: [
      { asset: "주식 ETF", percent: 30, sectorSlug: "semi" },
      { asset: "장기국채", percent: 40, sectorSlug: "finance" },
      { asset: "중기국채", percent: 15, sectorSlug: "finance" },
      { asset: "금", percent: 7.5, sectorSlug: "crypto" },
      { asset: "원자재", percent: 7.5, sectorSlug: "crypto" },
    ],
    backtest: [
      { year: 2019, value: 100 }, { year: 2020, value: 112 }, { year: 2021, value: 118 },
      { year: 2022, value: 109 }, { year: 2023, value: 121 }, { year: 2024, value: 133 },
    ],
  },
  {
    name: "영구 포트폴리오",
    tagline: "주식·채권·금·현금 4등분의 단순함",
    description: "해리 브라운의 전략으로 4개 자산에 25%씩 균등 배분해요. 단순하지만 위기 방어력이 뛰어나 초보 투자자에게 인기예요.",
    stability: 90,
    expectedReturn: 6.2,
    riskGrade: 4,
    composition: [
      { asset: "주식 ETF", percent: 25, sectorSlug: "consumer" },
      { asset: "장기국채", percent: 25, sectorSlug: "finance" },
      { asset: "금", percent: 25, sectorSlug: "crypto" },
      { asset: "현금성(CMA)", percent: 25, sectorSlug: "finance" },
    ],
    backtest: [
      { year: 2019, value: 100 }, { year: 2020, value: 109 }, { year: 2021, value: 114 },
      { year: 2022, value: 108 }, { year: 2023, value: 117 }, { year: 2024, value: 126 },
    ],
  },
  {
    name: "코어-새틀라이트 성장형",
    tagline: "안정 코어 + 테마 위성으로 초과수익",
    description: "자산의 70%를 시장 전체 ETF(코어)에 두고 30%를 반도체·2차전지 등 성장 테마(위성)에 배분해 안정성과 수익을 함께 노려요.",
    stability: 62,
    expectedReturn: 14.0,
    riskGrade: 2,
    composition: [
      { asset: "S&P500 ETF", percent: 45, sectorSlug: "consumer" },
      { asset: "국내 대표 ETF", percent: 25, sectorSlug: "finance" },
      { asset: "반도체·AI 테마", percent: 18, sectorSlug: "semi" },
      { asset: "2차전지 테마", percent: 12, sectorSlug: "battery" },
    ],
    backtest: [
      { year: 2019, value: 100 }, { year: 2020, value: 128 }, { year: 2021, value: 150 },
      { year: 2022, value: 121 }, { year: 2023, value: 158 }, { year: 2024, value: 192 },
    ],
  },
  {
    name: "공격형 모멘텀",
    tagline: "성장·가상자산 중심 고변동 고수익",
    description: "반도체·AI·가상자산 등 고성장·고변동 자산에 집중해 큰 수익을 노리는 공격형 전략이에요. 변동성이 매우 큽니다.",
    stability: 35,
    expectedReturn: 26.0,
    riskGrade: 1,
    composition: [
      { asset: "반도체·AI 테마", percent: 35, sectorSlug: "semi" },
      { asset: "가상자산", percent: 25, sectorSlug: "crypto" },
      { asset: "바이오 테마", percent: 20, sectorSlug: "bio" },
      { asset: "2차전지 테마", percent: 20, sectorSlug: "battery" },
    ],
    backtest: [
      { year: 2019, value: 100 }, { year: 2020, value: 145 }, { year: 2021, value: 188 },
      { year: 2022, value: 121 }, { year: 2023, value: 176 }, { year: 2024, value: 244 },
    ],
  },
  {
    name: "안심 인컴 포트폴리오",
    tagline: "예적금·CMA·배당으로 또박또박 현금흐름",
    description: "예적금·CMA·고배당주·리츠로 구성해 변동성을 최소화하고 꾸준한 현금흐름을 추구하는 안정형 전략이에요.",
    stability: 95,
    expectedReturn: 4.8,
    riskGrade: 5,
    composition: [
      { asset: "정기예금", percent: 35, sectorSlug: "finance" },
      { asset: "CMA", percent: 25, sectorSlug: "finance" },
      { asset: "고배당주", percent: 20, sectorSlug: "consumer" },
      { asset: "리츠(REITs)", percent: 20, sectorSlug: "realestate" },
    ],
    backtest: [
      { year: 2019, value: 100 }, { year: 2020, value: 104 }, { year: 2021, value: 108 },
      { year: 2022, value: 110 }, { year: 2023, value: 115 }, { year: 2024, value: 121 },
    ],
  },
];

// ── 5) 금융 상품 (테마 상품관) ──
// riskLevel: 5=매우낮음 ~ 1=매우높음, minRating: 권유 가능 최소 공격성 등급(낮을수록 공격 상품)
type ProdSeed = { name: string; type: string; sector: string; riskLevel: number; minRating: number; returnRate: number; popularity: number; description: string };
const PRODUCTS: ProdSeed[] = [
  { name: "하나 더 적금", type: "예적금", sector: "finance", riskLevel: 5, minRating: 5, returnRate: 3.8, popularity: 95, description: "원금이 보장되는 정기적금. 안정형 손님의 기본기예요." },
  { name: "하나 CMA Note", type: "CMA", sector: "finance", riskLevel: 5, minRating: 5, returnRate: 3.5, popularity: 88, description: "하루만 맡겨도 이자가 붙는 입출금 자유 계좌." },
  { name: "단기채 인컴 펀드", type: "펀드", sector: "finance", riskLevel: 4, minRating: 4, returnRate: 5.2, popularity: 72, description: "우량 단기채권에 투자해 변동성이 낮은 인컴형 펀드." },
  { name: "코스피200 ETF", type: "ETF", sector: "finance", riskLevel: 3, minRating: 3, returnRate: 9.0, popularity: 84, description: "국내 대표 200개 기업에 분산 투자하는 ETF." },
  { name: "글로벌 리츠 ETF", type: "ETF", sector: "realestate", riskLevel: 3, minRating: 3, returnRate: 7.4, popularity: 61, description: "전 세계 부동산 리츠에 투자해 배당을 추구." },
  { name: "필수소비재 배당주 펀드", type: "펀드", sector: "consumer", riskLevel: 3, minRating: 3, returnRate: 8.1, popularity: 58, description: "경기 방어적인 소비재 배당주 중심 펀드." },
  { name: "반도체 코어 ETF", type: "ETF", sector: "semi", riskLevel: 2, minRating: 2, returnRate: 24.5, popularity: 97, description: "AI·HBM 수요로 성장하는 반도체 섹터 집중 ETF." },
  { name: "2차전지 테마 ETF", type: "ETF", sector: "battery", riskLevel: 2, minRating: 2, returnRate: 18.2, popularity: 79, description: "전기차·ESS 밸류체인에 투자하는 테마 ETF." },
  { name: "바이오 혁신 펀드", type: "펀드", sector: "bio", riskLevel: 2, minRating: 2, returnRate: 21.0, popularity: 66, description: "신약 파이프라인 보유 바이오 기업에 투자." },
  { name: "글로벌 성장주 ELS", type: "ELS", sector: "semi", riskLevel: 2, minRating: 2, returnRate: 16.0, popularity: 70, description: "기초자산 조건 충족 시 약정 수익을 주는 파생결합증권." },
  { name: "비트코인 현물 ETF", type: "ETF", sector: "crypto", riskLevel: 1, minRating: 1, returnRate: 41.0, popularity: 93, description: "비트코인 가격을 추종하는 고변동 상품." },
  { name: "레버리지 반도체 ETF", type: "ETF", sector: "semi", riskLevel: 1, minRating: 1, returnRate: 38.0, popularity: 75, description: "지수 일간 수익률의 2배를 추종하는 고위험 상품." },
  { name: "코스피200 선물옵션", type: "ELW", sector: "finance", riskLevel: 1, minRating: 1, returnRate: 0, popularity: 40, description: "만기·행사가가 있는 초고위험 파생상품." },
];

// ── 6) 시사 (전일/당일) ──
type NewsSeed = { title: string; source: string; staFinNote: string; summary: string; content: string; sector: string; isHot: boolean; riskBias: number; day: "today" | "yesterday" };
const NEWS: NewsSeed[] = [
  { title: "엔비디아, 차세대 AI 가속기 'B300' 양산 돌입", source: "한국경제", staFinNote: "AI 투자 사이클이 한 단계 더 올라가는 신호예요!", summary: "엔비디아가 차세대 AI 칩 양산에 들어가며 HBM 수요가 급증할 전망.", content: "엔비디아가 차세대 AI 가속기 B300의 양산에 돌입했다. 업계는 고대역폭메모리(HBM) 수요가 내년까지 두 배 이상 늘어날 것으로 본다. 국내 메모리 기업들의 공급 비중이 높아 수혜가 기대된다. 다만 밸류에이션 부담과 경기 둔화 가능성은 변수다.", sector: "semi", isHot: true, riskBias: 2.0, day: "yesterday" },
  { title: "비트코인 1억 4천만원 돌파… 사상 최고가 경신", source: "코인데스크", staFinNote: "변동성이 큰 만큼 분할·분산이 중요해요.", summary: "현물 ETF 자금 유입과 금리 인하 기대로 비트코인이 신고가를 기록.", content: "비트코인이 사상 최고가를 경신하며 1억 4천만원을 돌파했다. 현물 ETF로의 기관 자금 유입과 금리 인하 기대가 맞물린 결과다. 전문가들은 단기 과열 가능성을 경고하며 분할 매수와 분산투자를 권고했다.", sector: "crypto", isHot: true, riskBias: 1.0, day: "yesterday" },
  { title: "한은 기준금리 동결… '연내 인하 가능성' 시사", source: "연합뉴스", staFinNote: "예금 금리 흐름과 파킹통장 활용을 점검할 때예요.", summary: "한국은행이 기준금리를 동결하며 연내 인하 가능성을 열어둠.", content: "한국은행 금융통화위원회가 기준금리를 현 수준에서 동결했다. 총재는 물가 둔화 흐름을 확인하면 연내 인하를 검토할 수 있다고 밝혔다. 예금 금리 고점 논의가 나오면서 단기 자금의 파킹통장·CMA 활용이 주목된다.", sector: "finance", isHot: true, riskBias: 3.8, day: "yesterday" },
  { title: "정부, 전기차 보조금 확대… 2차전지株 강세", source: "매일경제", staFinNote: "정책 모멘텀은 좋지만 업황 사이클도 함께 보세요.", summary: "전기차 보조금 확대 정책에 2차전지 관련주가 일제히 상승.", content: "정부가 전기차 보조금을 확대하는 방안을 발표하면서 2차전지 밸류체인 종목이 강세를 보였다. 다만 일부 셀 업체의 재고 조정이 진행 중이라 단기 변동성에 유의해야 한다는 분석도 나온다.", sector: "battery", isHot: false, riskBias: 2.2, day: "yesterday" },
  { title: "신약 임상 3상 성공… 국내 바이오 기업 급등", source: "바이오스펙테이터", staFinNote: "바이오는 호재·악재 변동이 큰 섹터예요.", summary: "국내 바이오 기업의 항암 신약이 임상 3상에 성공.", content: "국내 한 바이오 기업이 개발 중인 항암 신약이 임상 3상에서 유효성을 입증했다. 기술수출 기대가 커지며 주가가 급등했다. 신약은 승인 전까지 불확실성이 크므로 분산 접근이 권고된다.", sector: "bio", isHot: false, riskBias: 1.8, day: "yesterday" },
  { title: "리츠 배당수익률 6%대… 금리 인하기 매력 부각", source: "서울경제", staFinNote: "안정적 현금흐름을 원한다면 살펴볼 만해요.", summary: "금리 인하 기대 속에 고배당 리츠의 투자 매력이 부각.", content: "주요 상장 리츠의 배당수익률이 6%대를 기록하며 금리 인하기 인컴 자산으로 주목받고 있다. 공실률과 차입 구조를 함께 점검해야 한다는 조언이 따른다.", sector: "realestate", isHot: false, riskBias: 3.5, day: "yesterday" },
  { title: "엔데믹 소비 회복… 유통·여행株 반등", source: "이데일리", staFinNote: "경기 방어와 회복을 함께 노리는 섹터예요.", summary: "소비 회복세에 유통·여행 관련주가 반등.", content: "엔데믹 이후 소비가 회복되면서 유통·여행 관련 종목이 반등했다. 필수소비재의 방어력과 리오프닝 수혜가 동시에 부각된다.", sector: "consumer", isHot: false, riskBias: 3.2, day: "yesterday" },
  // 당일(오늘) 시사 — 핫 트랜드 무제한 시사용
  { title: "TSMC, 2나노 공정 조기 가동… 파운드리 경쟁 격화", source: "디지타임스", staFinNote: "공급망 전반에 파장이 큰 이슈예요.", summary: "TSMC가 2나노 공정을 앞당겨 가동하며 파운드리 경쟁이 가열.", content: "TSMC가 2나노 공정 양산을 앞당기면서 글로벌 파운드리 경쟁이 격화되고 있다. 소재·장비 국산화 수혜와 함께 기술 격차 이슈가 부각된다.", sector: "semi", isHot: true, riskBias: 2.0, day: "today" },
  { title: "이더리움 현물 ETF 거래 첫날 자금 대거 유입", source: "블록미디어", staFinNote: "신규 ETF는 초기 변동성이 특히 커요.", summary: "이더리움 현물 ETF 첫 거래일에 대규모 자금이 유입.", content: "이더리움 현물 ETF가 첫 거래일부터 대규모 자금을 끌어모았다. 가상자산 제도권 편입이 빨라지고 있다는 평가다. 변동성 관리가 핵심이다.", sector: "crypto", isHot: true, riskBias: 1.1, day: "today" },
  { title: "미 연준 인사 '인하 신중'… 환율 다시 출렁", source: "로이터", staFinNote: "환율 변동기엔 달러 분산도 한 방법이에요.", summary: "연준 인사의 신중 발언에 원/달러 환율이 다시 상승.", content: "미국 연준 인사가 금리 인하에 신중해야 한다고 발언하면서 원/달러 환율이 다시 출렁였다. 수출주와 환헤지 전략이 주목된다.", sector: "finance", isHot: true, riskBias: 3.7, day: "today" },
  { title: "ESS 화재 안전기준 강화… 관련 부품주 주목", source: "전자신문", staFinNote: "규제는 비용이자 새로운 기회이기도 해요.", summary: "ESS 안전기준 강화로 안전 부품 수요가 늘어날 전망.", content: "정부가 ESS 화재 안전기준을 강화하면서 관련 안전 부품 수요가 늘어날 전망이다. 단기 비용 부담과 중장기 수혜가 엇갈린다.", sector: "battery", isHot: false, riskBias: 2.3, day: "today" },
  { title: "디지털 헬스케어 규제 샌드박스 확대", source: "헬스코리아", staFinNote: "성장 초기 섹터는 분산이 필수예요.", summary: "디지털 헬스케어 규제 샌드박스가 확대 적용.", content: "정부가 디지털 헬스케어 분야 규제 샌드박스를 확대하면서 원격의료·디지털 치료제 기업의 사업 기회가 넓어졌다.", sector: "bio", isHot: false, riskBias: 1.9, day: "today" },
];

export async function seed() {
  console.log("🌱 Seeding StaFin Mark II...");

  // 초기화(역참조 순서)
  await prisma.behaviorLog.deleteMany();
  await prisma.userPortfolio.deleteMany();
  await prisma.surveyAnswer.deleteMany();
  await prisma.interestWeight.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.product.deleteMany();
  await prisma.finTip.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.surveyQuestion.deleteMany();
  await prisma.user.deleteMany();
  await prisma.sector.deleteMany();

  for (const s of SECTORS) await prisma.sector.create({ data: s });
  console.log(`  ✓ 섹터 ${SECTORS.length}개`);

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    await prisma.surveyQuestion.create({
      data: { id: i + 1, order: q.order, title: q.title, helper: q.helper, animation: q.animation, options: JSON.stringify(q.options) },
    });
  }
  console.log(`  ✓ 진단 문항 ${QUESTIONS.length}개`);

  for (const t of FINTIPS) await prisma.finTip.create({ data: t });
  console.log(`  ✓ 금융팁 ${FINTIPS.length}개`);

  const sectorBySlug = Object.fromEntries(SECTORS.map((s) => [s.slug, s.id]));

  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: { name: p.name, type: p.type, sectorId: sectorBySlug[p.sector], riskLevel: p.riskLevel, minRating: p.minRating, returnRate: p.returnRate, popularity: p.popularity, description: p.description },
    });
  }
  console.log(`  ✓ 금융 상품 ${PRODUCTS.length}개`);

  for (const pf of PORTFOLIOS) {
    await prisma.portfolio.create({
      data: { name: pf.name, tagline: pf.tagline, description: pf.description, stability: pf.stability, expectedReturn: pf.expectedReturn, riskGrade: pf.riskGrade, composition: JSON.stringify(pf.composition), backtest: JSON.stringify(pf.backtest) },
    });
  }
  console.log(`  ✓ 포트폴리오 ${PORTFOLIOS.length}개`);

  for (const n of NEWS) {
    await prisma.newsArticle.create({
      data: { title: n.title, source: n.source, staFinNote: n.staFinNote, summary: n.summary, content: n.content, sectorId: sectorBySlug[n.sector], isHot: n.isHot, riskBias: n.riskBias, publishedAt: n.day === "today" ? TODAY_STR : YESTERDAY_STR },
    });
  }
  console.log(`  ✓ 시사 ${NEWS.length}개 (전일/당일)`);

  console.log("✅ Seed 완료");
}

// 데이터가 비어 있을 때만 시드 (배포 부팅 시 자동 초기화용)
export async function seedIfEmpty() {
  const count = await prisma.sector.count();
  if (count === 0) {
    console.log("🌱 빈 DB 감지 → 자동 시드 실행");
    await seed();
  } else {
    console.log(`ℹ️  기존 데이터 유지 (섹터 ${count}개)`);
  }
}

// 이 파일을 직접 실행한 경우에만 강제 시드 (npm run db:seed)
const isMain = (() => {
  try { return import.meta.url === pathToFileURL(process.argv[1]!).href; }
  catch { return false; }
})();
if (isMain) {
  seed()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
}
