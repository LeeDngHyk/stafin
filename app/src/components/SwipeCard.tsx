import React from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS, interpolate,
} from "react-native-reanimated";
import { Dimensions } from "react-native";

const W = Dimensions.get("window").width;
const SWIPE = 110;

// 좌우 스와이프 = 불호(dislike), 아래 스와이프 = 호감(like)
export function SwipeCard({
  children, onDislike, onLike, disabled,
}: {
  children: React.ReactNode;
  onDislike: () => void;
  onLike: () => void;
  disabled?: boolean;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const fly = (dx: number, dy: number, cb: () => void) => {
    "worklet";
    x.value = withTiming(dx, { duration: 240 });
    y.value = withTiming(dy, { duration: 240 }, (fin) => {
      if (fin) {
        runOnJS(cb)();
        x.value = 0; y.value = 0;
      }
    });
  };

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = Math.max(0, e.translationY) * (Math.abs(e.translationX) > 40 ? 0.3 : 1);
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE) {
        fly(Math.sign(e.translationX) * W * 1.2, 40, onDislike);
      } else if (e.translationY > SWIPE) {
        fly(0, 700, onLike);
      } else {
        x.value = withSpring(0); y.value = withSpring(0);
      }
    });

  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotateZ: `${interpolate(x.value, [-W, W], [-12, 12])}deg` },
    ],
  }));

  // 좌우=불호(빨강), 아래=호감(초록) 오버레이 힌트
  const dislikeStyle = useAnimatedStyle(() => ({ opacity: interpolate(Math.abs(x.value), [20, SWIPE], [0, 1], "clamp") }));
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [20, SWIPE], [0, 1], "clamp") }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={aStyle}>
        <Animated.View style={[styles.badge, styles.dislike, dislikeStyle]} pointerEvents="none">
          <Animated.Text style={styles.badgeText}>관심없음</Animated.Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.like, likeStyle]} pointerEvents="none">
          <Animated.Text style={styles.badgeText}>관심있어요 ♥</Animated.Text>
        </Animated.View>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  badge: { position: "absolute", top: 18, zIndex: 5, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999 },
  dislike: { left: 18, backgroundColor: "#FF4D4F" },
  like: { right: 18, backgroundColor: "#13C27B" },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});
