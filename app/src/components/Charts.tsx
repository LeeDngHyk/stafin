import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polyline, Line, Circle, Defs, LinearGradient, Stop, Polygon } from "react-native-svg";
import { colors, font, space, radius } from "@/lib/theme";
import type { CompItem } from "@/lib/types";

const PALETTE = ["#3B5BFF", "#00C2A8", "#FFC53D", "#FF7A45", "#A26BFA", "#36C5A6", "#FF4D8F"];

// 구성 비율: 가로 누적 막대 + 범례
export function CompoBars({ items }: { items: CompItem[] }) {
  const total = items.reduce((s, c) => s + c.percent, 0) || 100;
  return (
    <View>
      <View style={styles.stack}>
        {items.map((c, i) => (
          <View key={i} style={{ width: `${(c.percent / total) * 100}%`, backgroundColor: PALETTE[i % PALETTE.length], height: 18 }} />
        ))}
      </View>
      <View style={styles.legend}>
        {items.map((c, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: PALETTE[i % PALETTE.length] }]} />
            <Text style={styles.legendText}>{c.asset} <Text style={{ fontWeight: "800" }}>{c.percent}%</Text></Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// 백테스팅 성과 라인 차트
export function LineChart({
  data, width = 300, height = 140,
}: { data: { year: number; value: number }[]; width?: number; height?: number }) {
  if (!data.length) return null;
  const pad = 24;
  const xs = data.map((d) => d.year);
  const ys = data.map((d) => d.value);
  const minY = Math.min(...ys) * 0.98;
  const maxY = Math.max(...ys) * 1.02;
  const px = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const py = (v: number) => height - pad - ((v - minY) / (maxY - minY)) * (height - pad * 2);

  const pts = data.map((d, i) => `${px(i)},${py(d.value)}`).join(" ");
  const area = `${pad},${height - pad} ${pts} ${width - pad},${height - pad}`;

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.25} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        <Line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke={colors.line} strokeWidth={1} />
        <Polygon points={area} fill="url(#fill)" />
        <Polyline points={pts} fill="none" stroke={colors.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <Circle key={i} cx={px(i)} cy={py(d.value)} r={3.5} fill="#fff" stroke={colors.primary} strokeWidth={2} />
        ))}
      </Svg>
      <View style={styles.years}>
        {data.map((d) => (
          <Text key={d.year} style={font.tiny}>{`'${String(d.year).slice(2)}`}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { flexDirection: "row", borderRadius: radius.sm, overflow: "hidden", width: "100%" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: space(2), marginTop: space(3) },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6, width: "47%" },
  dot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { ...font.sub, fontSize: 12 },
  years: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: space(1) },
});
