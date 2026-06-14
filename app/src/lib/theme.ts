// StaFin Mark II 디자인 토큰 — "Monochrome Precision"
// 흑백 미니멀/브루탈리즘: 색 제거, 샤프한 모서리(0px), 그림자 대신 1px 테두리.
// 글씨체는 한글 가독성을 위해 Pretendard 유지(디자인 문서의 Inter 대체), 타이포 스케일/웨이트는 문서대로.
export const colors = {
  // 브랜드 = 무채색
  primary: "#000000", // Deep Black (주요 액션/구조)
  primaryDeep: "#000000",
  primaryDark: "#1B1B1B", // primary-container
  primarySoft: "#EFEDED", // surface-container (옅은 회색 그룹 배경)
  onPrimaryContainer: "#1B1C1C",
  mint: "#1B1C1C",
  star: "#2A2A2C", // StaFin 별(차콜)
  starDeep: "#0E0E0F",

  // 의미색 — 진단 중 감정 편향 제거를 위해 무채색. 오류만 레드 유지.
  danger: "#BA1A1A", // error
  warning: "#7E7576",
  success: "#1B1C1C", // 긍정도 검정(객관성)
  caution: "#7E7576",

  // 중립 (Monochrome surface 토큰)
  bg: "#FBF9F9", // background / surface
  card: "#FFFFFF", // surface-container-lowest
  cardLow: "#F5F3F3", // surface-container-low
  ink: "#1B1C1C", // on-surface
  sub: "#4C4546", // on-surface-variant
  faint: "#7E7576", // outline (보조 라벨/힌트)
  line: "#CFC4C5", // outline-variant (1px 테두리/구분선)
  lineStrong: "#000000", // 강조 테두리(현재 항목/리포트)
  chip: "#F5F3F3",
};

// 등급(1=공격 ~ 5=안정) — 그레이스케일 스펙트럼 (공격=짙음, 안정=옅음)
export const gradeColor = (g: number | null | undefined): string => {
  switch (g) {
    case 1: return "#1B1C1C";
    case 2: return "#454040";
    case 3: return "#6E6768";
    case 4: return "#9A9293";
    case 5: return "#C2B9BA";
    default: return colors.faint;
  }
};

export const space = (n: number) => n * 4;

// 샤프(0px). 칩 등 최소 구분이 필요한 경우 최대 2px.
export const radius = { sm: 0, md: 0, lg: 0, xl: 0, pill: 2, chip: 2 };

// 1px 테두리(그림자 대체)
export const border = { width: 1, color: colors.line };
export const borderStrong = { width: 1, color: "#000000" };

// Pretendard 폰트 패밀리 (expo-font로 로드)
export const fontFamily = {
  regular: "Pretendard-Regular",
  medium: "Pretendard-Medium",
  semibold: "Pretendard-SemiBold",
  bold: "Pretendard-Bold",
  extrabold: "Pretendard-ExtraBold",
  display: "Pretendard-Bold",
  displayBold: "Pretendard-Bold",
  body: "Pretendard-Regular",
  bodySemi: "Pretendard-SemiBold",
  bodyBold: "Pretendard-Bold",
};

// 그림자 대신 1px 테두리 (기존 ...shadow.card 사용처가 모두 테두리로 전환됨)
export const shadow = {
  card: { borderWidth: 1, borderColor: colors.line },
  float: { borderWidth: 2, borderColor: "#000000" }, // 모달: 두꺼운 검정 테두리(브루탈리즘)
};

// 타이포 스케일 (Pretendard, 문서 typography 비율 — 헤비 웨이트 + 음수 자간)
export const font = {
  h1: { fontFamily: fontFamily.bold, fontSize: 27, fontWeight: "700" as const, color: colors.ink, letterSpacing: -0.6, lineHeight: 34 },
  h2: { fontFamily: fontFamily.bold, fontSize: 21, fontWeight: "700" as const, color: colors.ink, letterSpacing: -0.4, lineHeight: 28 },
  h3: { fontFamily: fontFamily.semibold, fontSize: 17, fontWeight: "600" as const, color: colors.ink, letterSpacing: -0.2 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, fontWeight: "400" as const, color: colors.ink, lineHeight: 24 },
  sub: { fontFamily: fontFamily.medium, fontSize: 13.5, fontWeight: "500" as const, color: colors.sub, lineHeight: 20 },
  tiny: { fontFamily: fontFamily.semibold, fontSize: 11.5, fontWeight: "600" as const, color: colors.faint, letterSpacing: 0.4 },
};
