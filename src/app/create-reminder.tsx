import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default  function CreateReminderScreen() {
 const saveReminder = async () => {
  const reminder = {
    id: Date.now().toString(),
    title,
    description,
    date,
    time,
    priority,
    completed: false,
  };

  try {
    const storedReminders = await AsyncStorage.getItem('reminders');

    const reminders = storedReminders
      ? JSON.parse(storedReminders)
      : [];

    reminders.push(reminder);

    await AsyncStorage.setItem(
      'reminders',
      JSON.stringify(reminders)
    );

    console.log('Recordatorio guardado correctamente');

  } catch (error) {
    console.error('Error al guardar:', error);
  }
};
  const router = useRouter();
  const[priority, setPriority] = useState('Media');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        <Text style={styles.title}>
          Nuevo recordatorio
        </Text>

        <Text style={styles.subtitle}>
          No olvides lo que importa.
        </Text>
        <View style={styles.formGroup}>
  <Text style={styles.label}>
    Nombre del recordatorio
  </Text>

  <TextInput
    style={styles.input}
    placeholder="Ej. nombre del recordatorio"
    placeholderTextColor="#9295A5"
    value={title}
    onChangeText={setTitle}
  />
</View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Descripción
          </Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Añade detalles sobre tu recordatorio..."
            placeholderTextColor="#9295A5"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}

          />
        </View>
                {/* FECHA DEL RECORDATORIO */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Fecha del recordatorio
          </Text>

          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#9295A5"
            keyboardType="numeric"
            value={date}
            onChangeText={setDate}
          />
        </View>
        {/* HORA DEL RECORDATORIO */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Hora del recordatorio
          </Text>

          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            placeholderTextColor="#9295A5"
            keyboardType="numeric"
            value={time}
            onChangeText={setTime}
          />
        </View>
       {/* PRIORIDAD DEL RECORDATORIO */}
<View style={styles.formGroup}>
  <Text style={styles.label}>
    Prioridad
  </Text>

  <View style={styles.priorityContainer}>
    {['Alta', 'Media', 'Baja'].map((option) => (
      <Text
        key={option}
        style={[
          styles.priorityOption,
          priority === option && styles.prioritySelected,
        ]}
        onPress={() => setPriority(option)}
      >
        {option}
      </Text>
    ))}
  </View>
</View>
{/* BOTÓN GUARDAR */}
<Pressable
  style={styles.saveButton}
  onPress={saveReminder}
>
  <Text style={styles.saveButtonText}>
    Guardar recordatorio
  </Text>
</Pressable>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10121B',
  },

  safeArea: {
    flex: 1,
    padding: 22,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#A1A4B5',
    fontSize: 14,
    marginTop: 8,
  },
    // CAMPOS DEL FORMULARIO
  formGroup: {
    marginTop: 30,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#25283A',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#383B50',
  },
    textArea: {
    height: 110,
    paddingTop: 15,
  },
    // PRIORIDAD
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  priorityOption: {
    flex: 1,
    backgroundColor: '#25283A',
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 14,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#383B50',
  },prioritySelected: {
  backgroundColor: '#8B5CF6',
  borderColor: '#8B5CF6',
},
// BOTÓN GUARDAR
saveButton: {
  backgroundColor: '#8B5CF6',
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 30,
},

saveButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
},
});