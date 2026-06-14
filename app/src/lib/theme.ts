// StaFin Mark II 디자인 토큰
// Google Stitch 'StaFin Brand' 디자인 시스템의 해석된 토큰(namedColors/spacing/roundness)을
// 거의 그대로 반영하고, 글씨체만 Pretendard로 사용.
export const colors = {
  // 브랜드 (Stitch primary 계열)
  primary: "#1F45EC", // Stitch primary
  primaryDeep: "#0035E0", // primary_dim (pressed)
  primaryDark: "#0035E0",
  primarySoft: "#E7ECFF", // 옅은 primary 틴트(칩/뱃지 배경)
  onPrimaryContainer: "#00156E",
  mint: "#00C2A8", // 포인트
  star: "#FDC33B", // tertiary_container (별 골드)
  starDeep: "#765600", // tertiary

  // 의미색 (등급/성향) — 1등급(공격) 레드 → 5등급(안정) 그린
  danger: "#E0214B", // error 계열
  warning: "#FF9F0A",
  success: "#13C27B",
  caution: "#FFB020",

  // 중립 (Stitch surface 토큰)
  bg: "#F5F6FB", // background
  card: "#FFFFFF", // surface_container_lowest
  cardLow: "#EFF1F6", // surface_container_low
  ink: "#2C2F33", // on_surface
  sub: "#595C60", // on_surface_variant
  faint: "#8B8E95", // outline 계열
  line: "#DADDE4", // surface_variant
  chip: "#EFF1F6",
};

// 등급(1=공격 ~ 5=안정)별 색상
export const gradeColor = (g: number | null | undefined): string => {
  switch (g) {
    case 1: return "#E0214B";
    case 2: return "#FF6A3D";
    case 3: return "#FFB020";
    case 4: return "#2FB89A";
    case 5: return "#13C27B";
    default: return colors.faint;
  }
};

export const space = (n: number) => n * 4;

// Stitch roundness ROUND_EIGHT 기준 (또렷한 라운드)
export const radius = { sm: 8, md: 10, lg: 12, xl: 16, pill: 999 };

// Pretendard 폰트 패밀리 (expo-font로 로드)
export const fontFamily = {
  regular: "Pretendard-Regular",
  medium: "Pretendard-Medium",
  semibold: "Pretendard-SemiBold",
  bold: "Pretendard-Bold",
  extrabold: "Pretendard-ExtraBold",
  // 의미 별칭
  display: "Pretendard-ExtraBold",
  displayBold: "Pretendard-Bold",
  body: "Pretendard-Medium",
  bodySemi: "Pretendard-SemiBold",
  bodyBold: "Pretendard-Bold",
};

export const shadow = {
  card: {
    shadowColor: "#1B2559",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  float: {
    shadowColor: "#1B2559",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

// 타이포 스케일 (Pretendard, Stitch typography 비율)
export const font = {
  h1: { fontFamily: fontFamily.extrabold, fontSize: 28, fontWeight: "800" as const, color: colors.ink, letterSpacing: -0.6, lineHeight: 36 },
  h2: { fontFamily: fontFamily.extrabold, fontSize: 22, fontWeight: "800" as const, color: colors.ink, letterSpacing: -0.4, lineHeight: 30 },
  h3: { fontFamily: fontFamily.bold, fontSize: 17, fontWeight: "700" as const, color: colors.ink, letterSpacing: -0.2 },
  body: { fontFamily: fontFamily.medium, fontSize: 15.5, fontWeight: "500" as const, color: colors.ink, lineHeight: 23 },
  sub: { fontFamily: fontFamily.medium, fontSize: 13, fontWeight: "500" as const, color: colors.sub, lineHeight: 19 },
  tiny: { fontFamily: fontFamily.semibold, fontSize: 11.5, fontWeight: "600" as const, color: colors.faint },
};
