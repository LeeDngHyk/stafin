import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polygon, Circle, Path, Defs, LinearGradient, Stop, Ellipse } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { colors } from "@/lib/theme";

export type Mood = "idle" | "happy" | "wave" | "fire" | "think" | "celebrate" | "calm";

// 별 5각 좌표 생성
function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function StaFin({
  size = 120,
  mood = "idle",
  animate = true,
}: {
  size?: number;
  mood?: Mood;
  animate?: boolean;
}) {
  const bob = useSharedValue(0);
  const rot = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!animate) return;
    if (mood === "wave") {
      rot.value = withRepeat(withSequence(withTiming(-0.18, { duration: 380 }), withTiming(0.18, { duration: 380 })), -1, true);
      bob.value = withRepeat(withTiming(-6, { duration: 760, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else if (mood === "fire") {
      rot.value = withRepeat(withSequence(withTiming(-0.06, { duration: 70 }), withTiming(0.06, { duration: 70 })), -1, true);
    } else if (mood === "celebrate") {
      scale.value = withRepeat(withSequence(withTiming(1.12, { duration: 300 }), withTiming(1, { duration: 300 })), -1, true);
      rot.value = withRepeat(withSequence(withTiming(-0.12, { duration: 260 }), withTiming(0.12, { duration: 260 })), -1, true);
    } else {
      bob.value = withRepeat(withTiming(-7, { duration: 1100, easing: Easing.inOut(Easing.quad) }), -1, true);
    }
  }, [mood, animate]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }, { rotate: `${rot.value}rad` }, { scale: scale.value }],
  }));

  const eyeShape = mood === "fire" || mood === "celebrate" ? "spark" : mood === "calm" ? "soft" : "round";
  const lookUp = mood === "think";

  return (
    <Animated.View style={[{ width: size, height: size }, aStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="star" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFE08A" />
            <Stop offset="0.55" stopColor={colors.star} />
            <Stop offset="1" stopColor={colors.starDeep} />
          </LinearGradient>
        </Defs>
        <Polygon points={starPoints(50, 52, 46, 20)} fill="url(#star)" stroke="#F0A500" strokeWidth={1.5} strokeLinejoin="round" />

        {/* 볼터치 */}
        <Circle cx={33} cy={58} r={5} fill="#FF9DB0" opacity={0.55} />
        <Circle cx={67} cy={58} r={5} fill="#FF9DB0" opacity={0.55} />

        {/* 눈 */}
        {eyeShape === "spark" ? (
          <>
            <Path d="M38 44 L41 50 L44 44 L41 38 Z" fill="#7A3B00" />
            <Path d="M56 44 L59 50 L62 44 L59 38 Z" fill="#7A3B00" />
          </>
        ) : eyeShape === "soft" ? (
          <>
            <Path d="M36 48 Q41 43 46 48" stroke="#3A2A00" strokeWidth={2.4} fill="none" strokeLinecap="round" />
            <Path d="M54 48 Q59 43 64 48" stroke="#3A2A00" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <Ellipse cx={41} cy={lookUp ? 45 : 48} rx={4} ry={5} fill="#3A2A00" />
            <Ellipse cx={59} cy={lookUp ? 45 : 48} rx={4} ry={5} fill="#3A2A00" />
            <Circle cx={42.4} cy={lookUp ? 43.4 : 46.4} r={1.4} fill="#fff" />
            <Circle cx={60.4} cy={lookUp ? 43.4 : 46.4} r={1.4} fill="#fff" />
          </>
        )}

        {/* 입 */}
        {mood === "celebrate" || mood === "happy" || mood === "wave" ? (
          <Path d="M42 56 Q50 64 58 56" stroke="#7A3B00" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        ) : mood === "think" ? (
          <Circle cx={50} cy={58} r={2.2} fill="#7A3B00" />
        ) : (
          <Path d="M44 57 Q50 61 56 57" stroke="#7A3B00" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        )}
      </Svg>

      {/* 표정 보조 이모지 오버레이 */}
      {mood === "fire" && (
        <>
          <Text style={[styles.emoji, { left: size * 0.18, top: size * 0.28, fontSize: size * 0.16 }]}>🔥</Text>
          <Text style={[styles.emoji, { right: size * 0.18, top: size * 0.28, fontSize: size * 0.16 }]}>🔥</Text>
        </>
      )}
      {mood === "celebrate" && (
        <Text style={[styles.emoji, { right: size * 0.06, top: size * 0.02, fontSize: size * 0.18 }]}>✨</Text>
      )}
      {mood === "think" && (
        <Text style={[styles.emoji, { right: size * 0.04, top: size * 0.04, fontSize: size * 0.16 }]}>💭</Text>
      )}
      {mood === "wave" && (
        <Text style={[styles.emoji, { right: size * 0.0, top: size * 0.42, fontSize: size * 0.2 }]}>👋</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  emoji: { position: "absolute" },
});
