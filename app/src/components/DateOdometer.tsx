import React, { useEffect } from "react";
import { View, Text, StyleSheet, TextStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from "react-native-reanimated";

// 자동차 계기판처럼 바뀌는 숫자만 위로 굴러가는 날짜 표시
// from/to: 'MM월 DD일' 형태 문자열 (자리수 동일 가정)
function DigitColumn({ oldCh, newCh, lh, style, delay }: { oldCh: string; newCh: string; lh: number; style: TextStyle; delay: number }) {
  const changed = oldCh !== newCh;
  const y = useSharedValue(0);
  useEffect(() => {
    if (changed) y.value = withDelay(delay, withTiming(-lh, { duration: 620, easing: Easing.inOut(Easing.cubic) }));
  }, []);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  if (!changed) return <Text style={style}>{newCh}</Text>;
  return (
    <View style={{ height: lh, overflow: "hidden" }}>
      <Animated.View style={a}>
        <Text style={[style, { height: lh }]}>{oldCh}</Text>
        <Text style={[style, { height: lh }]}>{newCh}</Text>
      </Animated.View>
    </View>
  );
}

export function DateOdometer({
  from, to, size = 22, color = "#fff", delay = 100,
}: { from: string; to: string; size?: number; color?: string; delay?: number }) {
  const lh = Math.round(size * 1.32);
  const style: TextStyle = { fontSize: size, fontWeight: "800", color, lineHeight: lh, textAlign: "center" };
  const max = Math.max(from.length, to.length);
  const chars = Array.from({ length: max }, (_, i) => [from[i] ?? " ", to[i] ?? " "]);
  return (
    <View style={styles.row}>
      {chars.map(([o, n], i) => (
        <DigitColumn key={i} oldCh={o} newCh={n} lh={lh} style={style} delay={delay + i * 40} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});
