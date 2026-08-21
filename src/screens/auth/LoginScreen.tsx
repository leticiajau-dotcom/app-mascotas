import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PawPrint } from "lucide-react-native";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Colors from "@/constants/Colors";
import { FontSize, Spacing } from "@/constants/Theme";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Completa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    const action = mode === "signIn" ? signIn : signUp;
    const { error: authError } = await action(email.trim(), password);
    setLoading(false);

    if (authError) {
      setError(authError);
    } else if (mode === "signUp") {
      setError("Cuenta creada. Revisa tu correo para confirmar el registro.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <PawPrint size={40} color={Colors.white} />
        </View>

        <Text style={styles.title}>PetCare</Text>
        <Text style={styles.subtitle}>
          {mode === "signIn"
            ? "Inicia sesión para cuidar a tu mascota"
            : "Crea una cuenta para comenzar"}
        </Text>

        <View style={styles.form}>
          <Input
            label="Correo electrónico"
            placeholder="tu@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            label={mode === "signIn" ? "Iniciar sesión" : "Crear cuenta"}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />

          <Button
            label={
              mode === "signIn" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"
            }
            variant="outline"
            onPress={() => {
              setError(null);
              setMode(mode === "signIn" ? "signUp" : "signIn");
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  logo: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    textAlign: "center",
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
});
