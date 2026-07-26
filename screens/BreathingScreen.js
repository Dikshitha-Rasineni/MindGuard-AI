import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const PHASES = [
  { label: 'Breathe In', duration: 4000, toValue: 1 },
  { label: 'Hold', duration: 2000, toValue: 1 },
  { label: 'Breathe Out', duration: 4000, toValue: 0.4 },
  { label: 'Hold', duration: 2000, toValue: 0.4 },
];

export default function BreathingScreen({ onBack }) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const animRef = useRef(null);

  const runPhase = (index) => {
    const phase = PHASES[index];
    animRef.current = Animated.timing(scale, {
      toValue: phase.toValue,
      duration: phase.duration,
      useNativeDriver: true,
    });
    animRef.current.start(({ finished }) => {
      if (finished) {
        const next = (index + 1) % PHASES.length;
        setPhaseIndex(next);
        runPhase(next);
      }
    });
  };

  useEffect(() => {
    if (running) runPhase(phaseIndex);
    return () => { if (animRef.current) animRef.current.stop(); };
  }, [running]);

  const toggle = () => {
    if (running) { animRef.current?.stop(); setRunning(false); }
    else { setRunning(true); runPhase(phaseIndex); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mindful Breathing</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.body}>
        <Text style={styles.sub}>Follow the circle</Text>
        <View style={styles.circleWrapper}>
          <Animated.View style={[styles.outerRing, { transform: [{ scale }] }]} />
          <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
            <Text style={styles.phaseText}>{PHASES[phaseIndex].label}</Text>
          </Animated.View>
        </View>
        <TouchableOpacity style={styles.toggleBtn} onPress={toggle}>
          <Text style={styles.toggleText}>{running ? '⏸  Pause' : '▶  Resume'}</Text>
        </TouchableOpacity>
        <Text style={styles.tip}>4 sec in · 2 sec hold · 4 sec out</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { color: '#94A3B8', fontSize: 14 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sub: { color: '#94A3B8', fontSize: 14, marginBottom: 60 },
  circleWrapper: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: 60 },
  outerRing: { position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: 'rgba(20,184,166,0.3)' },
  circle: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#14B8A6', alignItems: 'center', justifyContent: 'center' },
  phaseText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  toggleBtn: { backgroundColor: '#1E293B', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, marginBottom: 24 },
  toggleText: { color: '#14B8A6', fontWeight: '700', fontSize: 15 },
  tip: { color: '#475569', fontSize: 13 },
});
