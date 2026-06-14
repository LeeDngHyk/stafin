import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser, refreshPropensity, isEligible, RATING_PRODUCTS } from "../lib.js";
import { GRADE_NAMES, GRADE_SHORT, buildHardPopup } from "../engine.js";
import { serializeUser } from "./auth.js";

export const myfinRouter = Router();

// 성향 분석(계기판) + 인지부조화 + 조정 팝업 + 시사 성향 Top3
myfinRouter.get("/propensity", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  if (user.surveyVector == null) return res.status(400).json({ error: "survey not done" });

  const dyn = await refreshPropensity(user.id);
  if (!dyn) return res.status(400).json({ error: "cannot compute" });

  // 시사 성향 Top3 (가중치 높은 관심 섹터)
  const interests = await prisma.interestWeight.findMany({
    where: { userId: user.id },
    orderBy: { weight: "desc" },
    include: { sector: true },
    take: 3,
  });

  // ±1 등급 이상 변동 시 등급 재조정(Hard) 팝업 트리거
  //   (명세: if 투자 성향 등급이 ±1 이상 변할 경우 = T)
  // 그 외에는 시뮬레이터의 dissonance 구간(주의=soft)을 따른다.
  const trigger = Math.abs(dyn.gradeDelta) >= 1;
  const towardStable = dyn.dynamicVector > dyn.surveyVector;
  const popup = trigger
    ? buildHardPopup(dyn.baseRating, dyn.currentRating, towardStable, user.name)
    : dyn.level === "caution"
    ? dyn.popup
    : null;

  res.json({
    surveyVector: dyn.surveyVector,
    dynamicVector: dyn.dynamicVector,
    dissonance: dyn.dissonance,
    baseRating: dyn.baseRating,
    currentRating: dyn.currentRating,
    baseGradeName: GRADE_NAMES[dyn.baseRating],
    currentGradeName: GRADE_NAMES[dyn.currentRating],
    gradeDelta: dyn.gradeDelta,
    level: dyn.level,
    pipeline: dyn.pipeline,
    trigger,
    popup,
    behaviorBias: user.behaviorBias,
    dwellLevel: user.dwellLevel,
    topAffairs: interests.map((i) => ({
      slug: i.sector.slug, name: i.sector.name, emoji: i.sector.emoji, weight: i.weight,
    })),
  });
});

// 조정 팝업 수락 → cInvestRating 재조정 (Hard Action)
// body: { rating }
myfinRouter.post("/apply-rating", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  const rating = Number(req.body?.rating);
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: "invalid rating" });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { cInvestRating: rating, currentRating: rating, surveyVector: rating, dynamicVector: rating, dissonance: 0 },
  });
  res.json({ user: serializeUser(updated), gradeName: GRADE_NAMES[rating] });
});

// 테마 상품관: 관심사 테마 / 수익률 테마, 4필터(선호 섹터 3 + 인기순), 적정성 필터
myfinRouter.get("/products", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  const rating = user.currentRating ?? user.cInvestRating ?? 3;

  const interestSlugs: string[] = JSON.parse(user.cCurrentAffairs || "[]");
  const sectors = await prisma.sector.findMany();
  const interestSectors = sectors.filter((s) => interestSlugs.includes(s.slug)).slice(0, 3);

  const products = await prisma.product.findMany({ include: { sector: true } });
  const eligible = products.map((p) => ({
    id: p.id, name: p.name, type: p.type, riskLevel: p.riskLevel,
    returnRate: p.returnRate, popularity: p.popularity, description: p.description,
    sector: { slug: p.sector.slug, name: p.sector.name, emoji: p.sector.emoji },
    eligible: isEligible(p.riskLevel, rating),
  }));

  // 4개 필터: 선호 섹터 3개 + 인기순
  const filters = [
    ...interestSectors.map((s) => ({ key: s.slug, label: `${s.emoji} ${s.name}`, type: "sector" })),
    { key: "popular", label: "🔥 인기순", type: "popular" },
  ];

  // 관심사 테마관: 선호 섹터 상품(수익률순)
  const interestTheme = eligible
    .filter((p) => interestSectors.some((s) => s.slug === p.sector.slug))
    .sort((a, b) => b.returnRate - a.returnRate);

  // 수익률 테마관: 섹터 수익률 순 정렬
  const returnTheme = [...sectors]
    .sort((a, b) => b.returnRate - a.returnRate)
    .map((s) => ({
      slug: s.slug, name: s.name, emoji: s.emoji, returnRate: s.returnRate,
      products: eligible.filter((p) => p.sector.slug === s.slug).sort((a, b) => b.popularity - a.popularity),
    }));

  res.json({
    rating, gradeName: GRADE_NAMES[rating], investableProducts: RATING_PRODUCTS[rating],
    filters, interestTheme, returnTheme, all: eligible.sort((a, b) => b.popularity - a.popularity),
  });
});
