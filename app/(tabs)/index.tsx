import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar,
  SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, signup } from '../../services/api';
import MainTabs from '../../screens/MainTabs';

type Mode = 'signin' | 'signup';

export default function App() {
  const [screen, setScreen] = useState<'login' | 'main'>('login');
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [booting, setBooting] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('token').then(token => {
      if (token) setScreen('main');
      setBooting(false);
    });
  }, []);

  const switchMode = (m: Mode) => { setMode(m); setError(''); };

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password || (mode === 'signup' && !name.trim())) {
      return setError('Please fill all fields');
    }
    if (mode === 'signup' && password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setBusy(true);
    try {
      const res = mode === 'signup'
        ? await signup(name.trim(), email.trim(), password)
        : await login(email.trim(), password);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userName', res.data.user?.name || email);
      setPassword('');
      setScreen('main');
    } catch (err: any) {
      setError(err.response?.data?.message ||
        (err.code === 'ECONNABORTED' ? 'The server is taking too long. Please try again.' : 'Could not reach the server'));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'userName']);
    setScreen('login');
  };

  if (booting) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>🧠</Text>
        <Text style={styles.splashName}>MindGuard <Text style={styles.ai}>AI</Text></Text>
      </View>
    );
  }

  if (screen === 'main') return <MainTabs onLogout={handleLogout} />;

  const isSignup = mode === 'signup';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.appName}>MindGuard <Text style={styles.ai}>AI</Text></Text>
        </View>
        <Text style={styles.subtitle}>Your mental wellness companion</Text>
        <View style={styles.card}>
          <View style={styles.tabs}>
            {(['signin', 'signup'] as Mode[]).map(m => (
              <TouchableOpacity key={m} style={[styles.tab, mode === m && styles.tabActive]} onPress={() => switchMode(m)}>
                <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>{m === 'signin' ? 'Sign In' : 'Create Account'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {isSignup && (
            <>
              <Text style={styles.label}>NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#475569"
                value={name}
                onChangeText={setName}
              />
            </>
          )}
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
            placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
            placeholderTextColor="#475569"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleSubmit}
            secureTextEntry
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity style={[styles.btn, busy && styles.btnBusy]} onPress={handleSubmit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isSignup ? 'Create Account →' : 'Sign In →'}</Text>}
          </TouchableOpacity>
          {!isSignup && (
            <Text style={styles.hint}>Trying it out? Use demo@mindguard.app / mindguard-demo</Text>
          )}
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
  inner: { flex: 1, justifyContent: 'center', width: '100%', maxWidth: 440, alignSelf: 'center' },
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
  btnBusy: { opacity: 0.7 },
  tabs: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: '#14B8A6' },
  tabText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  error: { color: '#F87171', marginTop: 14, fontSize: 14 },
  hint: { color: '#64748B', textAlign: 'center', marginTop: 16, fontSize: 12 },
});
