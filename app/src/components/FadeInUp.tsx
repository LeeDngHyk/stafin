import React, { useEffect } from "react";
import { ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from "react-native-reanimated";

// 텍스트/요소가 아래에서 위로 움직이며 Fade-In (명세: 글자 애니메이션)
export function FadeInUp({
  children, delay = 0, distance = 16, duration = 480, style,
}: {
  children: React.ReactNode; delay?: number; distance?: number; duration?: number; style?: ViewStyle;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
  }, []);
  const aStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * distance }],
  }));
  return <Animated.View style={[aStyle, style]}>{children}</Animated.View>;
}
