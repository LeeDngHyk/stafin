import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { StaFin, Mood } from "@/components/StaFin";
import { Screen, Btn, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { SurveyQuestion, User } from "@/lib/types";
import { colors, font, space, radius, shadow } from "@/lib/theme";

const animMood: Record<string, Mood> = {
  wave: "wave", clock: "idle", split4: "idle", think: "think", book: "think",
  fire: "fire", shield: "calm", coin: "idle", wallet: "idle", eyes: "think", star: "celebrate",
};

export default function Survey() {
  const router = useRouter();
  const { answers, setAnswer, clearAnswers, setUser } = useStore();
  const [qs, setQs] = useState<SurveyQuestion[]>([]);
  const [i, setI] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clearAnswers();
    api.get<SurveyQuestion[]>("/survey/questions").then(setQs).catch(() => {});
  }, []);

  if (qs.length === 0) return <Screen><Loading label="문항을 불러오는 중" /></Screen>;

  const q = qs[i];
  const picked = answers[q.id];
  const isLast = i === qs.length - 1;
  const progress = (i + (picked ? 1 : 0)) / qs.length;

  // 선택지에 따른 표정 차별화 (공격 선택→불꽃, 안정 선택→평온)
  let mood: Mood = animMood[q.animation] ?? "idle";
  if (picked) {
    mood = picked.stability <= 2 ? "fire" : picked.stability >= 4 ? "calm" : "think";
  }

  async function submit() {
    setSubmitting(true);
    try {
      const payload = {
        answers: qs.map((qq) => ({
          questionId: qq.id,
          optionIndex: answers[qq.id]?.optionIndex ?? 2,
          stability: answers[qq.id]?.stability ?? 3,
        })),
      };
      const r = await api.post<{ user: User; result: any }>("/survey/submit", payload);
      setUser(r.user);
      router.replace({ pathname: "/onboarding/result", params: { grade: String(r.result.grade) } });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll={false}>
      {/* 진행바 */}
      <View style={styles.progressWrap}>
        <ProgressBar value={progress} />
        <Text style={styles.count}>{i + 1} / {qs.length}</Text>
      </View>

      {/* StaFin */}
      <View style={styles.stafinWrap}>
        {q.animation === "split4" ? (
          <Split4 stability={picked?.stability} />
        ) : (
          <StaFin size={104} mood={mood} />
        )}
        <View style={styles.helperBubble}>
          <Text style={styles.helper}>{q.helper}</Text>
        </View>
      </View>

      {/* 질문 */}
      <Text style={styles.title}>{q.title}</Text>

      {/* 선택지 */}
      <View style={{ gap: space(2.5), marginTop: space(4), flex: 1 }}>
        {q.options.map((opt, idx) => {
          const active = picked?.optionIndex === idx;
          return (
            <Pressable
              key={idx}
              testID={`opt-${idx}`}
              onPress={() => setAnswer(q.id, idx, opt.stability)}
              style={[styles.opt, active && styles.optActive]}
            >
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.optText, active && { color: colors.primary, fontWeight: "700" }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* 네비게이션 */}
      <View style={styles.nav}>
        {i > 0 ? (
          <Btn label="이전" variant="ghost" small style={{ flex: 1 }} onPress={() => setI(i - 1)} />
        ) : <View style={{ flex: 1 }} />}
        {isLast ? (
          <Btn testID="survey-next" label={submitting ? "분석 중…" : "진단 완료"} small style={{ flex: 2 }} disabled={!picked || submitting} onPress={submit} />
        ) : (
          <Btn testID="survey-next" label="다음" small style={{ flex: 2 }} disabled={!picked} onPress={() => setI(i + 1)} />
        )}
      </View>
    </Screen>
  );
}

function ProgressBar({ value }: { value: number }) {
  const w = useSharedValue(0);
  useEffect(() => { w.value = withTiming(value, { duration: 320 }); }, [value]);
  const a = useAnimatedStyle(() => ({ width: `${Math.min(100, w.value * 100)}%` }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, a]} />
    </View>
  );
}

// 별 4마리 — 투자자산 비중 질문(예: 25% → 1마리만 옆으로)
function Split4({ stability }: { stability?: number }) {
  // stability 5(=10%이하) → 0마리 투자, 1(=40%초과) → 4마리 투자
  const invest = stability == null ? 0 : Math.round(((5 - stability) / 4) * 4);
  return (
    <View style={{ height: 110, justifyContent: "center" }}>
      <View style={{ flexDirection: "row", gap: space(2), alignItems: "center" }}>
        {[0, 1, 2, 3].map((n) => (
          <View key={n} style={{ transform: [{ translateY: n < invest ? -10 : 0 }] }}>
            <StaFin size={48} mood={n < invest ? "celebrate" : "idle"} animate={false} />
          </View>
        ))}
      </View>
      <Text style={styles.split4Label}>
        {stability == null ? "선택해 주세요" : `${invest}마리가 투자에 나섰어요! (약 ${invest * 25}%)`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressWrap: { flexDirection: "row", alignItems: "center", gap: space(3), marginTop: space(2), marginBottom: space(3) },
  track: { flex: 1, height: 8, backgroundColor: colors.line, borderRadius: radius.pill, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.primary, borderRadius: radius.pill },
  count: { ...font.tiny, color: colors.sub },
  stafinWrap: { alignItems: "center", gap: space(2), marginVertical: space(2) },
  helperBubble: { backgroundColor: colors.primarySoft, paddingVertical: space(2), paddingHorizontal: space(4), borderRadius: radius.pill },
  helper: { color: colors.primaryDark, fontSize: 13, fontWeight: "600" },
  title: { ...font.h2, textAlign: "center", marginTop: space(2), paddingHorizontal: space(2) },
  opt: {
    flexDirection: "row", alignItems: "center", gap: space(3),
    backgroundColor: colors.card, borderRadius: radius.lg, padding: space(4),
    borderWidth: 1.5, borderColor: colors.line,
  },
  optActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
  optText: { ...font.body, flex: 1 },
  nav: { flexDirection: "row", gap: space(3), paddingVertical: space(4) },
  split4Label: { ...font.sub, textAlign: "center", marginTop: space(3), fontWeight: "600" },
});
