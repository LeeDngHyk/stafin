import React from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView, ViewStyle, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, space, font, gradeColor, fontFamily } from "@/lib/theme";

export function Screen({
  children, scroll = true, pad = true, style, bg = colors.bg,
}: { children: React.ReactNode; scroll?: boolean; pad?: boolean; style?: ViewStyle; bg?: string }) {
  const inner = <View style={[pad && { paddingHorizontal: space(5) }, style]}>{children}</View>;
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
  // primary/dark = 검정 솔리드 / soft = 흰배경+검정 테두리(secondary) / ghost = 언더라인 텍스트
  const isGhost = variant === "ghost";
  const isSoft = variant === "soft";
  const bg = isGhost || isSoft ? "transparent" : "#000000";
  const fg = isGhost || isSoft ? "#000000" : "#FFFFFF";
  return (
    <Pressable
      testID={testID}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        isSoft && { borderWidth: 1, borderColor: "#000000" },
        small && { paddingVertical: space(2.5) },
        style,
      ]}
    >
      <Text
        style={[
          styles.btnText,
          { color: fg },
          small && { fontSize: 14 },
          isGhost && { textDecorationLine: "underline" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({
  children, style, onPress, testID, report,
}: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void; testID?: string; report?: boolean }) {
  const content = (
    <View style={[styles.card, report && styles.cardReport, style]}>{children}</View>
  );
  if (onPress) return <Pressable testID={testID} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>{content}</Pressable>;
  return content;
}

export function Chip({
  label, active, onPress, testID,
}: { label: string; active?: boolean; onPress?: () => void; color?: string; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[styles.chip, active ? { backgroundColor: "#000000", borderColor: "#000000" } : { backgroundColor: "transparent", borderColor: colors.line }]}
    >
      <Text style={[styles.chipText, { color: active ? "#FFFFFF" : colors.sub }]}>{label}</Text>
    </Pressable>
  );
}

export function GradeBadge({ grade, name, size = "md" }: { grade: number; name?: string; size?: "sm" | "md" | "lg" }) {
  const c = gradeColor(grade);
  const big = size === "lg";
  return (
    <View style={[styles.badge, { borderColor: c }, big && { paddingVertical: space(2), paddingHorizontal: space(4) }]}>
      <Text style={{ color: c, fontFamily: fontFamily.bold, fontWeight: "700", fontSize: big ? 16 : size === "sm" ? 12 : 14 }}>
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
      <ActivityIndicator color={colors.ink} size="large" />
      {label ? <Text style={[font.sub, { marginTop: space(3) }]}>{label}</Text> : null}
    </View>
  );
}

export function Tag({ label, color = colors.ink, bg, outline }: { label: string; color?: string; bg?: string; outline?: boolean }) {
  return (
    <View
      style={[
        styles.tag,
        outline
          ? { backgroundColor: "transparent", borderWidth: 1, borderColor: color }
          : { backgroundColor: bg ?? "#000000" },
      ]}
    >
      <Text style={{ color: outline ? color : bg ? color : "#FFFFFF", fontSize: 11, fontFamily: fontFamily.bold, fontWeight: "700", letterSpacing: 0.3 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: space(4), borderRadius: radius.sm, alignItems: "center", justifyContent: "center",
  },
  btnText: { fontSize: 16, fontFamily: fontFamily.bold, fontWeight: "700", letterSpacing: -0.2 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: space(5), borderWidth: 1, borderColor: colors.line },
  cardReport: { borderTopWidth: 4, borderTopColor: "#000000" },
  chip: { paddingVertical: space(2.5), paddingHorizontal: space(4), borderRadius: radius.chip, borderWidth: 1 },
  chipText: { fontSize: 14, fontFamily: fontFamily.semibold, fontWeight: "600" },
  badge: { paddingVertical: space(1), paddingHorizontal: space(3), borderRadius: radius.chip, borderWidth: 1, alignSelf: "flex-start" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space(3) },
  tag: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: radius.chip, alignSelf: "flex-start" },
});
