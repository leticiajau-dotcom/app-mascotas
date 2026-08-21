import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permisos de notificaciones locales. Debe llamarse una vez al
 * iniciar la app (ver hooks/useNotifications.ts). No usamos push remoto en
 * el MVP, solo notificaciones locales para recordatorios de eventos.
 */
export async function registerForLocalNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Recordatorios de PetCare",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  if (!Device.isDevice) {
    console.warn("[notifications] Los recordatorios locales requieren un dispositivo físico o emulador con soporte.");
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

interface ScheduleReminderParams {
  /** Se usa el id del propio MedicalEvent, así no hace falta guardar un
   * identificador de notificación aparte: programar y cancelar usan la
   * misma clave. */
  identifier: string;
  title: string;
  body: string;
  date: Date;
}

/**
 * Programa (o reprograma) el recordatorio local de un evento médico,
 * usando su `id` como identificador de la notificación.
 */
export async function scheduleEventReminder({
  identifier,
  title,
  body,
  date,
}: ScheduleReminderParams): Promise<string | null> {
  if (date.getTime() <= Date.now()) {
    console.warn("[notifications] La fecha del recordatorio ya pasó, no se programó.");
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      sound: true,
    },
    trigger: { date },
  });
}

/** Cancela el recordatorio de un evento médico por su id, si existiera uno. */
export async function cancelEventReminder(eventId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(eventId);
  } catch (error) {
    console.warn("[notifications] No se pudo cancelar el recordatorio", error);
  }
}
