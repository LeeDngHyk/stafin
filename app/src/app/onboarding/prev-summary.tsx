import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { FadeInUp } from "@/components/FadeInUp";
import { DateOdometer } from "@/components/DateOdometer";
import { Screen, Btn, Card, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { colors, font, space, radius, shadow } from "@/lib/theme";

interface Group { sector: { slug: string; name: string; emoji: string }; articles: { id: string; title: string; summary: string; source: string }[] }
interface PrevData { date: string; today: string; beforeSeven: boolean; groups: Group[] }

function fmt(d: string) {
  const [, m, day] = d.split("-");
  return `${m}월 ${day}일`;
}

export default function PrevSummary() {
  const router = useRouter();
  const [data, setData] = useState<PrevData | null>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => { api.get<PrevData>("/news/prev-summary").then(setData).catch(() => {}); }, []);

  function goMain() {
    setRolling(true);
    // 날짜 계기판 애니메이션 후 자동으로 메인탭 이동
    setTimeout(() => router.replace("/(tabs)"), 1700);
  }

  if (!data) return <Screen><Loading label="전일 시사를 정리하는 중" /></Screen>;

  let delay = 0;
  return (
    <Screen>
      <FadeInUp delay={0} style={{ marginTop: space(4) }}>
        <Text style={font.tiny}>{fmt(data.date)} · 전일 시사 요약</Text>
        <Text style={[font.h1, { marginTop: space(1) }]}>어제의 핫한 이슈를{"\n"}모아봤어요! 📰</Text>
      </FadeInUp>

      <View style={{ marginTop: space(6), gap: space(4) }}>
        {data.groups.map((g) => {
          delay += 200;
          return (
            <FadeInUp key={g.sector.slug} delay={delay}>
              <Card>
                <View style={styles.secHead}>
                  <Text style={styles.secEmoji}>{g.sector.emoji}</Text>
                  <Text style={font.h3}>{g.sector.name}</Text>
                  <View style={styles.top5}><Text style={styles.top5Text}>TOP {g.articles.length}</Text></View>
                </View>
                <View style={{ gap: space(3), marginTop: space(3) }}>
                  {g.articles.map((a, idx) => (
                    <Pressable key={a.id} onPress={() => router.push(`/news/${a.id}`)} style={styles.artRow}>
                      <Text style={styles.rank}>{idx + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={font.body} numberOfLines={2}>{a.title}</Text>
                        <Text style={[font.sub, { marginTop: 2 }]} numberOfLines={1}>{a.summary}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </Card>
            </FadeInUp>
          );
        })}
      </View>

      <View style={{ marginTop: space(7), gap: space(3) }}>
        <Btn label="오늘의 메인 홈으로 →" onPress={goMain} />
        <Pressable onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.skip}>스킵하고 바로 가기</Text>
        </Pressable>
      </View>

      {/* 날짜 변경(계기판) 오버레이 */}
      {rolling && (
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.odoCard}>
            <Text style={styles.odoLabel}>오늘로 이동 중…</Text>
            <DateOdometer from={fmt(data.date)} to={fmt(data.today)} size={30} />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  secHead: { flexDirection: "row", alignItems: "center", gap: space(2) },
  secEmoji: { fontSize: 22 },
  top5: { marginLeft: "auto", backgroundColor: colors.primarySoft, paddingHorizontal: space(2.5), paddingVertical: 3, borderRadius: radius.pill },
  top5Text: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  artRow: { flexDirection: "row", gap: space(3), alignItems: "flex-start" },
  rank: { ...font.h3, color: colors.primary, width: 18 },
  skip: { ...font.sub, textAlign: "center", textDecorationLine: "underline" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,18,40,0.55)", alignItems: "center", justifyContent: "center" },
  odoCard: { backgroundColor: colors.primary, paddingVertical: space(6), paddingHorizontal: space(10), borderRadius: radius.xl, alignItems: "center", gap: space(3), ...shadow.float },
  odoLabel: { color: "#EAEEFF", fontSize: 13, fontWeight: "700" },
});
