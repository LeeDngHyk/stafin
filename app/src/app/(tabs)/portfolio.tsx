import { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen, Card, Tag, GradeBadge, Loading, SectionTitle } from "@/components/ui";
import { CompoBars } from "@/components/Charts";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Portfolio } from "@/lib/types";
import { colors, font, space, radius, shadow, gradeColor } from "@/lib/theme";

export default function PortfolioList() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const refreshMe = useStore((s) => s.refreshMe);
  const [list, setList] = useState<Portfolio[]>([]);

  useFocusEffect(useCallback(() => {
    refreshMe().catch(() => {});
    api.get<Portfolio[]>("/portfolios").then(setList).catch(() => {});
  }, []));

  if (list.length === 0) return <Screen><Loading label="포트폴리오를 불러오는 중" /></Screen>;

  const rating = user?.rating ?? 3;
  // 손님 성향에 맞는 추천 포트폴리오 (riskGrade가 등급과 가까운 순)
  const recommended = [...list].sort((a, b) => Math.abs(a.riskGrade - rating) - Math.abs(b.riskGrade - rating))[0];

  return (
    <Screen>
      <View style={{ marginTop: space(2), marginBottom: space(3) }}>
        <Text style={font.tiny}>맞춤 포트폴리오</Text>
        <Text style={font.h1}>나만의 포트폴리오 만들기 📊</Text>
        <Text style={[font.sub, { marginTop: space(1) }]}>
          {user?.gradeName ?? "손님"} 성향에 맞춰 한 번에 분산 투자를 시작해요.
        </Text>
      </View>

      {/* 성향 기반 추천 */}
      <SectionTitle title="StaFin 추천" right={<GradeBadge grade={rating} name={`${rating}등급 맞춤`} size="sm" />} />
      <Card testID="reco-card" onPress={() => router.push(`/portfolio/${recommended.id}`)} style={{ borderWidth: 2, borderColor: colors.primary }}>
        <View style={styles.recoTop}>
          <Tag label="⭐ 성향 적합도 1위" color="#fff" bg={colors.primary} />
          <Text style={[styles.ret, { color: colors.success }]}>연 +{recommended.expectedReturn}%</Text>
        </View>
        <Text style={[font.h2, { marginTop: space(3) }]}>{recommended.name}</Text>
        <Text style={[font.sub, { marginTop: space(1) }]}>{recommended.tagline}</Text>
        <View style={{ marginTop: space(4) }}>
          <CompoBars items={recommended.composition} />
        </View>
        <View style={styles.metaRow}>
          <Meta label="안정 수치" value={`${recommended.stability}`} />
          <Meta label="권장 등급" value={`${recommended.riskGrade}등급`} />
          <Meta label="구성 자산" value={`${recommended.composition.length}종`} />
        </View>
      </Card>

      {/* 전체 목록 */}
      <View style={{ marginTop: space(6) }}>
        <SectionTitle title="유명 포트폴리오" />
        <View style={{ gap: space(3) }}>
          {list.map((p) => (
            <Card key={p.id} onPress={() => router.push(`/portfolio/${p.id}`)}>
              <View style={styles.listTop}>
                <View style={{ flex: 1 }}>
                  <Text style={font.h3}>{p.name}</Text>
                  <Text style={[font.sub, { marginTop: 2 }]}>{p.tagline}</Text>
                </View>
                <GradeBadge grade={p.riskGrade} name={`${p.riskGrade}등급`} size="sm" />
              </View>
              <View style={styles.listMeta}>
                <View style={styles.stab}>
                  <View style={[styles.stabFill, { width: `${p.stability}%`, backgroundColor: gradeColor(p.riskGrade) }]} />
                </View>
                <Text style={styles.stabLabel}>안정 {p.stability}</Text>
                <Text style={[styles.ret, { color: colors.success }]}>연 +{p.expectedReturn}%</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={font.tiny}>{label}</Text>
      <Text style={{ ...font.h3, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  recoTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ret: { fontSize: 16, fontWeight: "800" },
  metaRow: { flexDirection: "row", marginTop: space(5), paddingTop: space(4), borderTopWidth: 1, borderTopColor: colors.line },
  listTop: { flexDirection: "row", alignItems: "flex-start", gap: space(2) },
  listMeta: { flexDirection: "row", alignItems: "center", gap: space(3), marginTop: space(4) },
  stab: { flex: 1, height: 8, backgroundColor: colors.line, borderRadius: 999, overflow: "hidden" },
  stabFill: { height: "100%", borderRadius: 999 },
  stabLabel: { ...font.tiny },
});
