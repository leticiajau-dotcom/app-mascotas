# PetCare — MVP de cuidado e historial médico de mascotas

App móvil hecha con **Expo (Managed Workflow) + React Native + TypeScript**
para llevar el historial médico de mascotas, recibir recordatorios de
vacunas/desparasitación, exportar el historial en PDF y tener a mano la
información de emergencia.

## Stack

- Expo SDK 51, React Native 0.74, TypeScript
- `@react-navigation/native` + `bottom-tabs` + `native-stack`
- `expo-notifications` (recordatorios locales)
- `@react-native-async-storage/async-storage` (persistencia offline-first)
- `expo-print` + `expo-sharing` (exportar historial a PDF)
- `expo-image-picker` (foto de la mascota)
- `@supabase/supabase-js` (autenticación; listo para sincronizar en la nube)
- `lucide-react-native` (iconografía)

## Cómo correr el proyecto

```bash
npm install
cp .env.example .env   # completa con tus credenciales de Supabase
npx expo start
```

Las credenciales de Supabase se leen desde `app.json` → `expo.extra`
(`supabaseUrl`, `supabaseAnonKey`). Reemplaza los valores placeholder o
inyéctalos vía `app.config.ts` + variables de entorno en un pipeline de CI/CD.

## Arquitectura

Diseño *feature-first* dentro de `src/`:

```
src/
├── api/            # Cliente de Supabase (auth) y wrapper de AsyncStorage (datos)
├── components/
│   ├── common/     # Button, Card, Input — primitivos de UI reutilizables
│   └── pet/        # Header (selector de mascota), EventCard
├── constants/      # Colors, Theme (spacing, radius, tipografía, sombras)
├── context/        # AuthContext (sesión Supabase), PetContext (mascotas/eventos)
├── hooks/          # usePets, useEvents, useNotifications
├── navigation/     # TabNavigator (4 tabs), AppNavigator (Auth vs Main)
├── screens/
│   ├── auth/       # LoginScreen (login + registro)
│   ├── home/       # DashboardScreen, AddEventModal
│   ├── medical/    # MedicalHistoryScreen (filtros + export PDF)
│   ├── store/      # StoreScreen (placeholder de e-commerce)
│   └── profile/    # ProfileScreen (perfil + tarjeta de emergencia)
├── services/       # notificationService, pdfService
├── types/          # pet.ts, event.ts, navigation.ts
└── utils/          # dateUtils, formatters
```

### Modelo de datos

- **Pet**: nombre, especie (`Dog` | `Cat` | `Other`), raza, fecha de nacimiento, peso, foto, número de chip.
- **MedicalEvent**: vacuna, desparasitación, consulta veterinaria, medicación,
  peluquería, control de peso u otro. Incluye recordatorio opcional que
  programa una notificación local (`expo-notifications`).
- **EmergencyInfo**: contacto del dueño, veterinario y alergias/condiciones —
  pensado para consultarse rápido en una urgencia.

### Persistencia (MVP offline-first)

El MVP guarda mascotas, eventos e información de emergencia en
**AsyncStorage**, particionado por usuario autenticado (`PetContext`). El
cliente de **Supabase** maneja la autenticación (email/password) y ya queda
listo para sincronizar estos mismos datos contra Postgres — ver
`supabase/schema.sql` para el esquema de referencia (tablas `pets`,
`medical_events`, `emergency_info` con RLS por `owner_id`).

### Notificaciones

`useNotifications` solicita permisos al iniciar la app. Al crear/editar un
evento médico con recordatorio activado, `PetContext` programa una
notificación local vía `services/notificationService.ts` y guarda su
`notificationId` para poder cancelarla si el evento se edita o elimina.

### Exportar historial a PDF

`MedicalHistoryScreen` arma un HTML con los datos de la mascota y su
historial completo, lo convierte a PDF con `expo-print` y abre el diálogo
nativo de compartir con `expo-sharing`.

## Próximos pasos sugeridos

1. Sincronizar `PetContext` contra las tablas de Supabase (reemplazando/
   complementando AsyncStorage) para respaldo en la nube y multi-dispositivo.
2. Conectar `StoreScreen` a un catálogo real y flujo de checkout.
3. Selector de fecha nativo (`@react-native-community/datetimepicker`) en
   lugar del input de texto `AAAA-MM-DD` usado en el MVP.
4. Subida de foto de mascota a Supabase Storage usando `expo-image-picker`.
