import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { StaFin } from "@/components/StaFin";
import { SwipeCard } from "@/components/SwipeCard";
import { Screen, Btn, Card, Tag, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Article, FinTip, Feed, Quest } from "@/lib/types";
import { colors, font, space, radius, shadow, gradeColor } from "@/lib/theme";
import React from "react";

type Item =
  | { type: "news"; article: Article }
  | { type: "fintip"; fintip: FinTip }
  | { type: "done" };

export default function HotTrend() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const refreshMe = useStore((s) => s.refreshMe);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [queue, setQueue] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [tipOpen, setTipOpen] = useState(false);

  const load = async () => {
    const f = await api.get<Feed>("/news/feed");
    setFeed(f);
    setQuest(f.quest);
    const q: Item[] = [
      ...f.required.map((a) => ({ type: "news" as const, article: a })),
      ...(f.fintip ? [{ type: "fintip" as const, fintip: f.fintip }] : []),
      ...f.unlimited.map((a) => ({ type: "news" as const, article: a })),
      { type: "done" as const },
    ];
    setQueue(q);
    setIdx(0);
  };

  useEffect(() => { load().catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { refreshMe().catch(() => {}); }, []));

  if (!feed) return <Screen><Loading label="오늘의 시사를 불러오는 중" /></Screen>;

  const item = queue[idx];

  async function act(article: Article, action: "dislike_left" | "like_down") {
    try {
      const r = await api.post<{ quest: Quest }>(`/news/${article.id}/swipe`, {
        action, required: !!article.required, dwellMs: 1500,
      });
      setQuest(r.quest);
    } catch {}
    setTipOpen(false);
    setIdx((i) => i + 1);
    refreshMe().catch(() => {});
  }

  const completed = quest?.completed;

  return (
    <Screen scroll={false}>
      {/* 헤더 + 일일 퀘스트 */}
      <View style={styles.header}>
        <View>
          <Text style={font.tiny}>오늘의 핫 트랜드</Text>
          <Text style={font.h2}>어떤 이슈가 있을까요? 🔥</Text>
        </View>
        <View style={[styles.questPill, completed && { backgroundColor: colors.success }]}>
          {completed ? (
            <Text style={styles.questText}>🎉 {quest?.streak}일 연속 완료</Text>
          ) : (
            <Text style={styles.questText}>필수 시사 {quest?.done}/{quest?.total}</Text>
          )}
        </View>
      </View>

      {/* 카드 영역 */}
      <View style={styles.cardArea}>
        {item?.type === "news" && (
          <SwipeCard
            key={item.article.id}
            onDislike={() => act(item.article, "dislike_left")}
            onLike={() => act(item.article, "like_down")}
          >
            <NewsCardBody article={item.article} onDetail={() => router.push(`/news/${item.article.id}`)} />
          </SwipeCard>
        )}

        {item?.type === "fintip" && (
          <Card style={{ minHeight: 340 }}>
            <Tag label="오늘의 금융팁" color={colors.starDeep} bg={colors.star + "26"} />
            <Text style={[font.h2, { marginTop: space(3) }]}>{item.fintip.name}</Text>
            <Text style={[font.body, { marginTop: space(2), color: colors.sub }]}>{item.fintip.summary}</Text>
            {tipOpen && (
              <Text style={[font.body, { marginTop: space(4) }]}>{item.fintip.detail}</Text>
            )}
            <View style={{ marginTop: "auto", gap: space(2), paddingTop: space(4) }}>
              <Btn
                variant="soft" small
                label={tipOpen ? "접기" : "자세히 보기"}
                onPress={() => setTipOpen((v) => !v)}
              />
              <Btn label="다음으로" small onPress={() => { setTipOpen(false); setIdx((i) => i + 1); }} />
            </View>
          </Card>
        )}

        {item?.type === "done" && (
          <View style={styles.doneWrap}>
            <StaFin size={120} mood="celebrate" />
            <Text style={[font.h2, { marginTop: space(4) }]}>오늘의 시사를 모두 확인했어요!</Text>
            <Text style={[font.sub, { marginTop: space(1) }]}>내일 오전 7시에 새로운 시사로 찾아올게요.</Text>
            <Btn style={{ marginTop: space(6), alignSelf: "stretch" }} variant="soft" label="처음부터 다시 보기" onPress={() => load()} />
          </View>
        )}
      </View>

      {/* 액션 버튼 (스와이프 대체) */}
      {item?.type === "news" && (
        <View style={styles.actions}>
          <Pressable testID="act-dislike" style={[styles.actBtn, styles.actDislike]} onPress={() => act(item.article, "dislike_left")}>
            <Text style={styles.actEmoji}>✕</Text>
            <Text style={styles.actLabel}>관심없음</Text>
          </Pressable>
          <Pressable testID="act-detail" style={[styles.actBtn, styles.actDetail]} onPress={() => router.push(`/news/${item.article.id}`)}>
            <Text style={styles.actEmoji}>📄</Text>
            <Text style={[styles.actLabel, { color: colors.primary }]}>자세히</Text>
          </Pressable>
          <Pressable testID="act-like" style={[styles.actBtn, styles.actLike]} onPress={() => act(item.article, "like_down")}>
            <Text style={styles.actEmoji}>♥</Text>
            <Text style={[styles.actLabel, { color: "#fff" }]}>관심있어요</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.hint}>좌우로 밀면 관심없음 · 아래로 내리면 관심있어요</Text>
    </Screen>
  );
}

function NewsCardBody({ article, onDetail }: { article: Article; onDetail: () => void }) {
  return (
    <Card style={{ minHeight: 360 }}>
      <View style={styles.cardTop}>
        <View style={styles.catChip}>
          <Text style={styles.catEmoji}>{article.sector?.emoji}</Text>
          <Text style={styles.catText}>{article.sector?.name}</Text>
        </View>
        {article.required ? (
          article.isHot
            ? <Tag label="🔥 핫 트랜드" color="#fff" bg={colors.danger} />
            : <Tag label="⭐ 관심 시사" color="#fff" bg={colors.primary} />
        ) : <Tag label="실시간" color={colors.sub} />}
      </View>

      <Text style={[font.h2, { marginTop: space(4) }]}>{article.title}</Text>
      <Text style={styles.source}>{article.source} · StaFin 큐레이션</Text>

      <View style={styles.staFinNote}>
        <StaFin size={34} animate={false} />
        <Text style={styles.noteText}>{article.staFinNote}</Text>
      </View>

      <Text style={[font.body, { marginTop: space(4), color: colors.sub }]}>{article.summary}</Text>

      <Btn variant="soft" small style={{ marginTop: "auto" }} label="자세히 보기 →" onPress={onDetail} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space(2), marginBottom: space(4) },
  questPill: { backgroundColor: colors.ink, paddingVertical: space(2), paddingHorizontal: space(3.5), borderRadius: radius.pill },
  questText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  cardArea: { flex: 1, justifyContent: "center" },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  catChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.chip, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill },
  catEmoji: { fontSize: 14 },
  catText: { fontSize: 12, fontWeight: "700", color: colors.sub },
  source: { ...font.tiny, marginTop: space(2) },
  staFinNote: { flexDirection: "row", alignItems: "center", gap: space(2), backgroundColor: colors.primarySoft, padding: space(3), borderRadius: radius.md, marginTop: space(4) },
  noteText: { flex: 1, color: colors.primaryDark, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  actions: { flexDirection: "row", gap: space(3), paddingTop: space(4) },
  actBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: space(3), borderRadius: radius.lg, gap: 2, ...shadow.card },
  actDislike: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: "#FFD5D6" },
  actDetail: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primarySoft, flex: 0.8 },
  actLike: { backgroundColor: colors.success },
  actEmoji: { fontSize: 18 },
  actLabel: { fontSize: 12, fontWeight: "800", color: colors.danger },
  doneWrap: { alignItems: "center", justifyContent: "center", flex: 1, paddingHorizontal: space(4) },
  hint: { ...font.tiny, textAlign: "center", paddingVertical: space(3) },
});
