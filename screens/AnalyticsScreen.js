import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

function SimpleBarChart({ data, labels, color }) {
  const max = Math.max(...data, 1);
  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6 }}>
        {data.map((val, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: '#94A3B8', marginBottom: 2 }}>{val}</Text>
            <View style={{ width: '80%', height: (val / max) * 80, backgroundColor: color || '#14B8A6', borderRadius: 4, minHeight: 4 }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 4, gap: 6 }}>
        {labels.map((l, i) => (
          <Text key={i} style={{ flex: 1, fontSize: 9, color: '#94A3B8', textAlign: 'center' }}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen({ dashboardData }) {
  const logs = dashboardData?.logs || [];
  const hasData = logs.length > 0;

  const last7 = logs.slice(-7);

  const avgBurnout = hasData ? Math.round(logs.reduce((a, l) => a + (l.burnoutScore || 0), 0) / logs.length) : 0;
  const avgWork = hasData ? Math.round(logs.reduce((a, l) => a + (l.workHours || 0), 0) / logs.length) : 0;
  const avgFocus = hasData ? Math.round(logs.reduce((a, l) => a + (l.focusHours || 0), 0) / logs.length) : 0;
  const avgBreaks = hasData ? (logs.reduce((a, l) => a + (l.breaksToday || 0), 0) / logs.length).toFixed(1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Analytics</Text>
        <Text style={styles.headerSub}>Your wellness over time</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {!hasData ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No analytics yet</Text>
            <Text style={styles.emptySub}>Log your wellness data to see detailed analytics</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryRow}>
              {[
                { label: 'Avg Burnout', value: avgBurnout, color: avgBurnout >= 75 ? '#EF4444' : avgBurnout >= 50 ? '#F59E0B' : '#10B981', unit: '/100' },
                { label: 'Avg Work', value: avgWork, color: '#3B82F6', unit: 'hrs' },
                { label: 'Avg Focus', value: avgFocus, color: '#10B981', unit: 'hrs' },
                { label: 'Avg Breaks', value: avgBreaks, color: '#8B5CF6', unit: '/day' },
              ].map((s, i) => (
                <View key={i} style={styles.summaryCard}>
                  <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.summaryUnit}>{s.unit}</Text>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {last7.length > 1 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Burnout Score Trend</Text>
                <SimpleBarChart
                  data={last7.map(l => l.burnoutScore || 0)}
                  labels={last7.map((_, i) => `D${i + 1}`)}
                  color="#EF4444"
                />
              </View>
            )}

            {last7.length > 1 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Work Hours Trend</Text>
                <SimpleBarChart
                  data={last7.map(l => l.workHours || 0)}
                  labels={last7.map((_, i) => `D${i + 1}`)}
                  color="#3B82F6"
                />
              </View>
            )}

            {last7.length > 1 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Focus vs Meeting Hours</Text>
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8, marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' }} />
                    <Text style={{ fontSize: 12, color: '#64748B' }}>Focus</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B5CF6' }} />
                    <Text style={{ fontSize: 12, color: '#64748B' }}>Meetings</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 }}>
                  {last7.map((l, i) => {
                    const maxVal = Math.max(...last7.map(x => Math.max(x.focusHours || 0, x.meetingHours || 0)), 1);
                    return (
                      <View key={i} style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                        <View style={{ flex: 1, height: ((l.focusHours || 0) / maxVal) * 80, backgroundColor: '#3B82F6', borderRadius: 3, minHeight: 2 }} />
                        <View style={{ flex: 1, height: ((l.meetingHours || 0) / maxVal) * 80, backgroundColor: '#8B5CF6', borderRadius: 3, minHeight: 2 }} />
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 4, gap: 4 }}>
                  {last7.map((_, i) => (
                    <Text key={i} style={{ flex: 1, fontSize: 9, color: '#94A3B8', textAlign: 'center' }}>D{i + 1}</Text>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Data Summary</Text>
              {[
                { label: 'Total logs', value: logs.length },
                { label: 'Days tracked', value: logs.length },
                { label: 'Best burnout score', value: Math.min(...logs.map(l => l.burnoutScore || 100)) },
                { label: 'Worst burnout score', value: Math.max(...logs.map(l => l.burnoutScore || 0)) },
              ].map((r, i) => (
                <View key={i} style={styles.dataRow}>
                  <Text style={styles.dataLabel}>{r.label}</Text>
                  <Text style={styles.dataValue}>{r.value}</Text>
                </View>
              ))}
            </View>
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
  summaryRow: { flexDirection: 'row', padding: 16, paddingBottom: 0, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  summaryValue: { fontSize: 20, fontWeight: '800' },
  summaryUnit: { fontSize: 10, color: '#94A3B8' },
  summaryLabel: { fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 16, marginBottom: 0, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dataLabel: { fontSize: 14, color: '#475569' },
  dataValue: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
});
