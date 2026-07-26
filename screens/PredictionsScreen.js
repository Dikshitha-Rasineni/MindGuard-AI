import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

function SimpleBarChart({ data, labels, color }) {
  const max = Math.max(...data, 1);
  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8 }}>
        {data.map((val, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: '#94A3B8', marginBottom: 2 }}>{val}</Text>
            <View style={{ width: '80%', height: (val / max) * 80, backgroundColor: color || '#8B5CF6', borderRadius: 4, minHeight: 4 }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 4, gap: 8 }}>
        {labels.map((l, i) => (
          <Text key={i} style={{ flex: 1, fontSize: 9, color: '#94A3B8', textAlign: 'center' }}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

export default function PredictionsScreen({ dashboardData, aiData }) {
  const logs = dashboardData?.logs || [];
  const predictions = dashboardData?.predictions || [];
  const hasData = logs.length > 0;

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
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Next 3 Days Forecast</Text>
              <Text style={styles.cardSub}>Based on your recent trend</Text>
              <SimpleBarChart
                data={predictions.length > 0 ? predictions.map(p => p.score) : [0, 0, 0]}
                labels={predictions.length > 0 ? predictions.map(p => p.day) : ['D+1', 'D+2', 'D+3']}
                color="#8B5CF6"
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
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

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Risk Insights</Text>
              {[
                { label: 'Score in 3 days', value: predictions[2]?.score ?? 0, desc: 'If current trend continues' },
                { label: 'Peak predicted score', value: Math.max(...predictions.map(p => p.score)), desc: 'Highest forecast value' },
                { label: 'Trend direction', value: predictions.length > 1 && predictions[predictions.length - 1].score > predictions[0].score ? '📈 Rising' : '📉 Falling', isText: true, desc: 'Burnout trajectory' },
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

            {aiData?.suggestions?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🤖 AI Recommendations</Text>
                <Text style={styles.cardSub}>To improve your forecast</Text>
                {aiData.suggestions.map((s, i) => (
                  <View key={i} style={styles.recRow}>
                    <Text style={{ fontSize: 20 }}>{s.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
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
  predCard: { flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 12, alignItems: 'center' },
  predDay: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  predScore: { fontSize: 24, fontWeight: '800' },
  predLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  insightLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  insightDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  insightValue: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  recTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  recSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
});
