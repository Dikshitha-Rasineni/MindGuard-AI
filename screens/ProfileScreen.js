import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ onLogout }) {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userName').then(n => setUserName(n || ''));
  }, []);

  const menuItems = [
    { icon: '🔔', label: 'Notifications', sub: 'Daily reminders & alerts' },
    { icon: '🔒', label: 'Privacy', sub: 'Data & security settings' },
    { icon: '📤', label: 'Export Data', sub: 'Download your wellness logs' },
    { icon: '❓', label: 'Help & Support', sub: 'FAQs and contact' },
    { icon: '⭐', label: 'Rate MindGuard', sub: 'Leave a review' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userName?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{userName || 'User'}</Text>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>✨ MindGuard Free</Text>
        </View>
      </View>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuRow}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>🚪 Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>MindGuard AI v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#14B8A6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 30, fontWeight: '700', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  planBadge: { backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4, marginTop: 10 },
  planText: { color: '#14B8A6', fontSize: 12, fontWeight: '600' },
  section: { backgroundColor: '#fff', borderRadius: 16, margin: 16, padding: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  menuSub: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  menuArrow: { fontSize: 20, color: '#CBD5E1' },
  logoutBtn: { margin: 16, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 8 },
});
