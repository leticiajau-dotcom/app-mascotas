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
  title: string;
  body: string;
  date: Date;
}

/**
 * Programa una notificación local para un evento médico. Devuelve el
 * identificador para poder cancelarla/reprogramarla más adelante.
 */
export async function scheduleEventReminder({
  title,
  body,
  date,
}: ScheduleReminderParams): Promise<string | null> {
  if (date.getTime() <= Date.now()) {
    console.warn("[notifications] La fecha del recordatorio ya pasó, no se programó.");
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: { date },
  });

  return identifier;
}

export async function cancelEventReminder(notificationId: string | null | undefined): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn("[notifications] No se pudo cancelar el recordatorio", error);
  }
}
