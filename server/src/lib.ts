// 공유 헬퍼: 손님 조회, 오전 7시 퀘스트 일자, 동적 성향 재계산, 적정성 필터
import type { Request } from "express";
import { prisma } from "./db.js";
import { computeDynamic, aggregateBehavior, toGrade, type DynamicResult } from "./engine.js";

/** 오전 7시 기준 '퀘스트 일자' (07:00에 하루가 롤오버) */
export function questDate(now = new Date()): string {
  const shifted = new Date(now.getTime() - 7 * 3600 * 1000);
  return shifted.toISOString().slice(0, 10);
}

/** 현재 시각이 오전 7시 이전인지 (전일 시사 요약 분기) */
export function isBeforeSeven(now = new Date()): boolean {
  return now.getHours() < 7;
}

export function getUserId(req: Request): string | null {
  const id = req.header("x-user-id");
  return id && id.length > 0 ? id : null;
}

export async function requireUser(req: Request) {
  const id = getUserId(req);
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

/** 퀘스트 일자가 바뀌었으면 일일 진행도 초기화 */
export async function rolloverQuest(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const today = questDate();
  if (user.lastQuestDate !== today) {
    return prisma.user.update({
      where: { id: userId },
      data: { dailyDone: 0, lastQuestDate: today },
    });
  }
  return user;
}

/**
 * 행동 로그로부터 동적 성향을 재계산하고 User에 반영한다.
 * 행동이 없으면 동적 벡터 = 설문 벡터(인지부조화 0).
 */
export async function refreshPropensity(userId: string): Promise<DynamicResult | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.surveyVector == null) return null;

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const logs = await prisma.behaviorLog.findMany({
    where: { userId, createdAt: { gte: since } },
    include: { article: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const { behaviorBias, dwellLevel, positives } = aggregateBehavior(
    logs.map((l) => ({ action: l.action, dwellMs: l.dwellMs, riskBias: l.article?.riskBias ?? null }))
  );

  // 의미 있는 행동이 없으면 설문과 동일하게 둔다.
  const behavior = positives > 0 ? behaviorBias : user.surveyVector;
  const dwell = positives > 0 ? dwellLevel : 1; // 관여도 낮음 → 행동 가중치 최소

  const result = computeDynamic(user.surveyVector, behavior, dwell, user.name);

  await prisma.user.update({
    where: { id: userId },
    data: {
      behaviorBias: behavior,
      dwellLevel: dwell,
      dynamicVector: result.dynamicVector,
      dissonance: result.dissonance,
      currentRating: result.currentRating,
    },
  });

  return result;
}

/** 적정성 원칙: 손님 등급보다 위험한 상품은 권유하지 않음.
 *  product.riskLevel(5=안전~1=공격) >= 손님 등급이면 적합. */
export function isEligible(productRiskLevel: number, rating: number): boolean {
  return productRiskLevel >= rating;
}

/** 손님 등급으로 투자 가능한 상품 타입 안내 텍스트 */
export const RATING_PRODUCTS: Record<number, string> = {
  1: "ELW·선물옵션·레버리지·가상자산 등 초고위험 상품까지",
  2: "주식·ETF·ELS·DLS 등 고위험 상품까지",
  3: "주식·펀드·ETF 등 중위험 상품까지",
  4: "채권·인컴펀드 등 중·저위험 상품까지",
  5: "예·적금·CMA 등 원금보존형 상품 위주",
};

export { toGrade };
