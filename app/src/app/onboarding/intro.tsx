import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StaFin } from "@/components/StaFin";
import { FadeInUp } from "@/components/FadeInUp";
import { Btn } from "@/components/ui";
import { useStore } from "@/lib/store";
import { colors, font, space } from "@/lib/theme";

export default function Intro() {
  const router = useRouter();
  const user = useStore((s) => s.user);

  return (
    <View style={styles.wrap}>
      <View style={styles.center}>
        <StaFin size={150} mood="wave" />
        <FadeInUp delay={250}>
          <Text style={styles.hi}>안녕하세요, {user?.name ?? "손님"}!</Text>
        </FadeInUp>
        <FadeInUp delay={550}>
          <Text style={styles.title}>먼저 투자 성향을{"\n"}진단해 볼까요?</Text>
        </FadeInUp>
        <FadeInUp delay={850}>
          <Text style={styles.sub}>
            StaFin은 11개의 질문으로 손님의 성향을 파악하고,{"\n"}
            보는 시사와 관심 상품에 따라 성향 변화까지 함께 살펴드려요.
          </Text>
        </FadeInUp>
      </View>
      <FadeInUp delay={1100} style={styles.bottom}>
        <Btn testID="intro-start" label="투자 성향 진단 시작하기" onPress={() => router.push("/onboarding/survey")} />
        <Text style={styles.note}>약 1분이면 충분해요</Text>
      </FadeInUp>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: space(6), paddingTop: space(20), paddingBottom: space(10), backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: space(3) },
  hi: { ...font.h3, color: colors.primary, textAlign: "center" },
  title: { ...font.h1, fontSize: 28, textAlign: "center", lineHeight: 38 },
  sub: { ...font.sub, textAlign: "center", lineHeight: 21, marginTop: space(2) },
  bottom: { gap: space(2) },
  note: { ...font.tiny, textAlign: "center" },
});
