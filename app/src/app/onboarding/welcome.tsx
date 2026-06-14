import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StaFin } from "@/components/StaFin";
import { FadeInUp } from "@/components/FadeInUp";
import { Btn } from "@/components/ui";
import { colors, font, space } from "@/lib/theme";

// StaFin 입장 안내 (튜토리얼의 끝) → 전일 시사 요약으로 이동
export default function Welcome() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.center}>
        <StaFin size={160} mood="celebrate" />
        <FadeInUp delay={250}>
          <Text style={styles.title}>StaFin과 함께{"\n"}즐거운 금융 생활을 만들어봐요!</Text>
        </FadeInUp>
        <FadeInUp delay={600}>
          <Text style={styles.sub}>준비가 끝났어요. 어제의 핫한 이슈부터 살펴볼까요?</Text>
        </FadeInUp>
      </View>
      <FadeInUp delay={900}>
        <Btn label="확인" onPress={() => router.replace("/onboarding/prev-summary")} />
      </FadeInUp>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: space(6), paddingTop: space(24), paddingBottom: space(10), backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: space(4) },
  title: { ...font.h1, fontSize: 27, textAlign: "center", lineHeight: 37 },
  sub: { ...font.sub, textAlign: "center" },
});
