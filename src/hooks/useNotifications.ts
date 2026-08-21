import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { registerForLocalNotificationsAsync } from "@/services/notificationService";

/**
 * Solicita permisos de notificaciones locales al montar y escucha las
 * notificaciones recibidas/tocadas mientras la app está en primer plano.
 * Úsalo una vez en la raíz de la app (ver App.tsx).
 */
export function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const receivedListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForLocalNotificationsAsync().then(setPermissionGranted);

    receivedListener.current = Notifications.addNotificationReceivedListener(() => {
      // Punto de extensión: podría refrescar el badge o el estado de eventos.
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      // Punto de extensión: navegar al evento correspondiente al tocar la notificación.
    });

    return () => {
      receivedListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { permissionGranted };
}
