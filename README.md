# PetCare — MVP de cuidado e historial médico de mascotas

App móvil hecha con **Expo (Managed Workflow) + React Native + TypeScript**
para llevar el historial médico de mascotas, recibir recordatorios de
vacunas/desparasitación, exportar el historial en PDF y tener a mano la
información de emergencia.

## Stack

- Expo SDK 54, React Native 0.81, React 19, TypeScript
- `@react-navigation/native` + `bottom-tabs` + `native-stack`
- `expo-notifications` (recordatorios locales)
- `@react-native-async-storage/async-storage` (persistencia offline-first)
- `expo-print` + `expo-sharing` (exportar historial a PDF, enviar por
  WhatsApp/Mail vía el diálogo nativo de compartir)
- `expo-image-picker` + `expo-document-picker` (foto de la mascota y
  Galería de Estudios: fotos o documentos/PDF importados)
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
│   └── pet/        # Header (ficha compacta), EventCard, PetFormModal
│   │               #   (alta/edición de mascota, compartido)
├── constants/      # Colors (paleta azul/slate), Theme (spacing, radius, tipografía)
├── context/        # AuthContext (sesión Supabase), PetContext (mascotas/eventos/estudios)
├── hooks/          # usePets, useEvents, useNotifications
├── navigation/     # TabNavigator (4 tabs), AppNavigator (Auth vs Main)
├── screens/
│   ├── auth/       # LoginScreen (login + registro)
│   ├── home/       # DashboardScreen (saludo, hero card, agenda del día,
│   │               #   botón "Mis mascotas" + FAB), AddEventModal
│   ├── medical/    # MedicalHistoryScreen (Vacunas / Visitas Médicas / Galería de Estudios)
│   ├── store/      # StoreScreen (catálogo placeholder + recomendados con affiliateUrl)
│   └── profile/    # ProfileScreen (ficha técnica + emergencia + llamada rápida)
├── services/       # notificationService, pdfService, mediaService
├── types/          # pet.ts, event.ts, navigation.ts
└── utils/          # dateUtils, formatters
```

### Paleta

Azul/slate: `#0284C7` (primario), `#0F172A` (texto), `#F8FAFC` (fondo). Ver
`src/constants/Colors.ts`.

### Modelo de datos

- **Pet**: nombre, especie (`Dog` | `Cat` | `Other`, con `customSpecies` para
  cuando es "Other" — ej. "Conejo" — que se muestra en toda la app en vez de
  "Otro"), raza, fecha de nacimiento, peso, foto, número de chip (microchip)
  y `active` — mascotas "dadas de baja" conservan todo su historial pero
  quedan fuera del selector
  y de la creación de nuevos eventos.
- **MedicalEvent**: categoría (`Vacuna` | `Desparasitante` | `Medicamento` |
  `Turno Médico`), título, fecha y hora opcional. Todo evento no completado
  programa automáticamente una notificación local (`expo-notifications`).
  Incluye un `affiliateUrl` opcional, preparado para futura monetización
  (link de compra del insumo asociado al evento).
- **EmergencyInfo**: contacto del dueño, veterinario de cabecera y clínica de
  urgencia 24h (nombre + teléfono de cada uno, para llamada rápida) y
  alergias/condiciones.
- **StudyFile**: foto de un estudio (radiografía, análisis) o un documento
  importado (PDF de resultados de laboratorio, historia clínica que envía
  el veterinario, etc.) asociado a una mascota, para la Galería de Estudios.

### Persistencia (MVP offline-first)

El MVP guarda mascotas, eventos, estudios e información de emergencia en
**AsyncStorage**, particionado por usuario autenticado (`PetContext`). El
cliente de **Supabase** maneja la autenticación (email/password) y ya queda
listo para sincronizar estos mismos datos contra Postgres — ver
`supabase/schema.sql` para el esquema de referencia (tablas `pets`,
`medical_events`, `emergency_info`, `pet_studies`, todas con RLS por
`owner_id`).

### Notificaciones (`src/services/notificationService.ts`)

- `registerForPushNotificationsAsync()`: solicita permisos e inicializa el
  canal de notificaciones en Android. Se llama una vez al iniciar la app
  (`useNotifications`, montado en `App.tsx`), que también registra el
  listener global de notificaciones recibidas/tocadas.
- `schedulePetReminder(title, body, triggerDate, dataPayload, identifier?)`:
  programa la notificación local. `PetContext` la invoca automáticamente al
  crear, editar, completar o eliminar un evento médico, usando el propio
  `id` del evento como identificador — así no hace falta guardar un
  `notificationId` aparte. Solo los eventos no completados quedan con
  recordatorio activo. El formulario (`AddEventModal`) deja elegir la
  antelación de aviso ("Mismo día" / "3 días antes").

### Exportar historial a PDF (`src/services/pdfService.ts`)

`exportMedicalHistoryPDF(pet, events)` arma un HTML estilizado con los datos
de la mascota y su historial completo, lo convierte a PDF con `expo-print` y
abre el diálogo nativo de compartir (`expo-sharing`) para enviarlo por
WhatsApp, Mail o cualquier otra app instalada.

## Próximos pasos sugeridos

1. Sincronizar `PetContext` contra las tablas de Supabase (reemplazando/
   complementando AsyncStorage) para respaldo en la nube y multi-dispositivo,
   incluyendo subir las fotos de `StudyPhoto`/`Pet.photoUrl` a Supabase Storage.
2. Conectar `StoreScreen` a un catálogo real y flujo de checkout.
3. Selector de fecha nativo (`@react-native-community/datetimepicker`) en
   lugar del input de texto `AAAA-MM-DD` usado en el MVP.

## Preview en el navegador (opcional)

El proyecto también corre en modo web (útil para previsualizar sin un
teléfono a mano), gracias a `react-native-web`, `react-dom` y
`@expo/metro-runtime`:

```bash
npx expo start --web
```

Esto es un plus para desarrollo rápido — el target principal sigue siendo
iOS/Android vía Expo Go o un build nativo.
