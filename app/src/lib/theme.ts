// StaFin Mark II 디자인 토큰
// Google Stitch가 생성한 'StaFin Brand' 디자인 시스템(assets/6195324723331036410)의
// 해석된 토큰을 반영: Plus Jakarta Sans 헤드라인, Inter 본문, 정제된 색/타이포/간격.
export const colors = {
  // 브랜드
  primary: "#3B5BFF", // StaFin 블루
  primaryDeep: "#1F45EC", // Stitch 해석 primary (강조)
  primaryDark: "#2840C9",
  primarySoft: "#EAEEFF",
  mint: "#00C2A8", // Secondary
  star: "#FDC33B", // StaFin 별 골드 (Stitch tertiary_container)
  starDeep: "#765600",

  // 의미색 (등급/성향) — 1등급(공격) 레드 → 5등급(안정) 그린
  danger: "#FF4D4F",
  warning: "#FF9F0A",
  success: "#13C27B",
  caution: "#FFB020",

  // 중립 (Stitch surface 토큰)
  bg: "#F5F6FB",
  card: "#FFFFFF",
  cardLow: "#EFF1F6", // surface_container_low
  ink: "#161A2B",
  sub: "#595C60", // on_surface_variant
  faint: "#9AA0B4",
  line: "#DCDFE7", // surface_variant
  chip: "#EFF1F6",
};

// 등급(1=공격 ~ 5=안정)별 색상
export const gradeColor = (g: number | null | undefined): string => {
  switch (g) {
    case 1: return "#FF4D4F";
    case 2: return "#FF7A45";
    case 3: return "#FFB020";
    case 4: return "#36C5A6";
    case 5: return "#13C27B";
    default: return colors.faint;
  }
};

export const space = (n: number) => n * 4;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

// 브랜드 폰트 패밀리 (expo-google-fonts에서 로드)
export const fontFamily = {
  display: "PlusJakartaSans_800ExtraBold", // 로고·헤드라인·큰 숫자
  displayBold: "PlusJakartaSans_700Bold",
  body: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};

export const shadow = {
  card: {
    shadowColor: "#1B2559",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
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

// 타이포 스케일 (Stitch typography 토큰 반영: Plus Jakarta Sans 800, 음수 자간)
export const font = {
  h1: { fontFamily: fontFamily.display, fontSize: 30, fontWeight: "800" as const, color: colors.ink, letterSpacing: -1.1, lineHeight: 37 },
  h2: { fontFamily: fontFamily.display, fontSize: 23, fontWeight: "800" as const, color: colors.ink, letterSpacing: -0.7, lineHeight: 30 },
  h3: { fontFamily: fontFamily.displayBold, fontSize: 17, fontWeight: "700" as const, color: colors.ink, letterSpacing: -0.3 },
  body: { fontFamily: fontFamily.body, fontSize: 15.5, fontWeight: "500" as const, color: colors.ink, lineHeight: 23 },
  sub: { fontFamily: fontFamily.body, fontSize: 13, fontWeight: "500" as const, color: colors.sub, lineHeight: 19 },
  tiny: { fontFamily: fontFamily.bodySemi, fontSize: 11.5, fontWeight: "600" as const, color: colors.faint },
};
