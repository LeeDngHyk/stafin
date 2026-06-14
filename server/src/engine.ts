// StaFin Mark II — AI 동적 성향 예측 엔진
// 시뮬레이터(stafin_mark2_simulator.html)의 로직을 그대로 이식한다.
//   - 설문 벡터(T0) + 행동 로그(시사 소비 성향) + 체류시간(관여도) → 동적 추정 벡터
//   - 오토인코더 재구성 오차(인지부조화 지수) = |survey - dynamic|
//   - 인지부조화 구간에 따라 넛지(Soft) / 등급 재조정(Hard) 팝업 트리거
// 등급 스케일: 1=공격투자형 ... 5=안정형 (낮을수록 공격적)

export const GRADE_NAMES: Record<number, string> = {
  1: "공격투자형 (1등급)",
  2: "적극투자형 (2등급)",
  3: "위험중립형 (3등급)",
  4: "안정추구형 (4등급)",
  5: "안정형 (5등급)",
};

export const GRADE_SHORT: Record<number, string> = {
  1: "공격투자형",
  2: "적극투자형",
  3: "위험중립형",
  4: "안정추구형",
  5: "안정형",
};

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function toGrade(vector: number): number {
  return clamp(Math.round(vector), 1, 5);
}

export interface DynamicResult {
  surveyVector: number; // T0 설문 벡터
  dynamicVector: number; // 실시간 동적 추정 벡터
  dissonance: number; // 인지부조화 지수(재구성 오차)
  behaviorWeight: number;
  currentRating: number; // 동적 등급
  baseRating: number; // 설문 등급
  level: "normal" | "caution" | "alert"; // 정상/주의/위험
  gradeDelta: number; // currentRating - baseRating
  popup: PopupPayload | null; // 트리거된 팝업(없으면 null)
  pipeline: string[]; // AI 파이프라인 로그
}

export interface PopupPayload {
  kind: "soft" | "hard"; // 넛지 / 등급 재조정
  title: string;
  message: string;
  // hard 액션: 등급 재조정 제안
  suggestRating?: number;
}

/** 등급 재조정(Hard Action) 팝업 메시지 생성 — MyFin '±1 등급 변동' 트리거에서 사용 */
export function buildHardPopup(
  baseRating: number,
  suggestRating: number,
  towardStable: boolean,
  userName = "손님"
): PopupPayload {
  return {
    kind: "hard",
    title: "투자 성향 등급 재조정 제안",
    suggestRating,
    message: towardStable
      ? `${userName}, 가입 시 ${GRADE_NAMES[baseRating]}으로 설정하셨지만 최근 CMA 등 안전자산 관련 시사를 깊게 정독하고 계십니다. 현재 관심사에 맞춰 투자성향등급을 ${GRADE_NAMES[suggestRating]}으로 하향 재조정해 드릴까요?`
      : `${userName}, ${GRADE_NAMES[baseRating]} 성향이시지만 최근 고위험/고수익 섹션 체류시간이 크게 증가했습니다. 현재 관심사에 맞춰 투자성향등급을 ${GRADE_NAMES[suggestRating]}으로 상향 재조정해 드릴까요?`,
  };
}

/**
 * 동적 성향 예측 핵심 연산.
 * @param survey  설문 벡터(1~5)
 * @param behavior 행동 로그 기반 시사 소비 성향(1=공격 ~ 5=안정)
 * @param dwell   체류시간/관여도(1~5)
 * @param userName 팝업 메시지 개인화용 이름
 */
export function computeDynamic(
  survey: number,
  behavior: number,
  dwell: number,
  userName = "손님"
): DynamicResult {
  // 시뮬레이터 공식 그대로
  const behaviorWeight = 0.2 + (dwell - 1) * 0.15;
  let dynamicVector =
    survey * (1 - Math.min(behaviorWeight, 0.9)) + behavior * Math.min(behaviorWeight, 0.9);
  dynamicVector = clamp(dynamicVector, 1, 5);

  const dissonance = Math.abs(survey - dynamicVector);
  const baseRating = toGrade(survey);
  const currentRating = toGrade(dynamicVector);
  const gradeDelta = currentRating - baseRating;

  let level: DynamicResult["level"] = "normal";
  let popup: PopupPayload | null = null;
  const pipeline: string[] = [];

  const towardStable = dynamicVector > survey; // 행동이 더 안정형(높은 숫자)

  if (dissonance < 1.0) {
    level = "normal";
    pipeline.push(
      `설문 기대 벡터(${survey.toFixed(1)})와 현재 행동 임베딩(${dynamicVector.toFixed(
        1
      )}) 유사도 높음`
    );
    pipeline.push("정상 패턴 (Reconstruction Error 낮음) — 개입 불필요");
  } else if (dissonance < 2.0) {
    level = "caution";
    pipeline.push(`행동 괴리 감지 (Error: ${dissonance.toFixed(2)})`);
    pipeline.push("강화학습(RL): 성향 변화 확인을 위한 콘텐츠 넛지(Soft Action) 발동");
    popup = {
      kind: "soft",
      title: "StaFin이 살펴봤어요",
      message: towardStable
        ? "최근 안전자산 관련 뉴스를 자주 확인하시네요. 금리 변동성에 대비한 파킹통장 활용 팁을 추천해 드릴까요?"
        : "최근 수익률 상위 테마에 관심이 많으시네요. 성장주 중심 ETF를 함께 알아볼까요?",
    };
  } else {
    level = "alert";
    pipeline.push(`심각한 인지부조화 감지 (Anomaly Detected, Error: ${dissonance.toFixed(2)})`);
    pipeline.push("강화학습(RL): 투자성향등급 재조정 제안 팝업(Hard Action) 즉시 트리거");
    const suggestRating = currentRating;
    popup = {
      kind: "hard",
      title: "투자 성향 등급 재조정 제안",
      suggestRating,
      message: towardStable
        ? `${userName}, 가입 시 ${GRADE_NAMES[baseRating]}으로 설정하셨지만 최근 CMA 등 안전자산 관련 시사를 깊게 정독하고 계십니다. 현재 관심사에 맞춰 투자성향등급을 ${GRADE_NAMES[suggestRating]}으로 하향 재조정해 드릴까요?`
        : `${userName}, ${GRADE_NAMES[baseRating]} 성향이시지만 최근 고위험/고수익 섹션 체류시간이 크게 증가했습니다. 현재 관심사에 맞춰 투자성향등급을 ${GRADE_NAMES[suggestRating]}으로 상향 재조정해 드릴까요?`,
    };
  }

  return {
    surveyVector: survey,
    dynamicVector,
    dissonance,
    behaviorWeight: Math.min(behaviorWeight, 0.9),
    currentRating,
    baseRating,
    level,
    gradeDelta,
    popup,
    pipeline,
  };
}

/**
 * 행동 로그(스와이프/상세보기)로부터 시사 소비 성향(behaviorBias)과
 * 관여도(dwellLevel)를 집계한다.
 *  - behaviorBias: 손님이 호감(아래 스와이프/상세보기)을 보인 기사들의 riskBias 가중 평균
 *  - dwellLevel: 상세보기/장시간 체류 비율로 관여도 추정
 */
export function aggregateBehavior(
  events: { action: string; dwellMs: number; riskBias: number | null }[]
): { behaviorBias: number; dwellLevel: number; positives: number } {
  let weightSum = 0;
  let biasSum = 0;
  let dwellPoints = 0;
  let dwellCount = 0;
  let positives = 0;

  for (const e of events) {
    const w =
      e.action === "like_down" ? 1.0 : e.action === "detail_view" ? 0.8 : e.action === "dwell" ? 0.6 : 0;
    if (w > 0 && e.riskBias != null) {
      weightSum += w;
      biasSum += e.riskBias * w;
      positives += 1;
    }
    if (e.action === "detail_view" || e.dwellMs > 0) {
      // 체류시간이 길수록(>20초) 깊은 정독 → 높은 관여도
      const secs = e.dwellMs / 1000;
      const point = e.action === "detail_view" ? 4.2 : clamp(1 + secs / 8, 1, 5);
      dwellPoints += point;
      dwellCount += 1;
    }
  }

  const behaviorBias = weightSum > 0 ? clamp(biasSum / weightSum, 1, 5) : 3;
  const dwellLevel = dwellCount > 0 ? clamp(dwellPoints / dwellCount, 1, 5) : 3;
  return { behaviorBias, dwellLevel, positives };
}
