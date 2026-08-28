import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Permite abrir la app desde el celular en la misma red Wi-Fi usando
    // la IP de la compu (ver README: "Probar en el celular").
    host: true,
    port: 5173,
  },
});
