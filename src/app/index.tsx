import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ApiError } from '@/services/api';
import { remindersService, type Reminder } from '@/services/reminders.service';
import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, loading: authLoading, login, register, logout } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [listError, setListError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const loadReminders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setListError('');
    try {
      const response = await remindersService.list(token);
      setReminders(response.reminders);
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'No se pudieron cargar los recordatorios.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadReminders();
    else setReminders([]);
  }, [token, loadReminders]);

  const submitAuth = async () => {
    if (!email.trim() || !password) {
      setAuthError('Escribe tu correo y contraseña.');
      return;
    }
    if (authMode === 'register' && name.trim().length < 2) {
      setAuthError('Escribe tu nombre (mínimo 2 caracteres).');
      return;
    }
    if (password.length < (authMode === 'register' ? 8 : 1)) {
      setAuthError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setSaving(true);
    setAuthError('');
    try {
      if (authMode === 'register') await register(name, email, password);
      else await login(email, password);
      setPassword('');
    } catch (error) {
      setAuthError(error instanceof ApiError ? error.message : 'No fue posible iniciar sesión. Comprueba que el servidor esté activo.');
    } finally {
      setSaving(false);
    }
  };

  const toggleReminder = async (reminder: Reminder) => {
    if (!token) return;
    try {
      const response = await remindersService.update(token, reminder.id, { completed: !reminder.completed });
      setReminders(current => current.map(item => item.id === reminder.id ? response.reminder : item));
    } catch (error) {
      Alert.alert('No se pudo actualizar', error instanceof Error ? error.message : 'Inténtalo nuevamente.');
    }
  };

  const deleteReminder = async () => {
    if (!token || deleteTarget === null) return;
    try {
      await remindersService.remove(token, deleteTarget);
      setReminders(current => current.filter(item => item.id !== deleteTarget));
    } catch (error) {
      Alert.alert('No se pudo eliminar', error instanceof Error ? error.message : 'Inténtalo nuevamente.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDueAt = (value: string | null) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value.replace(' ', 'T') + (value.endsWith('Z') ? '' : 'Z'));
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  };

  if (authLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#A78BFA" /><Text style={styles.muted}>Preparando RemindME...</Text></View>;
  }

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>RemindME</Text>
          <Text style={styles.tagline}>No olvides lo que importa</Text>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>{authMode === 'login' ? '¡Qué bueno verte!' : 'Crea tu cuenta'}</Text>
            <Text style={styles.muted}>{authMode === 'login' ? 'Inicia sesión para ver tus recordatorios.' : 'Regístrate para guardar tus recordatorios.'}</Text>
            {authMode === 'register' && <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor="#9295A5" value={name} onChangeText={setName} autoCapitalize="words" />}
            <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#9295A5" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <TextInput style={styles.input} placeholder="Contraseña (mínimo 8 caracteres)" placeholderTextColor="#9295A5" value={password} onChangeText={setPassword} secureTextEntry autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} />
            {!!authError && <Text style={styles.error}>{authError}</Text>}
            <Pressable style={[styles.primaryButton, saving && styles.disabled]} onPress={submitAuth} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Text>}
            </Pressable>
            <Pressable onPress={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>
              <Text style={styles.switchText}>{authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const pending = reminders.filter(item => !item.completed).length;
  const completed = reminders.length - pending;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View><Text style={styles.logo}>RemindME</Text><Text style={styles.tagline}>No olvides lo que importa</Text></View>
            <Pressable onPress={() => logout()}><Text style={styles.logout}>Cerrar sesión</Text></Pressable>
          </View>
          <View style={styles.welcome}>
            <Text style={styles.greeting}>¡Hola, {user.name.split(' ')[0]}! 👋</Text>
            <Text style={styles.muted}>¿Qué necesitas recordar hoy?</Text>
          </View>
          <View style={styles.summary}>
            <Text style={styles.sectionTitle}>Resumen de tus recordatorios</Text>
            <View style={styles.stats}>
              <View><Text style={styles.statNumber}>{pending}</Text><Text style={styles.muted}>Pendientes</Text></View>
              <View><Text style={[styles.statNumber, { color: '#34D399' }]}>{completed}</Text><Text style={styles.muted}>Completados</Text></View>
              <View><Text style={[styles.statNumber, { color: '#FFFFFF' }]}>{reminders.length}</Text><Text style={styles.muted}>Total</Text></View>
            </View>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/create-reminder')}><Text style={styles.primaryButtonText}>+ Crear recordatorio</Text></Pressable>
          <View style={styles.listHeader}><Text style={styles.sectionTitle}>Mis recordatorios</Text><Pressable onPress={loadReminders}><Text style={styles.refresh}>Actualizar</Text></Pressable></View>
          {loading && <ActivityIndicator color="#A78BFA" />}
          {!!listError && <Text style={styles.error}>{listError}</Text>}
          {!loading && reminders.length === 0 && <View style={styles.empty}><Text style={styles.muted}>Todavía no tienes recordatorios.</Text><Text style={styles.muted}>Crea el primero para empezar.</Text></View>}
          {reminders.map(reminder => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderTop}>
                <Text style={[styles.reminderTitle, reminder.completed && styles.strike]}>{reminder.title}</Text>
                <Text style={styles.priority}>{reminder.priority}</Text>
              </View>
              {!!reminder.description && <Text style={styles.muted}>{reminder.description}</Text>}
              <Text style={styles.date}>{formatDueAt(reminder.dueAt)}</Text>
              <View style={styles.actions}>
                <Pressable style={[styles.smallButton, reminder.completed && styles.doneButton]} onPress={() => toggleReminder(reminder)}>
                  <Text style={styles.smallButtonText}>{reminder.completed ? 'Marcar pendiente' : 'Completar'}</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={() => setDeleteTarget(reminder.id)}><Text style={styles.smallButtonText}>Eliminar</Text></Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
        <Modal visible={deleteTarget !== null} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
          <View style={styles.overlay}><View style={styles.modal}>
            <Text style={styles.sectionTitle}>Eliminar recordatorio</Text>
            <Text style={styles.muted}>¿Estás seguro de que deseas eliminarlo? Esta acción no se puede deshacer.</Text>
            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={() => setDeleteTarget(null)}><Text style={styles.smallButtonText}>Cancelar</Text></Pressable>
              <Pressable style={styles.deleteButton} onPress={deleteReminder}><Text style={styles.smallButtonText}>Eliminar</Text></Pressable>
            </View>
          </View></View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10121B' },
  safeArea: { flex: 1, paddingHorizontal: 22, paddingTop: 18, width: '100%', maxWidth: 990, alignSelf: 'center' },
  scrollContent: { paddingBottom: 36 },
  center: { flex: 1, backgroundColor: '#10121B', alignItems: 'center', justifyContent: 'center', gap: 12 },
  authContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { color: '#FFFFFF', fontSize: 29, fontWeight: 'bold' },
  tagline: { color: '#9295A5', fontSize: 12, marginTop: 4 },
  authCard: { width: '100%', maxWidth: 430, backgroundColor: '#25283A', borderRadius: 18, padding: 24, marginTop: 32, gap: 14 },
  authTitle: { color: '#FFFFFF', fontSize: 23, fontWeight: 'bold' },
  input: { backgroundColor: '#171A27', color: '#FFFFFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#383B50', marginTop: 4 },
  error: { color: '#FCA5A5', fontSize: 13, marginTop: 8 },
  switchText: { color: '#C4B5FD', textAlign: 'center', marginTop: 10, fontWeight: '600' },
  primaryButton: { backgroundColor: '#8B5CF6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 18 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  disabled: { opacity: 0.6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  logout: { color: '#C4B5FD', fontWeight: '600' },
  welcome: { marginTop: 24, marginBottom: 20 },
  greeting: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  muted: { color: '#A1A4B5', fontSize: 13, marginTop: 4 },
  summary: { backgroundColor: '#25283A', padding: 20, borderRadius: 15, marginTop: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  statNumber: { color: '#A78BFA', fontSize: 27, fontWeight: 'bold' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 14 },
  refresh: { color: '#C4B5FD', fontWeight: '600' },
  empty: { backgroundColor: '#25283A', padding: 22, borderRadius: 12, alignItems: 'center' },
  reminderCard: { backgroundColor: '#25283A', padding: 16, borderRadius: 12, marginBottom: 12, gap: 8 },
  reminderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  reminderTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', flex: 1 },
  strike: { textDecorationLine: 'line-through', color: '#9295A5' },
  priority: { color: '#C4B5FD', fontSize: 12, fontWeight: 'bold' },
  date: { color: '#A78BFA', fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 8, justifyContent: 'flex-end' },
  smallButton: { backgroundColor: '#8B5CF6', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 8 },
  doneButton: { backgroundColor: '#059669' },
  deleteButton: { backgroundColor: '#DC2626', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 8 },
  smallButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: '#25283A', width: '100%', maxWidth: 400, padding: 24, borderRadius: 16, gap: 14 },
  cancelButton: { backgroundColor: '#41445A', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 8 },
});
