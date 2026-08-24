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
 * Solicita permisos de notificaciones e inicializa el canal de Android.
 * Debe llamarse una vez al iniciar la app (ver hooks/useNotifications.ts).
 * El MVP solo usa notificaciones locales (no hay push remoto/servidor).
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Recordatorios de PetCare",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  if (!Device.isDevice) {
    console.warn(
      "[notifications] Los recordatorios locales requieren un dispositivo físico o emulador con soporte."
    );
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * Programa una notificación local en el dispositivo.
 *
 * @param title Título de la notificación.
 * @param body Cuerpo/mensaje de la notificación.
 * @param triggerDate Momento exacto en el que debe dispararse.
 * @param dataPayload Datos arbitrarios adjuntos (ej. `{ eventId, petId }`)
 *   para poder reaccionar al tocar la notificación.
 * @param identifier Identificador explícito de la notificación. Al pasar
 *   el mismo `id` de la entidad que la origina (ej. un MedicalEvent), se
 *   puede reprogramar/cancelar sin tener que persistir un id aparte.
 */
export async function schedulePetReminder(
  title: string,
  body: string,
  triggerDate: Date,
  dataPayload?: Record<string, unknown>,
  identifier?: string
): Promise<string | null> {
  if (triggerDate.getTime() <= Date.now()) {
    console.warn("[notifications] La fecha del recordatorio ya pasó, no se programó.");
    return null;
  }

  try {
    return await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        data: dataPayload ?? {},
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
  } catch (error) {
    // Ej. web (no soporta notificaciones nativas) o permiso denegado: no debe
    // impedir guardar el evento, solo el recordatorio queda sin programar.
    console.warn("[notifications] No se pudo programar el recordatorio", error);
    return null;
  }
}

/** Cancela una notificación previamente programada, dado su identificador. */
export async function cancelPetReminder(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.warn("[notifications] No se pudo cancelar el recordatorio", error);
  }
}
