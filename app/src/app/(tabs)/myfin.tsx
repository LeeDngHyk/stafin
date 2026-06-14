import { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { StaFin } from "@/components/StaFin";
import { Gauge } from "@/components/Gauge";
import { Screen, Card, Btn, Chip, Tag, GradeBadge, Loading, SectionTitle } from "@/components/ui";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Propensity, Product, User } from "@/lib/types";
import { colors, font, space, radius, shadow, gradeColor } from "@/lib/theme";

interface ProductsResp {
  rating: number; gradeName: string; investableProducts: string;
  filters: { key: string; label: string; type: string }[];
  interestTheme: Product[];
  returnTheme: { slug: string; name: string; emoji: string; returnRate: number; products: Product[] }[];
  all: Product[];
}

export default function MyFin() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const refreshMe = useStore((s) => s.refreshMe);
  const resetDemo = useStore((s) => s.resetDemo);
  const [prop, setProp] = useState<Propensity | null>(null);
  const [prods, setProds] = useState<ProductsResp | null>(null);
  const [filter, setFilter] = useState<string>("popular");
  const [showPopup, setShowPopup] = useState(true);
  const [applied, setApplied] = useState(false);

  const load = async () => {
    const [p, pr] = await Promise.all([
      api.get<Propensity>("/myfin/propensity"),
      api.get<ProductsResp>("/myfin/products"),
    ]);
    setProp(p);
    setProds(pr);
    setShowPopup(true);
  };

  useFocusEffect(useCallback(() => { refreshMe().catch(() => {}); load().catch(() => {}); }, []));

  if (!prop || !prods) return <Screen><Loading label="성향을 분석하는 중" /></Screen>;

  async function applyRating() {
    if (!prop?.popup?.suggestRating) return;
    const r = await api.post<{ user: User }>("/myfin/apply-rating", { rating: prop.popup.suggestRating });
    setUser(r.user);
    setApplied(true);
    setShowPopup(false);
    load().catch(() => {});
  }

  async function doReset() {
    await resetDemo();
    router.replace("/onboarding/intro");
  }

  const levelColor = prop.level === "alert" ? colors.danger : prop.level === "caution" ? colors.warning : colors.success;
  const levelText = prop.level === "alert" ? "성향 변화 감지" : prop.level === "caution" ? "변화 조짐" : "안정적";

  // 필터에 따른 상품 목록
  let filtered: Product[] = prods.all;
  if (filter === "popular") filtered = [...prods.all].sort((a, b) => b.popularity - a.popularity);
  else {
    const sec = prods.returnTheme.find((s) => s.slug === filter);
    filtered = sec ? sec.products : [];
  }

  return (
    <Screen>
      <View style={styles.topbar}>
        <View style={{ flex: 1 }}>
          <Text style={font.tiny}>MyFin</Text>
          <Text style={font.h1}>{user?.name ?? "손님"}의 투자 성향</Text>
        </View>
        <View style={styles.avatar}>
          <StaFin size={34} animate={false} />
        </View>
      </View>

      {/* 계기판: 성향이 움직이는 시각화 */}
      <Card style={{ alignItems: "center" }}>
        <View style={styles.gaugeTop}>
          <Tag label={`실시간 추정 ${prop.dynamicVector.toFixed(2)}`} color={colors.primary} bg={colors.primarySoft} />
          <Tag label={levelText} color="#fff" bg={levelColor} />
        </View>
        <Gauge value={prop.dynamicVector} baseValue={prop.surveyVector} size={280} />
        <View style={styles.gradeRow}>
          <View style={{ alignItems: "center" }}>
            <Text style={font.tiny}>가입 시</Text>
            <GradeBadge grade={prop.baseRating} name={prop.baseGradeName} />
          </View>
          <Text style={{ fontSize: 22, color: colors.faint }}>→</Text>
          <View style={{ alignItems: "center" }}>
            <Text style={font.tiny}>현재</Text>
            <GradeBadge grade={prop.currentRating} name={prop.currentGradeName} />
          </View>
        </View>
        <View style={styles.dissoRow}>
          <Text style={font.sub}>인지부조화 지수(재구성 오차)</Text>
          <Text style={[styles.dissoVal, { color: levelColor }]}>{prop.dissonance.toFixed(2)}</Text>
        </View>
        <View style={styles.pipeline}>
          {prop.pipeline.map((p, i) => (
            <Text key={i} style={styles.pipeText}>· {p}</Text>
          ))}
        </View>
      </Card>

      {/* 행동 로그 안내 */}
      <SectionTitle title="StaFin이 본 나의 행동" />
      <Card>
        <BehaviorBar label="시사·뉴스 소비 성향" value={prop.behaviorBias} left="공격적 소비" right="안정적 소비" />
        <View style={{ height: space(4) }} />
        <BehaviorBar label="콘텐츠 체류 시간·관여도" value={prop.dwellLevel} left="단순 클릭" right="깊은 정독" />
        <Text style={styles.behaviorNote}>
          시사 소비 성향과 콘텐츠 체류 시간·스크롤 속도를 종합해 성향 변화를 추정해요.
        </Text>
      </Card>

      {/* 선호 시사 Top3 */}
      <SectionTitle title="내가 선호하는 시사 TOP 3" />
      <View style={styles.affairsRow}>
        {prop.topAffairs.map((a, i) => (
          <View key={a.slug} style={styles.affairCard}>
            <Text style={styles.affairRank}>{i + 1}</Text>
            <Text style={styles.affairEmoji}>{a.emoji}</Text>
            <Text style={styles.affairName}>{a.name}</Text>
          </View>
        ))}
        {prop.topAffairs.length === 0 && <Text style={font.sub}>아직 선호 시사 데이터가 부족해요.</Text>}
      </View>

      {/* 테마 상품관 */}
      <SectionTitle title="나만의 상품관" right={<Text style={font.tiny}>{prods.gradeName} 적합</Text>} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(2), paddingVertical: space(1) }}>
        {prods.filters.map((f) => (
          <Chip key={f.key} testID={`filter-${f.key}`} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </ScrollView>
      <View style={{ gap: space(2.5), marginTop: space(3) }}>
        {filtered.map((p) => (
          <View key={p.id} style={styles.prodRow}>
            <Text style={styles.prodEmoji}>{p.sector.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space(2) }}>
                <Text style={font.body}>{p.name}</Text>
                {!p.eligible && <Tag label="적정성 초과" color={colors.danger} bg={colors.danger + "14"} />}
              </View>
              <Text style={font.tiny}>{p.type} · {p.sector.name}</Text>
            </View>
            <Text style={[styles.prodReturn, { color: p.returnRate >= 0 ? colors.success : colors.danger }]}>
              {p.returnRate > 0 ? `+${p.returnRate}%` : "—"}
            </Text>
          </View>
        ))}
      </View>

      {/* 데모 초기화 */}
      <Pressable testID="demo-reset" onPress={doReset} style={styles.reset}>
        <Text style={styles.resetText}>데모 초기화 (온보딩 다시 보기)</Text>
      </Pressable>

      {/* 등급 조정 팝업 (±1 변동 시) */}
      <Modal visible={!!prop.popup && showPopup && !applied} transparent animationType="fade" onRequestClose={() => setShowPopup(false)}>
        <View style={styles.overlay}>
          <View style={styles.popup}>
            {prop.popup && <>
            <StaFin size={72} mood={prop.popup.kind === "hard" ? "think" : "happy"} />
            <Text style={styles.popupTitle}>{prop.popup.title}</Text>
            <Text style={styles.popupMsg}>{prop.popup.message}</Text>
            {prop.popup.kind === "hard" ? (
              <View style={{ width: "100%", gap: space(2), marginTop: space(2) }}>
                <Btn testID="popup-accept" label={`${prop.popup.suggestRating}등급으로 재조정하기`} onPress={applyRating} />
                <Btn testID="popup-later" variant="ghost" small label="나중에 할게요" onPress={() => setShowPopup(false)} />
              </View>
            ) : (
              <Btn testID="popup-ok" style={{ width: "100%", marginTop: space(2) }} variant="soft" label="확인" onPress={() => setShowPopup(false)} />
            )}
            </>}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function BehaviorBar({ label, value, left, right }: { label: string; value: number; left: string; right: string }) {
  const pct = ((value - 1) / 4) * 100;
  return (
    <View>
      <Text style={[font.sub, { fontWeight: "700", marginBottom: space(2) }]}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barDot, { left: `${pct}%` }]} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: space(1) }}>
        <Text style={font.tiny}>{left}</Text>
        <Text style={font.tiny}>{right}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space(2), marginBottom: space(3) },
  avatar: { width: 46, height: 46, borderRadius: 0, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#000000" },
  gaugeTop: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: space(2) },
  gradeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space(4), marginTop: space(2) },
  dissoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: space(5), paddingTop: space(4), borderTopWidth: 1, borderTopColor: colors.line },
  dissoVal: { fontSize: 20, fontWeight: "800" },
  pipeline: { width: "100%", marginTop: space(3), gap: 4 },
  pipeText: { ...font.tiny, color: colors.sub, lineHeight: 16 },
  behaviorNote: { ...font.tiny, marginTop: space(4), lineHeight: 16 },
  affairsRow: { flexDirection: "row", gap: space(3) },
  affairCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: space(4), alignItems: "center", gap: 4, ...shadow.card },
  affairRank: { ...font.tiny, color: colors.primary, fontWeight: "800" },
  affairEmoji: { fontSize: 28 },
  affairName: { fontSize: 13, fontWeight: "700", color: colors.ink, textAlign: "center" },
  prodRow: { flexDirection: "row", alignItems: "center", gap: space(3), backgroundColor: colors.card, borderRadius: radius.lg, padding: space(3.5), ...shadow.card },
  prodEmoji: { fontSize: 24 },
  prodReturn: { fontSize: 15, fontWeight: "800" },
  reset: { marginTop: space(8), alignItems: "center", paddingVertical: space(3) },
  resetText: { ...font.sub, textDecorationLine: "underline", color: colors.faint },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,18,40,0.55)", alignItems: "center", justifyContent: "center", padding: space(6) },
  popup: { backgroundColor: colors.card, borderRadius: radius.xl, padding: space(6), alignItems: "center", gap: space(3), width: "100%", maxWidth: 360, ...shadow.float },
  popupTitle: { ...font.h2, textAlign: "center" },
  popupMsg: { ...font.body, color: colors.sub, textAlign: "center", lineHeight: 22 },
  barTrack: { height: 4, backgroundColor: colors.line, borderRadius: 0, justifyContent: "center" },
  barDot: { position: "absolute", width: 14, height: 14, borderRadius: 0, backgroundColor: "#000000", borderWidth: 2, borderColor: "#FFFFFF", marginLeft: -7 },
});
