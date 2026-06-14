import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StaFin } from "@/components/StaFin";
import { Screen, Loading, Tag } from "@/components/ui";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";
import { colors, font, space, radius } from "@/lib/theme";

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [a, setA] = useState<Article | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Article>(`/news/${id}`).then(setA).catch(() => {});
    // 상세보기 행동 로그(체류/관여도 반영)
    api.post(`/news/${id}/swipe`, { action: "detail_view", dwellMs: 20000 }).catch(() => {});
  }, [id]);

  if (!a) return <Screen><Loading label="시사 전문을 불러오는 중" /></Screen>;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← 시사 요약으로</Text>
      </Pressable>

      <View style={styles.catRow}>
        <View style={styles.catChip}>
          <Text>{a.sector?.emoji}</Text>
          <Text style={styles.catText}>{a.sector?.name}</Text>
        </View>
        {a.isHot && <Tag label="🔥 핫 트랜드" color="#fff" bg={colors.danger} />}
      </View>

      <Text style={styles.title}>{a.title}</Text>
      <Text style={styles.meta}>{a.source} · {a.publishedAt}</Text>

      <View style={styles.note}>
        <StaFin size={40} animate={false} />
        <View style={{ flex: 1 }}>
          <Text style={styles.noteLabel}>StaFin 큐레이션</Text>
          <Text style={styles.noteText}>{a.staFinNote}</Text>
        </View>
      </View>

      <Text style={styles.body}>{a.content}</Text>

      <View style={styles.disclaimer}>
        <Text style={styles.discText}>
          본 콘텐츠는 정보 제공 목적이며 투자 권유가 아닙니다. 투자의 최종 판단과 책임은 본인에게 있습니다.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { paddingVertical: space(3) },
  backText: { ...font.sub, color: colors.primary, fontWeight: "700" },
  catRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space(2) },
  catChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.chip, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill },
  catText: { fontSize: 12, fontWeight: "700", color: colors.sub },
  title: { ...font.h1, fontSize: 25, marginTop: space(4), lineHeight: 34 },
  meta: { ...font.tiny, marginTop: space(2) },
  note: { flexDirection: "row", gap: space(3), alignItems: "center", backgroundColor: colors.primarySoft, padding: space(4), borderRadius: radius.lg, marginTop: space(5) },
  noteLabel: { ...font.tiny, color: colors.primary },
  noteText: { color: colors.primaryDark, fontSize: 14, fontWeight: "600", marginTop: 2, lineHeight: 20 },
  body: { ...font.body, marginTop: space(5), lineHeight: 25 },
  disclaimer: { marginTop: space(8), padding: space(4), backgroundColor: colors.chip, borderRadius: radius.md },
  discText: { ...font.tiny, lineHeight: 16 },
});
