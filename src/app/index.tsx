
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();

  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);

  // CARGAR RECORDATORIOS
  const loadReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem('reminders');

      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    } catch (error) {
      console.error('Error al cargar recordatorios:', error);
    } finally {
      setLoading(false);
    }
  };

  // CAMBIAR ESTADO DEL RECORDATORIO
  const toggleReminder = async (id: string) => {
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === id
        ? { ...reminder, completed: !reminder.completed }
        : reminder
    );

    setReminders(updatedReminders);

    try {
      await AsyncStorage.setItem(
        'reminders',
        JSON.stringify(updatedReminders)
      );
    } catch (error) {
      console.error('Error al actualizar recordatorio:', error);
    }
  };

  // ELIMINAR RECORDATORIO
  const deleteReminder = async (id: string) => {
    const updatedReminders = reminders.filter(
      (reminder) => reminder.id !== id
    );

    setReminders(updatedReminders);

    try {
      await AsyncStorage.setItem(
        'reminders',
        JSON.stringify(updatedReminders)
      );

      console.log('Recordatorio eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar recordatorio:', error);
    }
  };

  // ABRIR CONFIRMACIÓN DE ELIMINACIÓN
  const confirmDeleteReminder = (id: string) => {
    setSelectedReminderId(id);
    setShowDeleteModal(true);
  };

  // CONFIRMAR ELIMINACIÓN
  const handleConfirmDelete = async () => {
    if (selectedReminderId !== null) {
      await deleteReminder(selectedReminderId);
    }

    setShowDeleteModal(false);
    setSelectedReminderId(null);
  };

  // CANCELAR ELIMINACIÓN
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedReminderId(null);
  };

  // CARGAR DATOS AL ABRIR INICIO
  useEffect(() => {
    loadReminders();
  }, []);

  // CONTADORES
  const pendingReminders = reminders.filter(
    (reminder) => !reminder.completed
  ).length;

  const completedReminders = reminders.filter(
    (reminder) => reminder.completed
  ).length;

  const totalReminders = reminders.length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* ENCABEZADO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>RemindMe</Text>
            <Text style={styles.tagline}>
              No olvides lo que importa
            </Text>
          </View>

          <Text style={styles.notification}>🔔</Text>
        </View>

        {/* BIENVENIDA */}
        <View style={styles.welcome}>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.subtitle}>
            ¿Qué necesitas recordar hoy?
          </Text>
        </View>

        {/* RESUMEN */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>
            Resumen de hoy
          </Text>

          <View style={styles.summaryStats}>
            <View>
              <Text style={styles.pendingNumber}>
                {pendingReminders}
              </Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>

            <View>
              <Text style={styles.completedNumber}>
                {completedReminders}
              </Text>
              <Text style={styles.statLabel}>Completados</Text>
            </View>

            <View>
              <Text style={styles.totalNumber}>
                {totalReminders}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* BOTÓN CREAR */}
        <Pressable
          style={styles.createButton}
          onPress={() => router.push('/create-reminder')}
        >
          <Text style={styles.createButtonText}>
            + Crear recordatorio
          </Text>
        </Pressable>

        {/* LISTA DE RECORDATORIOS */}
        <View style={styles.remindersSection}>
          <Text style={styles.remindersTitle}>
            Mis recordatorios
          </Text>

          {loading ? (
            <Text style={styles.reminderDescription}>
              Cargando recordatorios...
            </Text>
          ) : reminders.length === 0 ? (
            <Text style={styles.reminderDescription}>
              Todavía no tienes recordatorios.
            </Text>
          ) : (
            reminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>

                {/* NOMBRE Y BOTONES */}
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderName}>
                    {reminder.title}
                  </Text>

                  <View style={styles.reminderActions}>
                    <Pressable
                      style={[
                        styles.completeButton,
                        reminder.completed && styles.completedButton,
                      ]}
                      onPress={() => toggleReminder(reminder.id)}
                    >
                      <Text style={styles.completeButtonText}>
                        {reminder.completed ? 'Pendiente' : 'Completado'}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => confirmDeleteReminder(reminder.id)}
                    >
                      <Text style={styles.deleteButtonText}>
                        Eliminar
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* DESCRIPCIÓN */}
                <Text style={styles.reminderDescription}>
                  {reminder.description}
                </Text>

                {/* FECHA Y HORA */}
                <Text style={styles.reminderDate}>
                  {reminder.date} - {reminder.time}
                </Text>

              </View>
            ))
          )}
        </View>

        {/* VENTANA DE CONFIRMACIÓN */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelDelete}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>

              <Text style={styles.modalTitle}>
                Eliminar recordatorio
              </Text>

              <Text style={styles.modalDescription}>
                ¿Estás seguro de que deseas eliminar este recordatorio?
                Esta acción no se puede deshacer.
              </Text>

              <View style={styles.modalActions}>

                <Pressable
                  style={styles.cancelButton}
                  onPress={handleCancelDelete}
                >
                  <Text style={styles.modalButtonText}>
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.confirmButton}
                  onPress={handleConfirmDelete}
                >
                  <Text style={styles.modalButtonText}>
                    Eliminar
                  </Text>
                </Pressable>

              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({

  // CONTENEDOR PRINCIPAL
  container: {
    flex: 1,
    backgroundColor: '#10121B',
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 25,
    width: '100%',
    maxWidth: 990,
    alignSelf: 'center',
  },

  // ENCABEZADO
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold',
  },

  tagline: {
    color: '#9295A5',
    fontSize: 12,
    marginTop: 4,
  },

  notification: {
    fontSize: 23,
  },

  // BIENVENIDA
  welcome: {
    marginTop: 30,
    marginBottom: 20,
  },

  greeting: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#A1A4B5',
    fontSize: 15,
    marginTop: 7,
  },

  // RESUMEN
  summary: {
    backgroundColor: '#25283A',
    padding: 20,
    borderRadius: 15,
    marginTop: 15,
  },

  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  pendingNumber: {
    color: '#A78BFA',
    fontSize: 26,
    fontWeight: 'bold',
  },

  completedNumber: {
    color: '#34D399',
    fontSize: 26,
    fontWeight: 'bold',
  },

  totalNumber: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },

  statLabel: {
    color: '#A1A4B5',
    fontSize: 12,
    marginTop: 5,
  },

  // BOTÓN CREAR
  createButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // LISTA
  remindersSection: {
    marginTop: 25,
    width: '100%',
  },

  remindersTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  // TARJETAS
  reminderCard: {
    backgroundColor: '#25283A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },

  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  reminderName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },

  reminderDescription: {
    color: '#A1A4B5',
    fontSize: 13,
    marginTop: 6,
  },

  reminderDate: {
    color: '#A78BFA',
    fontSize: 12,
    marginTop: 10,
  },

  // BOTONES DE ACCIÓN
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  completeButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  completedButton: {
    backgroundColor: '#059669',
  },

  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // VENTANA DE CONFIRMACIÓN
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    backgroundColor: '#25283A',
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
  },

  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  modalDescription: {
    color: '#A1A4B5',
    fontSize: 14,
    lineHeight: 21,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24,
  },

  cancelButton: {
    backgroundColor: '#41445A',
    padding: 12,
    borderRadius: 8,
  },

  confirmButton: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

});
