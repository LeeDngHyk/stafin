import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser, refreshPropensity, RATING_PRODUCTS } from "../lib.js";
import { GRADE_NAMES, GRADE_SHORT } from "../engine.js";

export const authRouter = Router();

// 데모 자동 로그인 (SNS 간편 로그인은 미구현 대상). body: { name?, fresh? }
// fresh=true 면 항상 새 손님 생성(온보딩 데모용)
authRouter.post("/login", async (req, res) => {
  const name = (req.body?.name as string) || "손님";
  const fresh = req.body?.fresh === true;

  let user = fresh ? null : await prisma.user.findFirst({ where: { name }, orderBy: { createdAt: "desc" } });
  if (!user) {
    user = await prisma.user.create({ data: { name } });
  }
  const isNew = user.cInvestRating == null;
  res.json({ user: serializeUser(user), isNew });
});

authRouter.get("/me", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  // 접속 시 동적 성향 최신화
  if (user.surveyVector != null) await refreshPropensity(user.id);
  const fresh = await prisma.user.findUnique({ where: { id: user.id } });
  res.json({ user: serializeUser(fresh!) });
});

// 데모용: 손님을 신규 상태로 리셋 (온보딩 다시 보기)
authRouter.post("/reset", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  await prisma.behaviorLog.deleteMany({ where: { userId: user.id } });
  await prisma.surveyAnswer.deleteMany({ where: { userId: user.id } });
  await prisma.interestWeight.deleteMany({ where: { userId: user.id } });
  await prisma.userPortfolio.deleteMany({ where: { userId: user.id } });
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      cInvestRating: null, currentRating: null, surveyVector: null, dynamicVector: null,
      dissonance: 0, behaviorBias: 3, dwellLevel: 3, cCurrentAffairs: "[]",
      dailyDone: 0, streakDays: 0, lastQuestDate: null, mainBank: null,
    },
  });
  res.json({ user: serializeUser(updated), isNew: true });
});

export function serializeUser(u: any) {
  const rating = u.currentRating ?? u.cInvestRating ?? null;
  return {
    id: u.id,
    name: u.name,
    cInvestRating: u.cInvestRating,
    currentRating: u.currentRating,
    rating,
    gradeName: rating ? GRADE_NAMES[rating] : null,
    gradeShort: rating ? GRADE_SHORT[rating] : null,
    investableProducts: rating ? RATING_PRODUCTS[rating] : null,
    surveyVector: u.surveyVector,
    dynamicVector: u.dynamicVector,
    dissonance: u.dissonance,
    cCurrentAffairs: JSON.parse(u.cCurrentAffairs || "[]"),
    dailyDone: u.dailyDone,
    streakDays: u.streakDays,
    mainBank: u.mainBank,
  };
}
