import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { StaFin } from "@/components/StaFin";
import { colors, font, space, fontFamily } from "@/lib/theme";

export default function Splash() {
  const router = useRouter();
  const bootstrap = useStore((s) => s.bootstrap);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await bootstrap();
        if (!user) {
          setErr("서버에 연결할 수 없어요. 백엔드(localhost:4000)가 실행 중인지 확인해 주세요.");
          return;
        }
        // C_InvestRating == null → 신규 손님: 투자 성향 진단 안내
        if (user.cInvestRating == null) {
          router.replace("/onboarding/intro");
          return;
        }
        // 기존 손님: 전일 시사 요약 (오전 7시 이전이면 메인탭 바로)
        try {
          const prev = await api.get<{ beforeSeven: boolean }>("/news/prev-summary");
          router.replace(prev.beforeSeven ? "/(tabs)" : "/onboarding/prev-summary");
        } catch {
          router.replace("/(tabs)");
        }
      } catch (e: any) {
        setErr(String(e?.message ?? e));
      }
    })();
  }, []);

  return (
    <View style={styles.wrap}>
      <StaFin size={140} mood="wave" />
      <Text style={styles.logo}>StaFin</Text>
      <Text style={styles.tag}>Mark II</Text>
      {err ? <Text style={styles.err}>{err}</Text> : <Text style={styles.msg}>StaFin을 준비하고 있어요</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, gap: space(1) },
  logo: { fontFamily: fontFamily.display, fontSize: 36, fontWeight: "800", color: colors.primary, marginTop: space(4), letterSpacing: -1.5 },
  tag: { fontFamily: fontFamily.displayBold, fontSize: 13, fontWeight: "700", color: colors.starDeep, letterSpacing: 5 },
  msg: { ...font.sub, marginTop: space(6) },
  err: { ...font.sub, color: colors.danger, marginTop: space(6), textAlign: "center", paddingHorizontal: space(8) },
});
