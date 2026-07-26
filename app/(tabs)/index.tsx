import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, StatusBar,
  SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../services/api';
import MainTabs from '../../screens/MainTabs';

export default function App() {
  const [screen, setScreen] = useState<'login' | 'main'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('token').then(token => {
      if (token) setScreen('main');
      setLoading(false);
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    setLoading(true);
    try {
      const res = await login(email, password);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userName', res.data.user?.name || email);
      setScreen('main');
    } catch (err: any) {
      Alert.alert('Login failed', err.response?.data?.message || 'Check your credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'userName']);
    setScreen('login');
  };

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>🧠</Text>
        <Text style={styles.splashName}>MindGuard <Text style={styles.ai}>AI</Text></Text>
      </View>
    );
  }

  if (screen === 'main') return <MainTabs onLogout={handleLogout} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.appName}>MindGuard <Text style={styles.ai}>AI</Text></Text>
        </View>
        <Text style={styles.subtitle}>Your mental wellness companion</Text>
        <View style={styles.card}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#475569"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In →</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  splashLogo: { fontSize: 56, marginBottom: 12 },
  splashName: { fontSize: 28, fontWeight: '700', color: '#fff' },
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logo: { fontSize: 36, marginRight: 10 },
  appName: { fontSize: 28, fontWeight: '700', color: '#fff' },
  ai: { color: '#14B8A6' },
  subtitle: { color: '#64748B', textAlign: 'center', marginBottom: 40, fontSize: 15 },
  card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 24 },
  label: { color: '#64748B', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#0F172A', borderRadius: 10, padding: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#334155' },
  btn: { backgroundColor: '#14B8A6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
