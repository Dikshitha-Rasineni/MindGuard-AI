import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DashboardScreen from './DashboardScreen';
import PredictionsScreen from './PredictionsScreen';
import AnalyticsScreen from './AnalyticsScreen';
import ProfileScreen from './ProfileScreen';

const TABS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'predictions', label: 'Predict', icon: '🔮' },
  { key: 'analytics', label: 'Analytics', icon: '📊' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

export default function MainTabs({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [dashboardData, setDashboardData] = useState(null);
  const [aiData, setAiData] = useState(null);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <DashboardScreen onLogout={onLogout} onDataUpdate={(d, a) => { setDashboardData(d); setAiData(a); }} />;
      case 'predictions': return <PredictionsScreen dashboardData={dashboardData} aiData={aiData} />;
      case 'analytics': return <AnalyticsScreen dashboardData={dashboardData} />;
      case 'profile': return <ProfileScreen onLogout={onLogout} />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => setActiveTab(tab.key)}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingBottom: 20, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', position: 'relative' },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  tabLabelActive: { color: '#14B8A6', fontWeight: '600' },
  tabIndicator: { position: 'absolute', top: -8, width: 24, height: 3, backgroundColor: '#14B8A6', borderRadius: 2 },
});
