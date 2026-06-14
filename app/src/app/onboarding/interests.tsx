import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { StaFin } from "@/components/StaFin";
import { Screen, Btn, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Sector, User } from "@/lib/types";
import { colors, font, space, radius, shadow } from "@/lib/theme";

export default function Interests() {
  const router = useRouter();
  const setUser = useStore((s) => s.setUser);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get<Sector[]>("/sectors").then(setSectors).catch(() => {}); }, []);

  function toggle(slug: string) {
    setSel((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));
  }

  async function save() {
    setSaving(true);
    try {
      const r = await api.post<{ user: User }>("/sectors/interests", { slugs: sel });
      setUser(r.user);
      router.replace("/onboarding/welcome");
    } finally { setSaving(false); }
  }

  if (sectors.length === 0) return <Screen><Loading label="시사 카테고리를 불러오는 중" /></Screen>;

  return (
    <Screen scroll={false}>
      <View style={{ alignItems: "center", marginTop: space(6), gap: space(2) }}>
        <StaFin size={96} mood="happy" />
        <Text style={font.h2}>요즘 관심있는 시사를{"\n"}모두 선택해볼까요?</Text>
        <Text style={font.sub}>여러 개 골라도 좋아요. 선택한 분야 위주로 보여드려요.</Text>
      </View>

      <View style={styles.grid}>
        {sectors.map((s) => {
          const active = sel.includes(s.slug);
          return (
            <Pressable key={s.slug} testID={`sector-${s.slug}`} onPress={() => toggle(s.slug)} style={[styles.tile, active && styles.tileActive]}>
              <Text style={styles.emoji}>{s.emoji}</Text>
              <Text style={[styles.tileName, active && { color: "#fff" }]}>{s.name}</Text>
              <Text style={[styles.tileDesc, active && { color: "#EAEEFF" }]} numberOfLines={1}>{s.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ paddingVertical: space(4) }}>
        <Btn
          testID="interests-save"
          label={sel.length ? `${sel.length}개 선택 완료` : "1개 이상 선택해 주세요"}
          disabled={sel.length === 0 || saving}
          onPress={save}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space(3), marginTop: space(6), justifyContent: "space-between" },
  tile: {
    width: "47.5%", backgroundColor: colors.card, borderRadius: radius.lg, padding: space(4),
    borderWidth: 2, borderColor: colors.line, ...shadow.card,
  },
  tileActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  emoji: { fontSize: 30, marginBottom: space(2) },
  tileName: { ...font.h3, fontSize: 16 },
  tileDesc: { ...font.tiny, marginTop: 2 },
});
