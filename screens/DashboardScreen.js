import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Svg, Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { getDashboard, getAIInsight } from '../services/api';
import LogDataModal from './LogDataModal';
import BreathingScreen from './BreathingScreen';

const W = Dimensions.get('window').width;

// Burnout Gauge (semicircle)
function BurnoutGauge({ score }) {
  const width = 220;
  const height = 130;
  const cx = width / 2;
  const cy = height - 10;
  const r = 90;
  const strokeWidth = 18;

  const angleToXY = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx - r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
    };
  };

  const arc = (startDeg, endDeg, color) => {
    const start = angleToXY(startDeg);
    const end = angleToXY(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return (
      <Path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  };

  const needleDeg = (score / 100) * 180;
  const needleTip = angleToXY(needleDeg);
  const getColor = s => s >= 75 ? '#EF4444' : s >= 50 ? '#F59E0B' : '#10B981';

  return (
    <Svg width={width} height={height + 30}>
      {arc(0, 180, '#F1F5F9')}
      {arc(0, 60, '#10B981')}
      {arc(60, 120, '#F59E0B')}
      {arc(120, 180, '#EF4444')}
      <Path
        d={`M ${cx} ${cy} L ${needleTip.x} ${needleTip.y}`}
        stroke="#1E293B"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Circle cx={cx} cy={cy} r={6} fill="#1E293B" />
      <SvgText
        x={cx}
        y={cy + 28}
        textAnchor="middle"
        fontSize="30"
        fontWeight="800"
        fill={getColor(score)}
      >
        {score}
      </SvgText>
    </Svg>
  );
}


// Donut Chart for workload balance
function DonutChart({ focus, meetings, other }) {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 45;
  const strokeWidth = 18;
  const total = (focus + meetings + other) || 1;

  const focusPct = focus / total;
  const meetingsPct = meetings / total;
  const otherPct = other / total;

  const circumference = 2 * Math.PI * r;

  const focusDash = focusPct * circumference;
  const meetingsDash = meetingsPct * circumference;
  const otherDash = otherPct * circumference;

  const focusOffset = 0;
  const meetingsOffset = -focusDash;
  const otherOffset = -(focusDash + meetingsDash);

  return (
    <Svg width={size} height={size}>
      {/* Other */}
      <Circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#CBD5E1"
        strokeWidth={strokeWidth}
        strokeDasharray={`${otherDash} ${circumference}`}
        strokeDashoffset={otherOffset}
        rotation="-90"
        origin={`${cx},${cy}`}
      />
      {/* Meetings */}
      <Circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#8B5CF6"
        strokeWidth={strokeWidth}
        strokeDasharray={`${meetingsDash} ${circumference}`}
        strokeDashoffset={meetingsOffset}
        rotation="-90"
        origin={`${cx},${cy}`}
      />
      {/* Focus */}
      <Circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={strokeWidth}
        strokeDasharray={`${focusDash} ${circumference}`}
        strokeDashoffset={focusOffset}
        rotation="-90"
        origin={`${cx},${cy}`}
      />
    </Svg>
  );
}

export default function DashboardScreen({ onLogout, onDataUpdate }) {
  const [data, setData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  const load = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      setUserName(name || 'there');
      const res = await getDashboard();
      setData(res.data);
      onDataUpdate && onDataUpdate(res.data, aiData);
    } catch (e) {
      console.log('load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  const handleLogSaved = async (logData) => {
    setShowLogModal(false);
    setLoading(true);
    await load();
    try {
      const res = await getAIInsight({
        burnoutScore: logData.burnoutScore,
        workHours: logData.workHours,
        meetingHours: logData.meetingHours,
        emailSentiment: logData.emailSentiment,
        focusHours: logData.focusHours,
        breaksToday: logData.breaksToday,
        lateNightWork: logData.lateNightWork,
      });
      setAiData(res.data);
      onDataUpdate && onDataUpdate(data, res.data);
    } catch (e) {
      console.log('AI error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (showBreathing) return <BreathingScreen onBack={() => setShowBreathing(false)} />;

  const latest = data?.latest || {};
  const logs = data?.logs || [];
  const score = latest.burnoutScore ?? 0;
  const hasData = logs.length > 0;

  const getBurnoutColor = s => s >= 75 ? '#EF4444' : s >= 50 ? '#F59E0B' : '#10B981';
  const getBurnoutLabel = s => s >= 75 ? 'Critical!' : s >= 50 ? 'Moderate' : 'Good';

  const chartLogs = logs.slice(-7);
  const chartData = {
    labels: chartLogs.length > 1 ? chartLogs.map((_, i) => `D${i + 1}`) : ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
    datasets: [{
      data: chartLogs.length > 1 ? chartLogs.map(l => l.burnoutScore || 0) : [20, 35, 28, 50, 42, 60, 55],
      color: () => '#14B8A6',
      strokeWidth: 2,
    }],
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#14B8A6" />
      <Text style={styles.loadingText}>Loading wellness data...</Text>
    </View>
  );

  const wb = data?.workloadBalance || { focus: 0, meetings: 0, other: 0 };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting}, {userName}! 👋</Text>
          <Text style={styles.subgreeting}>Here's your mental wellness overview for today.</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />}
      >
        {/* Top stat cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {/* Burnout Score with Gauge */}
          <View style={[styles.bigStatCard, { width: W * 0.52, alignItems: 'center' }]}>
            <Text style={styles.statCardLabel}>Burnout Risk Score</Text>
            <BurnoutGauge score={score} />
            <View style={[styles.badge, { backgroundColor: getBurnoutColor(score) + '20', borderColor: getBurnoutColor(score) }]}>
              <Text style={[styles.badgeText, { color: getBurnoutColor(score) }]}>{getBurnoutLabel(score)}</Text>
            </View>
          </View>

          {/* Work Hours */}
          <View style={[styles.bigStatCard, { width: W * 0.36 }]}>
            <Text style={styles.statCardLabel}>⏱ Work Hours</Text>
            <Text style={styles.statBigNum}>{latest.workHours ?? 0}</Text>
            <Text style={styles.statUnit}>hrs / week</Text>
            <View style={styles.miniBar}>
              <View style={[styles.miniBarFill, { width: `${Math.min((latest.workHours || 0) / 60 * 100, 100)}%`, backgroundColor: '#3B82F6' }]} />
            </View>
          </View>

          {/* Email Sentiment */}
          <View style={[styles.bigStatCard, { width: W * 0.4 }]}>
            <Text style={styles.statCardLabel}>📧 Email Sentiment</Text>
            <Text style={[styles.statBigNum, {
              color: latest.emailSentiment == null ? '#94A3B8' : latest.emailSentiment > 50 ? '#10B981' : '#EF4444',
              fontSize: 18, marginTop: 8
            }]}>
              {latest.emailSentiment == null ? '—' : latest.emailSentiment > 50 ? 'Positive 😊' : 'Negative 😟'}
            </Text>
            <View style={styles.miniBar}>
              <View style={[styles.miniBarFill, { width: `${latest.emailSentiment ?? 0}%`, backgroundColor: (latest.emailSentiment ?? 50) > 50 ? '#10B981' : '#EF4444' }]} />
            </View>
          </View>

          {/* Meetings */}
          <View style={[styles.bigStatCard, { width: W * 0.36 }]}>
            <Text style={styles.statCardLabel}>📅 Meetings</Text>
            <Text style={styles.statBigNum}>{latest.meetingHours ?? 0}</Text>
            <Text style={styles.statUnit}>hrs / week</Text>
            <View style={styles.miniBar}>
              <View style={[styles.miniBarFill, { width: `${Math.min((latest.meetingHours || 0) / 40 * 100, 100)}%`, backgroundColor: '#8B5CF6' }]} />
            </View>
          </View>
        </ScrollView>

        {/* Log Button */}
        <TouchableOpacity style={styles.logBtn} onPress={() => setShowLogModal(true)}>
          <Text style={styles.logBtnText}>🚀 Log Today's Data & Get AI Insight</Text>
        </TouchableOpacity>

        {/* Burnout Trend Line Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Burnout Trend <Text style={styles.cardSub}>(Last 7 logs)</Text></Text>
          <LineChart
            data={chartData}
            width={W - 64}
            height={180}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: () => '#14B8A6',
              labelColor: () => '#94A3B8',
              propsForDots: { r: '5', strokeWidth: '2', stroke: '#0F172A' },
              propsForBackgroundLines: { strokeDasharray: '', stroke: '#F1F5F9', strokeWidth: 1 },
              fillShadowGradientFrom: '#14B8A6',
              fillShadowGradientTo: '#fff',
              fillShadowGradientOpacity: 0.15,
            }}
            bezier
            withInnerLines={true}
            withOuterLines={false}
            style={{ borderRadius: 8, marginTop: 12 }}
          />
          {!hasData && (
            <Text style={{ color: '#94A3B8', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
              Showing sample data — log today to see your real trend
            </Text>
          )}
        </View>

        {/* AI Wellness Coach */}
        {aiData ? (
          <View style={[styles.card, {
            borderLeftWidth: 4,
            borderLeftColor: aiData.urgency === 'critical' ? '#EF4444' : aiData.urgency === 'moderate' ? '#F59E0B' : '#10B981'
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ fontSize: 22 }}>🤖</Text>
              <Text style={styles.cardTitle}>AI Wellness Coach</Text>
            </View>
            <Text style={[styles.urgencyText, {
              color: aiData.urgency === 'critical' ? '#EF4444' : aiData.urgency === 'moderate' ? '#F59E0B' : '#10B981'
            }]}>
              {aiData.urgency === 'critical' ? '🔴 High burnout risk — act today'
                : aiData.urgency === 'moderate' ? '🟡 Moderate risk — take action'
                : '🟢 You\'re doing well!'}
            </Text>
            <Text style={styles.insightText}>{aiData.message}</Text>
          </View>
        ) : (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 20 }]}>
            <Text style={{ fontSize: 32 }}>🤖</Text>
            <Text style={styles.cardTitle}>AI Wellness Coach</Text>
            <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
              Log today's data to get your personalized AI wellness insight
            </Text>
            <TouchableOpacity style={[styles.logBtn, { marginHorizontal: 0, marginTop: 12, paddingVertical: 10 }]} onPress={() => setShowLogModal(true)}>
              <Text style={styles.logBtnText}>🖊 Log today's data →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contributing Factors */}
        {hasData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contributing Factors</Text>
            {(data?.contributingFactors || []).map((f, i) => (
              <View key={i} style={styles.factorRow}>
                <Text style={styles.factorLabel}>{f.label}</Text>
                <View style={styles.factorBarBg}>
                  <View style={[styles.factorBarFill, { width: `${f.value}%`, backgroundColor: f.color }]} />
                </View>
                <Text style={[styles.factorValue, { color: f.color }]}>{f.value}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Today's Suggestions */}
        {aiData?.suggestions?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Suggestions</Text>
            {aiData.suggestions.map((s, i) => (
              <View key={i} style={styles.suggestionRow}>
                <Text style={{ fontSize: 22, marginRight: 12 }}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionTitle}>{s.text}</Text>
                  <Text style={styles.suggestionSub}>{s.sub}</Text>
                </View>
                <Text style={{ color: '#94A3B8', fontSize: 18 }}>→</Text>
              </View>
            ))}
          </View>
        )}

        {/* Weekly Workload Balance with Donut */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Workload Balance</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <DonutChart focus={wb.focus} meetings={wb.meetings} other={wb.other} />
            <View style={{ marginLeft: 20, gap: 8 }}>
              {[
                { label: 'Focus', value: wb.focus, color: '#3B82F6' },
                { label: 'Meetings', value: wb.meetings, color: '#8B5CF6' },
                { label: 'Other', value: wb.other, color: '#CBD5E1' },
              ].map((b, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: b.color }} />
                  <Text style={{ fontSize: 13, color: '#64748B' }}>{b.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>{b.value} hrs</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
            <Text style={{ fontSize: 13, color: '#64748B' }}>
              Productivity{' '}
              <Text style={{ color: (data?.productivity || 0) >= 50 ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                ▼ {data?.productivity || 0}%
              </Text>
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B' }}>
              Stress Level{' '}
              <Text style={{ color: (data?.stressLevel || 0) >= 50 ? '#EF4444' : '#10B981', fontWeight: '700' }}>
                ▼ {data?.stressLevel || 0}%
              </Text>
            </Text>
          </View>
        </View>

        {/* Mindful Break */}
        <View style={styles.breakCard}>
          <View>
            <Text style={styles.breakTitle}>🌿 Take a Mindful Break</Text>
            <Text style={styles.breakSub}>5 min breathing exercise</Text>
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={() => setShowBreathing(true)}>
            <Text style={styles.startBtnText}>▶ Start Now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <LogDataModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSaved={handleLogSaved}
        userName={userName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { color: '#94A3B8', marginTop: 12 },
  header: { backgroundColor: '#0F172A', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: '#fff', fontSize: 18, fontWeight: '700' },
  subgreeting: { color: '#64748B', fontSize: 12, marginTop: 2 },
  logoutBtn: { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 12 },
  logoutText: { color: '#94A3B8', fontSize: 12 },
  bigStatCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  statCardLabel: { color: '#64748B', fontSize: 12, marginBottom: 4 },
  badge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 3, alignSelf: 'center', marginTop: 4 },
  badgeText: { fontWeight: '700', fontSize: 13 },
  statBigNum: { fontSize: 28, fontWeight: '700', color: '#0F172A', marginVertical: 4 },
  statUnit: { color: '#94A3B8', fontSize: 11 },
  miniBar: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  miniBarFill: { height: 4, borderRadius: 2 },
  logBtn: { margin: 16, backgroundColor: '#14B8A6', borderRadius: 12, padding: 16, alignItems: 'center' },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 16, marginTop: 0, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  cardSub: { fontSize: 12, fontWeight: '400', color: '#94A3B8' },
  urgencyText: { fontWeight: '700', fontSize: 13, marginBottom: 8 },
  insightText: { color: '#475569', fontSize: 13, lineHeight: 20 },
  factorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  factorLabel: { width: 110, fontSize: 12, color: '#475569' },
  factorBarBg: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  factorBarFill: { height: 8, borderRadius: 4 },
  factorValue: { width: 36, fontSize: 12, fontWeight: '600', textAlign: 'right' },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  suggestionTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  suggestionSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  breakCard: { backgroundColor: '#0F172A', borderRadius: 16, margin: 16, marginTop: 0, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  breakSub: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  startBtn: { backgroundColor: '#14B8A6', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  startBtnText: { color: '#fff', fontWeight: '700' },
});