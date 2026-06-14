import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StaFin } from "@/components/StaFin";
import { Screen, Card, Btn, Chip, Tag, Loading, SectionTitle } from "@/components/ui";
import { CompoBars, LineChart } from "@/components/Charts";
import { api } from "@/lib/api";
import type { Portfolio, CompItem } from "@/lib/types";
import { colors, font, space, radius, shadow } from "@/lib/theme";

const PERIODS = [6, 12, 24, 36];
const BANKS = ["하나은행", "국민은행", "신한은행", "우리은행"];

interface CreateResp {
  mine: { id: string; period: number; amount: number; bank: string; composition: CompItem[]; base: { name: string; expectedReturn: number; stability: number } };
  newsAdjustedProposal: { composition: CompItem[]; reason: string };
  projection: { principal: number; months: number; expectedReturn: number; projectedBase: number; projectedAdjusted: number; stability: number };
}

function won(n: number) { return n.toLocaleString("ko-KR") + "원"; }

export default function PortfolioDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<Portfolio | null>(null);

  const [period, setPeriod] = useState(12);
  const [amount, setAmount] = useState("1000000");
  const [bank, setBank] = useState("하나은행");
  const [created, setCreated] = useState<CreateResp | null>(null);
  const [useAdjusted, setUseAdjusted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (id) api.get<Portfolio>(`/portfolios/detail/${id}`).then(setP).catch(() => {}); }, [id]);
  if (!p) return <Screen><Loading label="포트폴리오를 불러오는 중" /></Screen>;

  async function create() {
    setBusy(true);
    try {
      const r = await api.post<CreateResp>("/portfolios/create", {
        basePortfId: id, period, amount: Number(amount) || 0, bank,
      });
      setCreated(r);
    } finally { setBusy(false); }
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← 포트폴리오 목록</Text>
      </Pressable>

      <Text style={font.h1}>{p.name}</Text>
      <Text style={[font.sub, { marginTop: space(1) }]}>{p.tagline}</Text>

      <View style={styles.kpis}>
        <Kpi label="연 기대수익" value={`+${p.expectedReturn}%`} color={colors.success} />
        <Kpi label="안정 수치" value={`${p.stability}`} color={colors.primary} />
        <Kpi label="권장 등급" value={`${p.riskGrade}등급`} color={colors.ink} />
      </View>

      <Card style={{ marginTop: space(5) }}>
        <Text style={font.h3}>구성 비율</Text>
        <View style={{ marginTop: space(3) }}><CompoBars items={p.composition} /></View>
      </Card>

      <Card style={{ marginTop: space(4) }}>
        <Text style={font.h3}>백테스팅 성과 (최근 6년)</Text>
        <Text style={[font.tiny, { marginTop: 2 }]}>2019년 100 기준 누적 성과</Text>
        <View style={{ marginTop: space(3), alignItems: "center" }}>
          <LineChart data={p.backtest} width={300} height={150} />
        </View>
      </Card>

      <Text style={[font.body, { marginTop: space(4), color: colors.sub }]}>{p.description}</Text>

      {/* 투자 목표 설정 */}
      <SectionTitle title="투자 목표 설정" />
      <Card>
        <Text style={styles.fieldLabel}>투자 기간</Text>
        <View style={styles.chipRow}>
          {PERIODS.map((m) => (
            <Chip key={m} testID={`period-${m}`} label={`${m}개월`} active={period === m} onPress={() => setPeriod(m)} />
          ))}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: space(4) }]}>투자 금액</Text>
        <View style={styles.amountBox}>
          <TextInput
            testID="amount-input"
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            style={styles.amountInput}
            placeholder="1000000"
          />
          <Text style={styles.amountUnit}>원</Text>
        </View>
        <View style={styles.quickRow}>
          {[100000, 500000, 1000000, 5000000].map((q) => (
            <Pressable key={q} onPress={() => setAmount(String(q))} style={styles.quickBtn}>
              <Text style={styles.quickText}>+{(q / 10000).toLocaleString()}만</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: space(4) }]}>주거래은행</Text>
        <View style={styles.chipRow}>
          {BANKS.map((b) => (
            <Chip key={b} testID={`bank-${b}`} label={b} active={bank === b} onPress={() => setBank(b)} />
          ))}
        </View>

        <Btn testID="create-portfolio" style={{ marginTop: space(5) }} label={busy ? "구성 중…" : "나만의 포트폴리오 생성하기"} disabled={busy} onPress={create} />
      </Card>

      {/* 생성 결과 + 시사 선호 반영 제안 + 예상 결과 */}
      {created && (
        <View style={{ marginTop: space(5) }}>
          <SectionTitle title="나만의 포트폴리오" />
          <Card style={{ borderWidth: 2, borderColor: useAdjusted ? colors.mint : colors.primary }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space(2) }}>
              <StaFin size={36} animate={false} />
              <View style={{ flex: 1 }}>
                <Text style={font.h3}>{created.mine.base.name}</Text>
                <Text style={font.tiny}>{created.mine.period}개월 · {won(created.mine.amount)} · {created.mine.bank}</Text>
              </View>
              {useAdjusted && <Tag label="시사 반영" color="#fff" bg={colors.mint} />}
            </View>
            <View style={{ marginTop: space(4) }}>
              <CompoBars items={useAdjusted ? created.newsAdjustedProposal.composition : created.mine.composition} />
            </View>

            {/* 예상 결과 */}
            <View style={styles.projBox}>
              <Text style={font.tiny}>{created.projection.months}개월 후 예상 평가액</Text>
              <Text style={styles.projVal}>
                {won(useAdjusted ? created.projection.projectedAdjusted : created.projection.projectedBase)}
              </Text>
              <Text style={[font.sub, { color: colors.success }]}>
                원금 {won(created.projection.principal)} 대비 +{won((useAdjusted ? created.projection.projectedAdjusted : created.projection.projectedBase) - created.projection.principal)}
              </Text>
            </View>
          </Card>

          {/* 시사 선호 반영 제안 */}
          <Card style={{ marginTop: space(3), backgroundColor: colors.primarySoft }}>
            <Text style={[font.h3, { color: colors.primaryDark }]}>📰 손님 시사 선호 반영 제안</Text>
            <Text style={[font.sub, { color: colors.primaryDark, marginTop: space(1) }]}>{created.newsAdjustedProposal.reason}</Text>
            <Btn
              testID="toggle-adjusted"
              style={{ marginTop: space(3) }}
              variant={useAdjusted ? "ghost" : "primary"}
              small
              label={useAdjusted ? "기본 구성으로 되돌리기" : "시사 선호 반영 구성으로 변경"}
              onPress={() => setUseAdjusted((v) => !v)}
            />
          </Card>

          <Btn style={{ marginTop: space(4) }} variant="dark" label="이 포트폴리오로 시작하기" onPress={() => router.back()} />
        </View>
      )}
    </Screen>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={font.tiny}>{label}</Text>
      <Text style={[styles.kpiVal, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { paddingVertical: space(3) },
  backText: { ...font.sub, color: colors.primary, fontWeight: "700" },
  kpis: { flexDirection: "row", gap: space(3), marginTop: space(4) },
  kpi: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: space(4), alignItems: "center", ...shadow.card },
  kpiVal: { fontSize: 19, fontWeight: "800", marginTop: 4 },
  fieldLabel: { ...font.sub, fontWeight: "800", color: colors.ink },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space(2), marginTop: space(2) },
  amountBox: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: space(4), marginTop: space(2) },
  amountInput: { flex: 1, fontSize: 20, fontWeight: "800", color: colors.ink, paddingVertical: space(3) },
  amountUnit: { ...font.h3 },
  quickRow: { flexDirection: "row", gap: space(2), marginTop: space(2) },
  quickBtn: { backgroundColor: colors.chip, paddingVertical: space(2), paddingHorizontal: space(3), borderRadius: radius.sm },
  quickText: { ...font.tiny, color: colors.sub },
  projBox: { marginTop: space(4), paddingTop: space(4), borderTopWidth: 1, borderTopColor: colors.line, alignItems: "center" },
  projVal: { fontSize: 26, fontWeight: "900", color: colors.ink, marginVertical: 2 },
});
