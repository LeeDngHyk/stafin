import { Router } from "express";
import { prisma } from "../db.js";
import { requireUser, rolloverQuest, questDate, isBeforeSeven } from "../lib.js";

export const newsRouter = Router();

function serializeArticle(a: any) {
  return {
    id: a.id, title: a.title, source: a.source, staFinNote: a.staFinNote,
    summary: a.summary, content: a.content, isHot: a.isHot,
    publishedAt: a.publishedAt,
    sector: a.sector ? { id: a.sector.id, slug: a.sector.slug, name: a.sector.name, emoji: a.sector.emoji } : null,
  };
}

// 전일 시사 요약: 관심 Top3 섹터, 섹터별 전일 시사 Top5 (제목/요약)
newsRouter.get("/prev-summary", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });

  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
  const interests = await prisma.interestWeight.findMany({
    where: { userId: user.id },
    orderBy: { weight: "desc" },
    include: { sector: true },
    take: 3,
  });

  // 관심사가 없으면 핫스코어 상위 3섹터로 대체
  let sectors = interests.map((i) => i.sector);
  if (sectors.length === 0) {
    sectors = await prisma.sector.findMany({ orderBy: { hotScore: "desc" }, take: 3 });
  }

  const groups = [];
  for (const s of sectors) {
    const arts = await prisma.newsArticle.findMany({
      where: { sectorId: s.id },
      orderBy: { publishedAt: "desc" },
      take: 5,
    });
    groups.push({
      sector: { id: s.id, slug: s.slug, name: s.name, emoji: s.emoji },
      articles: arts.map((a) => ({ id: a.id, title: a.title, summary: a.summary, source: a.source })),
    });
  }

  res.json({
    date: yesterday,
    today: new Date().toISOString().slice(0, 10),
    beforeSeven: isBeforeSeven(),
    groups,
  });
});

// 핫 트랜드 피드: 필수 5개(관심 2 + 핫 3) + 금융팁 1개 + 무제한 시사
newsRouter.get("/feed", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  await rolloverQuest(user.id);
  const fresh = await prisma.user.findUnique({ where: { id: user.id } });

  const interestSlugs: string[] = JSON.parse(fresh!.cCurrentAffairs || "[]");
  const interestSectors = await prisma.sector.findMany({ where: { slug: { in: interestSlugs } } });
  const interestIds = interestSectors.map((s) => s.id);

  const all = await prisma.newsArticle.findMany({ include: { sector: true }, orderBy: { publishedAt: "desc" } });

  // 관심 2개 (관심 섹터 기사 우선)
  const interestPool = all.filter((a) => interestIds.includes(a.sectorId));
  const required: any[] = [];
  const used = new Set<string>();
  for (const a of interestPool) {
    if (required.length >= 2) break;
    required.push(a); used.add(a.id);
  }
  // 핫 3개
  const hotPool = all.filter((a) => a.isHot && !used.has(a.id));
  for (const a of hotPool) {
    if (required.filter((r) => r.isHot || !interestIds.includes(r.sectorId)).length >= 3 && required.length >= 5) break;
    if (required.length >= 5) break;
    required.push(a); used.add(a.id);
  }
  // 부족하면 나머지로 5개 채움
  for (const a of all) {
    if (required.length >= 5) break;
    if (!used.has(a.id)) { required.push(a); used.add(a.id); }
  }

  // 무제한 시사: 나머지 전부
  const unlimited = all.filter((a) => !used.has(a.id));

  // 오늘의 금융팁 1개 (일자 기반 회전)
  const tips = await prisma.finTip.findMany();
  const idx = tips.length ? Number(questDate().replaceAll("-", "")) % tips.length : 0;
  const fintip = tips[idx] ?? null;

  res.json({
    quest: { done: fresh!.dailyDone, total: 5, streak: fresh!.streakDays, completed: fresh!.dailyDone >= 5 },
    required: required.slice(0, 5).map((a) => ({ ...serializeArticle(a), required: true })),
    fintip: fintip ? { id: fintip.id, name: fintip.name, summary: fintip.summary, detail: fintip.detail } : null,
    unlimited: unlimited.map((a) => ({ ...serializeArticle(a), required: false })),
  });
});

// 시사 전문 보기
newsRouter.get("/:id", async (req, res) => {
  const a = await prisma.newsArticle.findUnique({ where: { id: req.params.id }, include: { sector: true } });
  if (!a) return res.status(404).json({ error: "not found" });
  res.json(serializeArticle(a));
});

// 스와이프/상세보기 행동 기록 → 가중치/일일 퀘스트/동적성향 반영
// body: { action, dwellMs?, required? }
newsRouter.post("/:id/swipe", async (req, res) => {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "no user" });
  const article = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!article) return res.status(404).json({ error: "not found" });

  const action = (req.body?.action as string) || "like_down";
  const dwellMs = Number(req.body?.dwellMs ?? 0);
  const required = req.body?.required === true;

  await prisma.behaviorLog.create({
    data: { userId: user.id, articleId: article.id, action, dwellMs },
  });

  // 불호: 해당 섹터 가중치 하락
  if (action === "dislike_left" || action === "dislike_right") {
    const iw = await prisma.interestWeight.findUnique({
      where: { userId_sectorId: { userId: user.id, sectorId: article.sectorId } },
    });
    if (iw) {
      await prisma.interestWeight.update({
        where: { id: iw.id },
        data: { weight: Math.max(0.1, iw.weight - 0.2) },
      });
    } else {
      await prisma.interestWeight.create({
        data: { userId: user.id, sectorId: article.sectorId, weight: 0.8 },
      });
    }
  }

  // 일일 퀘스트 진행 (필수 카드 소비 시)
  await rolloverQuest(user.id);
  let u = await prisma.user.findUnique({ where: { id: user.id } });
  if (required && u && u.dailyDone < 5) {
    const newDone = u.dailyDone + 1;
    const justCompleted = newDone === 5;
    u = await prisma.user.update({
      where: { id: user.id },
      data: { dailyDone: newDone, streakDays: justCompleted ? u.streakDays + 1 : u.streakDays },
    });
  }

  res.json({ ok: true, quest: { done: u!.dailyDone, total: 5, streak: u!.streakDays, completed: u!.dailyDone >= 5 } });
});

export const tipRouter = Router();
tipRouter.get("/daily", async (_req, res) => {
  const tips = await prisma.finTip.findMany();
  if (!tips.length) return res.json(null);
  const idx = Number(questDate().replaceAll("-", "")) % tips.length;
  const t = tips[idx];
  res.json({ id: t.id, name: t.name, summary: t.summary, detail: t.detail });
});
