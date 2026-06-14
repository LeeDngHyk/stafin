import React from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView, ViewStyle, TextStyle, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, shadow, space, font, gradeColor } from "@/lib/theme";

export function Screen({
  children, scroll = true, pad = true, style, bg = colors.bg,
}: { children: React.ReactNode; scroll?: boolean; pad?: boolean; style?: ViewStyle; bg?: string }) {
  const inner = (
    <View style={[pad && { paddingHorizontal: space(5) }, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["top"]}>
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: space(10) }}>
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

export function Btn({
  label, onPress, variant = "primary", disabled, style, small, testID,
}: {
  label: string; onPress?: () => void; variant?: "primary" | "ghost" | "soft" | "dark";
  disabled?: boolean; style?: ViewStyle; small?: boolean; testID?: string;
}) {
  const bg =
    variant === "primary" ? colors.primary :
    variant === "dark" ? colors.ink :
    variant === "soft" ? colors.primarySoft : "transparent";
  const fg = variant === "soft" ? colors.primary : variant === "ghost" ? colors.sub : "#fff";
  return (
    <Pressable
      testID={testID}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.88 : 1 },
        variant === "ghost" && { borderWidth: 1.5, borderColor: colors.line },
        small && { paddingVertical: space(2.5) },
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: fg }, small && { fontSize: 14 }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style, onPress, testID }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void; testID?: string }) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) return <Pressable testID={testID} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>{content}</Pressable>;
  return content;
}

export function Chip({
  label, active, onPress, color, testID,
}: { label: string; active?: boolean; onPress?: () => void; color?: string; testID?: string }) {
  const c = color ?? colors.primary;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[styles.chip, active ? { backgroundColor: c, borderColor: c } : { backgroundColor: colors.chip, borderColor: colors.chip }]}
    >
      <Text style={[styles.chipText, { color: active ? "#fff" : colors.sub }]}>{label}</Text>
    </Pressable>
  );
}

export function GradeBadge({ grade, name, size = "md" }: { grade: number; name?: string; size?: "sm" | "md" | "lg" }) {
  const c = gradeColor(grade);
  const big = size === "lg";
  return (
    <View style={[styles.badge, { backgroundColor: c + "1A", borderColor: c + "55" }, big && { paddingVertical: space(2), paddingHorizontal: space(4) }]}>
      <Text style={{ color: c, fontWeight: "800", fontSize: big ? 16 : size === "sm" ? 12 : 14 }}>
        {name ?? `${grade}등급`}
      </Text>
    </View>
  );
}

export function SectionTitle({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={font.h3}>{title}</Text>
      {right}
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: space(10) }}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text style={[font.sub, { marginTop: space(3) }]}>{label}</Text> : null}
    </View>
  );
}

export function Tag({ label, color = colors.sub, bg }: { label: string; color?: string; bg?: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg ?? colors.chip }]}>
      <Text style={{ color, fontSize: 11, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: space(4), borderRadius: radius.lg, alignItems: "center", justifyContent: "center",
  },
  btnText: { fontSize: 16, fontWeight: "800" },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: space(5), ...shadow.card },
  chip: { paddingVertical: space(2.5), paddingHorizontal: space(4), borderRadius: radius.pill, borderWidth: 1.5 },
  chipText: { fontSize: 14, fontWeight: "700" },
  badge: { paddingVertical: space(1), paddingHorizontal: space(3), borderRadius: radius.pill, borderWidth: 1, alignSelf: "flex-start" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space(3) },
  tag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.sm, alignSelf: "flex-start" },
});
