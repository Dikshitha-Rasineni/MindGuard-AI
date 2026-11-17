import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { notify } from '../services/notify';
import { logWellnessData } from '../services/api';

function calcScore({ workHours, meetingHours, focusHours, breaksToday, emailSentiment, lateNightWork }) {
  let score = 0;
  score += Math.min((workHours || 0) / 60 * 40, 40);
  score += Math.min((meetingHours || 0) / 30 * 20, 20);
  score += Math.max(0, (100 - (emailSentiment || 50)) / 100 * 15);
  score += (lateNightWork || 0) / 100 * 15;
  score -= Math.min((breaksToday || 0) * 2, 10);
  score -= Math.min((focusHours || 0) / 40 * 10, 10);
  return Math.round(Math.max(0, Math.min(100, score)));
}

export default function LogDataModal({ visible, onClose, onSaved }) {
  const [workHours, setWorkHours] = useState('');
  const [meetingHours, setMeetingHours] = useState('');
  const [focusHours, setFocusHours] = useState('');
  const [breaksToday, setBreaksToday] = useState('');
  const [emailSentiment, setEmailSentiment] = useState(50);
  const [lateNightWork, setLateNightWork] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [saving, setSaving] = useState(false);

  const liveScore = calcScore({
    workHours: +workHours, meetingHours: +meetingHours,
    focusHours: +focusHours, breaksToday: +breaksToday,
    emailSentiment, lateNightWork,
  });

  const handleSave = async () => {
    if (!workHours) return notify('Missing', 'Please enter work hours');
    setSaving(true);
    try {
      await logWellnessData({
        workHours: +workHours, meetingHours: +meetingHours,
        focusHours: +focusHours, breaksToday: +breaksToday,
        emailSentiment, lateNightWork, timeOfDay,
      });
      onSaved({
        burnoutScore: liveScore,
        workHours: +workHours,
        meetingHours: +meetingHours,
        focusHours: +focusHours,
        breaksToday: +breaksToday,
        emailSentiment,
        lateNightWork,
      });
    } catch (e) {
      console.log('Save error:', e);
      notify('Error', 'Could not save your log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Simple slider using TouchableOpacity buttons
  const SliderRow = ({ label, value, onChange, color }) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label} — {value}%</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity onPress={() => onChange(Math.max(0, value - 10))} style={styles.sliderBtn}>
          <Text style={styles.sliderBtnText}>−</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ width: `${value}%`, height: 8, backgroundColor: color, borderRadius: 4 }} />
        </View>
        <TouchableOpacity onPress={() => onChange(Math.min(100, value + 10))} style={styles.sliderBtn}>
          <Text style={styles.sliderBtnText}>+</Text>
        </TouchableOpacity>
        <Text style={{ width: 36, fontSize: 12, color: '#64748B', textAlign: 'right' }}>{value}%</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Log Today's Wellness Data</Text>
              <Text style={styles.sub}>Saved securely → AI generates your insight</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>TIME OF DAY</Text>
            <View style={styles.segRow}>
              {['Morning', 'Afternoon', 'Evening'].map(t => (
                <TouchableOpacity key={t} style={[styles.seg, timeOfDay === t && styles.segActive]} onPress={() => setTimeOfDay(t)}>
                  <Text style={[styles.segText, timeOfDay === t && styles.segTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row2}>
              <View style={styles.half}>
                <Text style={styles.label}>WORK HOURS</Text>
                <TextInput style={styles.input} value={workHours} onChangeText={setWorkHours} keyboardType="numeric" placeholder="e.g. 54" placeholderTextColor="#9CA3AF" />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>MEETING HOURS</Text>
                <TextInput style={styles.input} value={meetingHours} onChangeText={setMeetingHours} keyboardType="numeric" placeholder="e.g. 29" placeholderTextColor="#9CA3AF" />
              </View>
            </View>

            <View style={styles.row2}>
              <View style={styles.half}>
                <Text style={styles.label}>FOCUS HOURS</Text>
                <TextInput style={styles.input} value={focusHours} onChangeText={setFocusHours} keyboardType="numeric" placeholder="e.g. 4" placeholderTextColor="#9CA3AF" />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>BREAKS TODAY</Text>
                <TextInput style={styles.input} value={breaksToday} onChangeText={setBreaksToday} keyboardType="numeric" placeholder="e.g. 2" placeholderTextColor="#9CA3AF" />
              </View>
            </View>

            <SliderRow label="EMAIL SENTIMENT" value={emailSentiment} onChange={setEmailSentiment} color="#14B8A6" />
            <SliderRow label="LATE NIGHT WORK" value={lateNightWork} onChange={setLateNightWork} color="#3B82F6" />

            <View style={styles.preview}>
              <Text style={styles.previewLabel}>⚡ LIVE PREVIEW</Text>
              <View style={styles.previewStats}>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewVal, { color: liveScore >= 75 ? '#EF4444' : liveScore >= 50 ? '#F59E0B' : '#10B981' }]}>{liveScore}</Text>
                  <Text style={styles.previewKey}>Risk score</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewVal}>{workHours || 0}</Text>
                  <Text style={styles.previewKey}>Work hrs</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={styles.previewVal}>{emailSentiment}%</Text>
                  <Text style={styles.previewKey}>Sentiment</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewVal, { color: liveScore >= 75 ? '#EF4444' : '#10B981', fontSize: 14 }]}>
                    {liveScore >= 75 ? 'High' : liveScore >= 50 ? 'Med' : 'Good'}
                  </Text>
                  <Text style={styles.previewKey}>Risk</Text>
                </View>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>🚀 Save & Get AI Insight</Text>}
              </TouchableOpacity>
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  closeBtn: { backgroundColor: '#F1F5F9', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeX: { color: '#64748B', fontSize: 16 },
  label: { fontSize: 11, fontWeight: '600', color: '#64748B', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  segRow: { flexDirection: 'row', gap: 8 },
  seg: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', padding: 10, alignItems: 'center' },
  segActive: { backgroundColor: '#14B8A6', borderColor: '#14B8A6' },
  segText: { color: '#64748B', fontSize: 13 },
  segTextActive: { color: '#fff', fontWeight: '600' },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, fontSize: 15, color: '#0F172A' },
  sliderBtn: { backgroundColor: '#F1F5F9', borderRadius: 6, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  sliderBtnText: { fontSize: 18, color: '#475569', fontWeight: '600' },
  preview: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginTop: 8 },
  previewLabel: { fontSize: 11, color: '#065F46', fontWeight: '600', marginBottom: 12 },
  previewStats: { flexDirection: 'row', justifyContent: 'space-around' },
  previewItem: { alignItems: 'center' },
  previewVal: { fontSize: 20, fontWeight: '700', color: '#14B8A6' },
  previewKey: { fontSize: 11, color: '#64748B', marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 16, alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: '#14B8A6', borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
