import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const W = Dimensions.get('window').width;

export default function PredictionsScreen({ dashboardData, aiData }) {
  const logs = dashboardData?.logs || [];
  const predictions = dashboardData?.predictions || [];
  const hasData = logs.length > 0;

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: () => '#8B5CF6',
    labelColor: () => '#94A3B8',
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#8B5CF6' },
    propsForBackgroundLines: { stroke: '#F1F5F9' },
  };

  const predChartData = {
    labels: predictions.length > 0 ? predictions.map(p => p.day) : ['D+1','D+2','D+3'],
    datasets: [{
      data: predictions.length > 0 ? predictions.map(p => p.score) : [0,0,0],
      color: () => '#8B5CF6',
      strokeWidth: 2,
    }],
  };

  const workHoursData = {
    labels: logs.slice(-5).map((_, i) => `W${i+1}`),
    datasets: [{ data: logs.slice(-5).map(l => l.workHours || 0) }],
  };

  const getRiskLevel = (score) => {
    if (score >= 75) return { label: 'Critical', color: '#EF4444' };
    if (score >= 50) return { label: 'Moderate', color: '#F59E0B' };
    return { label: 'Low', color: '#10B981' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔮 Predictions</Text>
        <Text style={styles.headerSub}>AI-powered burnout forecast</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!hasData ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔮</Text>
            <Text style={styles.emptyTitle}>No predictions yet</Text>
            <Text style={styles.emptySub}>Log at least one day of data to see your burnout predictions</Text>
          </View>
        ) : (
          <>
            {/* Next 3 Days Forecast */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Next 3 Days Forecast</Text>
              <Text style={styles.cardSub}>Based on your recent trend</Text>
              <LineChart
                data={predChartData}
                width={W - 64}
                height={160}
                chartConfig={{ ...chartConfig, color: () => '#8B5CF6' }}
                bezier
                style={{ borderRadius: 8, marginTop: 12 }}
              />
              <View style={styles.predCards}>
                {predictions.map((p, i) => {
                  const risk = getRiskLevel(p.score);
                  return (
                    <View key={i} style={[styles.predCard, { borderColor: risk.color }]}>
                      <Text style={styles.predDay}>{p.day}</Text>
                      <Text style={[styles.predScore, { color: risk.color }]}>{p.score}</Text>
                      <Text style={[styles.predLabel, { color: risk.color }]}>{risk.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Work Hours Trend */}
            {logs.length >= 2 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Work Hours Trend</Text>
                <BarChart
                  data={workHoursData}
                  width={W - 64}
                  height={160}
                  chartConfig={{ ...chartConfig, color: () => '#3B82F6' }}
                  style={{ borderRadius: 8, marginTop: 12 }}
                  showValuesOnTopOfBars
                />
              </View>
            )}

            {/* Risk Insights */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Risk Insights</Text>
              {[
                { label: 'If trend continues', value: predictions[2]?.score ?? 0, desc: 'Score in 3 days' },
                { label: 'Peak risk day', value: Math.max(...predictions.map(p => p.score)), desc: 'Highest predicted score' },
                { label: 'Current trajectory', value: predictions.length > 1 && predictions[predictions.length-1].score > predictions[0].score ? '📈 Rising' : '📉 Falling', isText: true, desc: 'Burnout trend direction' },
              ].map((item, i) => (
                <View key={i} style={styles.insightRow}>
                  <View>
                    <Text style={styles.insightLabel}>{item.label}</Text>
                    <Text style={styles.insightDesc}>{item.desc}</Text>
                  </View>
                  {item.isText
                    ? <Text style={styles.insightValue}>{item.value}</Text>
                    : <Text style={[styles.insightValue, { color: getRiskLevel(item.value).color }]}>{item.value}</Text>
                  }
                </View>
              ))}
            </View>

            {/* AI Recommendations */}
            {aiData?.suggestions?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🤖 AI Recommendations</Text>
                <Text style={styles.cardSub}>To improve your forecast</Text>
                {aiData.suggestions.map((s, i) => (
                  <View key={i} style={styles.recRow}>
                    <Text style={styles.recIcon}>{s.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recTitle}>{s.text}</Text>
                      <Text style={styles.recSub}>{s.sub}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerSub: { color: '#64748B', fontSize: 13, marginTop: 2 },
  emptyState: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  emptySub: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 16, marginBottom: 0, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardSub: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  predCards: { flexDirection: 'row', gap: 10, marginTop: 12 },
  predCard: { flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 12, alignItems: 'center' },
  predDay: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  predScore: { fontSize: 24, fontWeight: '800' },
  predLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  insightLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  insightDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  insightValue: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  recIcon: { fontSize: 20 },
  recTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  recSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
});