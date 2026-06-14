import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StaFin } from "@/components/StaFin";
import { FadeInUp } from "@/components/FadeInUp";
import { Screen, Btn, Card, GradeBadge, Tag } from "@/components/ui";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { colors, font, space, gradeColor, radius } from "@/lib/theme";

export default function Result() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [products, setProducts] = useState<Product[]>([]);
  const grade = user?.rating ?? 3;

  useEffect(() => {
    api.get<{ all: Product[] }>("/myfin/products")
      .then((d) => setProducts(d.all.filter((p) => p.eligible).slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <Screen>
      <View style={{ alignItems: "center", marginTop: space(6), gap: space(2) }}>
        <StaFin size={120} mood="celebrate" />
        <FadeInUp delay={150}><Text style={font.sub}>손님의 초기 투자 성향은</Text></FadeInUp>
        <FadeInUp delay={400}>
          <Text style={[styles.grade, { color: gradeColor(grade) }]}>{user?.gradeName}</Text>
        </FadeInUp>
        <FadeInUp delay={650}>
          <GradeBadge grade={grade} name={`${grade}등급 · 성향점수 ${user?.surveyVector?.toFixed(1)}`} size="lg" />
        </FadeInUp>
      </View>

      <FadeInUp delay={850} style={{ marginTop: space(7) }}>
        <Card>
          <Text style={font.h3}>투자 가능 상품</Text>
          <Text style={[font.sub, { marginTop: space(1) }]}>{user?.investableProducts}</Text>
          <View style={styles.prodWrap}>
            {products.map((p) => (
              <View key={p.id} style={styles.prodRow}>
                <Text style={styles.prodEmoji}>{p.sector.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={font.body}>{p.name}</Text>
                  <Text style={font.tiny}>{p.type}</Text>
                </View>
                <Tag label={`+${p.returnRate}%`} color={colors.success} bg={colors.success + "18"} />
              </View>
            ))}
          </View>
        </Card>
      </FadeInUp>

      <FadeInUp delay={1050} style={{ marginTop: space(4) }}>
        <View style={styles.teaser}>
          <Text style={styles.teaserTitle}>⭐ 성향은 고정되지 않아요</Text>
          <Text style={styles.teaserBody}>
            앞으로 손님이 <Text style={styles.b}>보는 시사</Text>와 <Text style={styles.b}>관심 있는 상품</Text>에 따라
            StaFin이 투자 성향의 변화를 실시간으로 감지하고, 더 잘 맞는 등급과 상품을 제안해 드려요.
          </Text>
        </View>
      </FadeInUp>

      <FadeInUp delay={1250} style={{ marginTop: space(6) }}>
        <Btn label="관심 시사 선택하러 가기" onPress={() => router.replace("/onboarding/interests")} />
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grade: { fontSize: 30, fontWeight: "900", letterSpacing: -0.5 },
  prodWrap: { marginTop: space(4), gap: space(3) },
  prodRow: { flexDirection: "row", alignItems: "center", gap: space(3) },
  prodEmoji: { fontSize: 24 },
  teaser: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: space(4) },
  teaserTitle: { ...font.h3, color: colors.primaryDark, marginBottom: space(1) },
  teaserBody: { color: colors.primaryDark, fontSize: 13.5, lineHeight: 20 },
  b: { fontWeight: "800" },
});
