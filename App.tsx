import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import AppNavigator from "@/navigation/AppNavigator";
import { useNotifications } from "@/hooks/useNotifications";

function AppContent() {
  // Solicita permisos de notificaciones locales al iniciar la app.
  useNotifications();
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
