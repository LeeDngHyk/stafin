import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser, toGrade, RATING_PRODUCTS } from "../lib.js";
import { GRADE_NAMES, GRADE_SHORT, clamp } from "../engine.js";
import { serializeUser } from "./auth.js";

export const surveyRouter = Router();

// 11개 진단 문항
surveyRouter.get("/questions", async (_req, res) => {
  const qs = await prisma.surveyQuestion.findMany({ orderBy: { order: "asc" } });
  res.json(
    qs.map((q) => ({
      id: q.id,
      order: q.order,
      title: q.title,
      helper: q.helper,
      animation: q.animation,
      options: JSON.parse(q.options),
    }))
  );
});

// 설문 제출 → 설문 벡터/등급 계산 및 저장
// body: { answers: [{ questionId, optionIndex, stability }] }
surveyRouter.post("/submit", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });

  const answers = (req.body?.answers as { questionId: number; optionIndex: number; stability: number }[]) || [];
  if (answers.length === 0) return res.status(400).json({ error: "answers required" });

  // 설문 벡터 = stability 평균 (1=공격 ~ 5=안정)
  const avg = answers.reduce((s, a) => s + a.stability, 0) / answers.length;
  const surveyVector = clamp(avg, 1, 5);
  const grade = toGrade(surveyVector);

  await prisma.surveyAnswer.deleteMany({ where: { userId: user.id } });
  for (const a of answers) {
    await prisma.surveyAnswer.create({
      data: { userId: user.id, questionId: a.questionId, optionIndex: a.optionIndex, stability: a.stability },
    });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      surveyVector,
      cInvestRating: grade, // C_InvestRating 저장
      currentRating: grade,
      dynamicVector: surveyVector,
      dissonance: 0,
    },
  });

  // 투자 가능 상품 예시
  const products = await prisma.product.findMany({
    where: { riskLevel: { gte: grade } },
    orderBy: { popularity: "desc" },
    take: 6,
  });

  res.json({
    user: serializeUser(updated),
    result: {
      grade,
      gradeName: GRADE_NAMES[grade],
      gradeShort: GRADE_SHORT[grade],
      surveyVector,
      investableProducts: RATING_PRODUCTS[grade],
      sampleProducts: products.map((p) => ({ id: p.id, name: p.name, type: p.type, returnRate: p.returnRate })),
    },
  });
});

export const sectorRouter = Router();

// 7개 섹터 (+ 현재 손님 가중치)
sectorRouter.get("/", async (req, res) => {
  const user = await requireUser(req);
  const sectors = await prisma.sector.findMany({ orderBy: { hotScore: "desc" } });
  let weights: Record<number, number> = {};
  if (user) {
    const iw = await prisma.interestWeight.findMany({ where: { userId: user.id } });
    weights = Object.fromEntries(iw.map((w) => [w.sectorId, w.weight]));
  }
  res.json(
    sectors.map((s) => ({
      id: s.id, slug: s.slug, name: s.name, emoji: s.emoji,
      description: s.description, hotScore: s.hotScore, returnRate: s.returnRate,
      weight: weights[s.id] ?? 1.0,
    }))
  );
});

// 관심 시사 선택 저장 (C_CurrentAffairs + InterestWeight 초기화)
// body: { slugs: string[] }
sectorRouter.post("/interests", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  const slugs = (req.body?.slugs as string[]) || [];
  const sectors = await prisma.sector.findMany({ where: { slug: { in: slugs } } });

  await prisma.interestWeight.deleteMany({ where: { userId: user.id } });
  for (const s of sectors) {
    await prisma.interestWeight.create({ data: { userId: user.id, sectorId: s.id, weight: 1.0 } });
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { cCurrentAffairs: JSON.stringify(sectors.map((s) => s.slug)) },
  });
  res.json({ user: serializeUser(updated) });
});
