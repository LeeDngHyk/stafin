import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, G, Line, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from "react-native-reanimated";
import { colors, font, gradeColor } from "@/lib/theme";

const AnimatedLine = Animated.createAnimatedComponent(Line);

// 값(1~5)을 반원 각도로: 1(공격,좌) → 180°, 5(안정,우) → 0°
function valueToAngle(v: number) {
  const t = (Math.min(5, Math.max(1, v)) - 1) / 4; // 0..1
  return Math.PI * (1 - t); // 180°..0°
}
function polar(cx: number, cy: number, r: number, ang: number) {
  return { x: cx + r * Math.cos(ang), y: cy - r * Math.sin(ang) };
}
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const sweep = a1 < a0 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} ${sweep} ${p1.x} ${p1.y}`;
}

// 차량 계기판 느낌의 투자 성향 게이지
export function Gauge({
  value, baseValue, size = 260,
}: { value: number; baseValue?: number; size?: number }) {
  const cx = size / 2;
  const cy = size * 0.62;
  const r = size * 0.42;
  const needle = useSharedValue(valueToAngle(baseValue ?? value));

  useEffect(() => {
    needle.value = withTiming(valueToAngle(value), { duration: 900, easing: Easing.inOut(Easing.cubic) });
  }, [value]);

  const needleProps = useAnimatedProps(() => {
    const tip = polar(cx, cy, r * 0.92, needle.value);
    return { x2: tip.x, y2: tip.y };
  });

  // 5개 등급 세그먼트 (1=공격 좌측 빨강 → 5=안정 우측 초록)
  const segs = [1, 2, 3, 4, 5].map((g, i) => {
    const a0 = Math.PI * (1 - i / 5);
    const a1 = Math.PI * (1 - (i + 1) / 5);
    return { g, path: arcPath(cx, cy, r, a0, a1), color: gradeColor(g) };
  });

  return (
    <View style={{ width: size, height: size * 0.78, alignItems: "center" }}>
      <Svg width={size} height={size * 0.78}>
        {segs.map((s) => (
          <Path key={s.g} d={s.path} stroke={s.color} strokeWidth={18} strokeLinecap="butt" fill="none" opacity={0.92} />
        ))}
        {/* 눈금 라벨 */}
        <G>
          {[1, 3, 5].map((g) => {
            const a = valueToAngle(g);
            const p = polar(cx, cy, r * 0.66, a);
            return <Circle key={g} cx={p.x} cy={p.y} r={2} fill={colors.faint} />;
          })}
        </G>
        {/* 바늘 */}
        <AnimatedLine x1={cx} y1={cy} animatedProps={needleProps} stroke={colors.ink} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={cx} cy={cy} r={10} fill={colors.ink} />
        <Circle cx={cx} cy={cy} r={4} fill="#fff" />
      </Svg>
      <View style={styles.scaleRow}>
        <Text style={[styles.scaleEnd, { color: gradeColor(1) }]}>공격형</Text>
        <Text style={[styles.scaleEnd, { color: gradeColor(5) }]}>안정형</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scaleRow: { flexDirection: "row", justifyContent: "space-between", width: "80%", marginTop: -8 },
  scaleEnd: { ...font.tiny, fontWeight: "800" },
});
