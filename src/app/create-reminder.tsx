import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ApiError } from '@/services/api';
import { remindersService, type ReminderPriority } from '@/services/reminders.service';
import { useAuth } from '@/contexts/auth-context';
import DateTimeFields from '@/components/date-time-fields';

export default function CreateReminderScreen() {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<ReminderPriority>('Media');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && (!token || !user)) {
    router.replace('/');
    return null;
  }

  const toIsoDate = (): string | null => {
    if (!date && !time) return null;
    if (!date || !time) throw new Error('Selecciona tanto la fecha como la hora, o deja ambos campos vacíos.');
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (!Number.isFinite(parsed.getTime()) || parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 || parsed.getDate() !== day ||
      parsed.getHours() !== hour || parsed.getMinutes() !== minute) {
      throw new Error('La fecha o la hora seleccionada no es válida.');
    }
    if (parsed.getTime() <= Date.now()) throw new Error('Selecciona una fecha y hora futuras.');
    return parsed.toISOString();
  };

  const saveReminder = async () => {
    if (!token || saving) return;
    if (!title.trim()) { setError('Escribe el nombre del recordatorio.'); return; }
    if (title.trim().length > 160) { setError('El título no puede superar los 160 caracteres.'); return; }
    if (description.trim().length > 2000) { setError('La descripción no puede superar los 2000 caracteres.'); return; }
    setSaving(true);
    setError('');
    try {
      const dueAt = toIsoDate();
      await remindersService.create(token, { title: title.trim(), description: description.trim(), dueAt, priority });
      router.replace('/');
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : cause instanceof Error ? cause.message : 'No se pudo guardar el recordatorio.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} disabled={saving}><Text style={styles.back}>← Volver</Text></Pressable>
          <Text style={styles.title}>Nuevo recordatorio</Text>
          <Text style={styles.subtitle}>No olvides lo que importa.</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre del recordatorio *</Text>
            <TextInput style={styles.input} placeholder="Ej. Entregar actividad" placeholderTextColor="#9295A5" value={title} onChangeText={setTitle} maxLength={160} editable={!saving} returnKeyType="next" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Añade detalles..." placeholderTextColor="#9295A5" multiline numberOfLines={4} textAlignVertical="top" value={description} onChangeText={setDescription} maxLength={2000} editable={!saving} />
          </View>
          <View style={styles.formGroup}>
            <DateTimeFields date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.priorityContainer}>
              {(['Alta', 'Media', 'Baja'] as ReminderPriority[]).map(option => (
                <Pressable key={option} onPress={() => setPriority(option)} disabled={saving} style={[styles.priorityOption, priority === option && styles.prioritySelected]}>
                  <Text style={styles.priorityText}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <Pressable style={[styles.saveButton, saving && styles.disabled]} onPress={saveReminder} disabled={saving}>
            {saving ? <><ActivityIndicator color="#FFFFFF" /><Text style={styles.saveButtonText}>Guardando...</Text></> : <Text style={styles.saveButtonText}>Guardar recordatorio</Text>}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10121B' },
  safeArea: { flex: 1, padding: 22, width: '100%', maxWidth: 760, alignSelf: 'center' },
  content: { paddingBottom: 32 },
  back: { color: '#C4B5FD', fontSize: 14, fontWeight: '600', marginBottom: 22 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold' },
  subtitle: { color: '#A1A4B5', fontSize: 14, marginTop: 8 },
  formGroup: { marginTop: 24 },
  label: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#25283A', color: '#FFFFFF', padding: 15, borderRadius: 12, fontSize: 14, borderWidth: 1, borderColor: '#383B50' },
  textArea: { height: 110, paddingTop: 15 },
  priorityContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  priorityOption: { flex: 1, backgroundColor: '#25283A', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#383B50' },
  prioritySelected: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  priorityText: { color: '#FFFFFF', fontWeight: '600' },
  error: { color: '#FCA5A5', marginTop: 16 },
  saveButton: { backgroundColor: '#8B5CF6', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, marginTop: 30, marginBottom: 30 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  disabled: { opacity: 0.6 },
});
