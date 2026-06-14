import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser } from "../lib.js";

export const portfolioRouter = Router();

function serialize(p: any) {
  return {
    id: p.id, name: p.name, tagline: p.tagline, description: p.description,
    stability: p.stability, expectedReturn: p.expectedReturn, riskGrade: p.riskGrade,
    composition: JSON.parse(p.composition), backtest: JSON.parse(p.backtest),
  };
}

// 유명 포트폴리오 목록
portfolioRouter.get("/", async (_req, res) => {
  const ps = await prisma.portfolio.findMany({ orderBy: { stability: "desc" } });
  res.json(ps.map(serialize));
});

// 포트폴리오 상세
portfolioRouter.get("/detail/:id", async (req, res) => {
  const p = await prisma.portfolio.findUnique({ where: { id: req.params.id } });
  if (!p) return res.status(404).json({ error: "not found" });
  res.json(serialize(p));
});

// 내 포트폴리오 목록
portfolioRouter.get("/mine", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  const mine = await prisma.userPortfolio.findMany({
    where: { userId: user.id },
    include: { base: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(
    mine.map((m) => ({
      id: m.id, period: m.period, amount: m.amount, bank: m.bank,
      newsAdjusted: m.newsAdjusted, composition: JSON.parse(m.composition),
      base: { id: m.base.id, name: m.base.name, expectedReturn: m.base.expectedReturn, stability: m.base.stability },
      createdAt: m.createdAt,
    }))
  );
});

// 나만의 포트폴리오 생성 + 시사 선호 반영 조정안
// body: { basePortfId, period, amount, bank }
portfolioRouter.post("/create", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  const { basePortfId, period, amount, bank } = req.body || {};
  const base = await prisma.portfolio.findUnique({ where: { id: basePortfId } });
  if (!base) return res.status(404).json({ error: "portfolio not found" });

  const baseComp: { asset: string; percent: number; sectorSlug: string }[] = JSON.parse(base.composition);
  const interestSlugs: string[] = JSON.parse(user.cCurrentAffairs || "[]");

  // 기본 구성 그대로 저장
  const mine = await prisma.userPortfolio.create({
    data: {
      userId: user.id, basePortfId: base.id, period: Number(period) || 12,
      amount: Number(amount) || 1000000, bank: bank || "하나은행",
      composition: JSON.stringify(baseComp), newsAdjusted: false,
    },
  });

  // 시사 선호 반영: 관심 섹터 비중 +, 나머지 비례 축소 (합계 100 유지)
  const adjusted = adjustForInterests(baseComp, interestSlugs);

  // 예상 결과: 원금 → 기대수익 반영 추정치
  const principal = Number(amount) || 1000000;
  const months = Number(period) || 12;
  const annual = base.expectedReturn / 100;
  const projectedBase = Math.round(principal * Math.pow(1 + annual, months / 12));
  const adjAnnual = (annual + 0.015); // 관심 섹터 가중으로 소폭 상향(데모 추정)
  const projectedAdjusted = Math.round(principal * Math.pow(1 + adjAnnual, months / 12));

  res.json({
    mine: {
      id: mine.id, period: mine.period, amount: mine.amount, bank: mine.bank,
      composition: baseComp,
      base: { id: base.id, name: base.name, expectedReturn: base.expectedReturn, stability: base.stability },
    },
    newsAdjustedProposal: {
      composition: adjusted,
      reason: interestSlugs.length
        ? "최근 선호하신 시사 섹터의 비중을 높인 맞춤 포트폴리오예요."
        : "관심 시사를 선택하면 더 정교한 맞춤 제안을 드려요.",
    },
    projection: {
      principal, months,
      expectedReturn: base.expectedReturn,
      projectedBase, projectedAdjusted,
      stability: base.stability,
    },
  });
});

// 시사 선호 반영 조정안 확정
portfolioRouter.post("/apply-adjusted/:id", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  const mine = await prisma.userPortfolio.findFirst({ where: { id: req.params.id, userId: user.id }, include: { base: true } });
  if (!mine) return res.status(404).json({ error: "not found" });
  const interestSlugs: string[] = JSON.parse(user.cCurrentAffairs || "[]");
  const baseComp = JSON.parse(mine.composition);
  const adjusted = adjustForInterests(baseComp, interestSlugs);
  const updated = await prisma.userPortfolio.update({
    where: { id: mine.id },
    data: { composition: JSON.stringify(adjusted), newsAdjusted: true },
  });
  res.json({ id: updated.id, composition: adjusted, newsAdjusted: true });
});

function adjustForInterests(
  comp: { asset: string; percent: number; sectorSlug: string }[],
  interestSlugs: string[]
) {
  if (!interestSlugs.length) return comp;
  const boost = 1.25;
  const raised = comp.map((c) => ({
    ...c,
    percent: interestSlugs.includes(c.sectorSlug) ? c.percent * boost : c.percent,
  }));
  const total = raised.reduce((s, c) => s + c.percent, 0);
  return raised.map((c) => ({ ...c, percent: Math.round((c.percent / total) * 1000) / 10 }));
}
