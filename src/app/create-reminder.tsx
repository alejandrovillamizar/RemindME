import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ApiError } from '@/services/api';
import { remindersService, type ReminderPriority } from '@/services/reminders.service';
import { useAuth } from '@/contexts/auth-context';

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
    if (!date.trim() && !time.trim()) return null;
    if (!date.trim() || !time.trim()) throw new Error('Completa tanto la fecha como la hora, o deja ambos campos vacíos.');
    const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date.trim());
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(time.trim());
    if (!dateMatch || !timeMatch) throw new Error('Usa el formato DD/MM/AAAA para la fecha y HH:MM para la hora.');
    const [, day, month, year] = dateMatch;
    const [, hour, minute] = timeMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    if (parsed.getFullYear() !== Number(year) || parsed.getMonth() !== Number(month) - 1 || parsed.getDate() !== Number(day) || parsed.getHours() !== Number(hour) || parsed.getMinutes() !== Number(minute)) {
      throw new Error('La fecha o la hora no son válidas.');
    }
    return parsed.toISOString();
  };

  const saveReminder = async () => {
    if (!token) return;
    if (!title.trim()) { setError('Escribe el nombre del recordatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      await remindersService.create(token, {
        title: title.trim(),
        description: description.trim(),
        dueAt: toIsoDate(),
        priority,
      });
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
        <ScrollView keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()}><Text style={styles.back}>← Volver</Text></Pressable>
          <Text style={styles.title}>Nuevo recordatorio</Text>
          <Text style={styles.subtitle}>No olvides lo que importa.</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre del recordatorio *</Text>
            <TextInput style={styles.input} placeholder="Ej. Entregar actividad" placeholderTextColor="#9295A5" value={title} onChangeText={setTitle} maxLength={160} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Añade detalles..." placeholderTextColor="#9295A5" multiline numberOfLines={4} textAlignVertical="top" value={description} onChangeText={setDescription} maxLength={2000} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Fecha (DD/MM/AAAA)</Text>
            <TextInput style={styles.input} placeholder="10/11/2026" placeholderTextColor="#9295A5" keyboardType="numeric" value={date} onChangeText={setDate} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Hora (HH:MM)</Text>
            <TextInput style={styles.input} placeholder="14:30" placeholderTextColor="#9295A5" keyboardType="numeric" value={time} onChangeText={setTime} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.priorityContainer}>
              {(['Alta', 'Media', 'Baja'] as ReminderPriority[]).map(option => (
                <Pressable key={option} onPress={() => setPriority(option)} style={[styles.priorityOption, priority === option && styles.prioritySelected]}>
                  <Text style={styles.priorityText}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={saveReminder} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Guardar recordatorio</Text>}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10121B' },
  safeArea: { flex: 1, padding: 22, width: '100%', maxWidth: 760, alignSelf: 'center' },
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
  saveButton: { backgroundColor: '#8B5CF6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 30 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
