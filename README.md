# PetCare — App web de cuidado e historial médico de mascotas

App web hecha con **Vite + React + TypeScript** para llevar el historial
médico de mascotas. Pensada para verse y usarse bien desde el navegador del
celular desde el primer día, con una arquitectura que permite empaquetarla
más adelante como app nativa de Android/iOS (con **Capacitor**) sin tener
que reescribir la lógica de la app.

> Este proyecto reemplaza a la versión anterior (Expo + React Native). Se
> reconstruye por etapas: por ahora están el login y la gestión de
> mascotas: Historial médico y Tienda están con un aviso de "próximamente"
> mientras se reconstruyen sobre esta base.

## Stack

- **Vite + React 18 + TypeScript**
- **React Router** (navegación)
- **Tailwind CSS** (estilos, diseño mobile-first)
- **Supabase**: autenticación (email/password) **y** persistencia real en
  Postgres de mascotas/eventos/estudios (antes vivían solo en el celular,
  ahora están en la nube desde el día uno — se puede entrar desde cualquier
  navegador o dispositivo y ver la misma información)
- **lucide-react** (iconografía)

## Cómo correr el proyecto

```bash
npm install
cp .env.example .env   # completá con tus credenciales de Supabase
npm run dev
```

Abrí la URL que te muestra la terminal (por defecto `http://localhost:5173`).

Las credenciales de Supabase se leen de variables de entorno con prefijo
`VITE_` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), tal como quedan en
tu `.env`. Las encontrás en el dashboard de Supabase → tu proyecto →
**Project Settings → API**.

### Antes de usarla por primera vez: crear las tablas en Supabase

Esta app guarda los datos en Postgres, no en el celular. Hace falta correr
el esquema **una vez** en tu proyecto de Supabase:

1. Entrá a tu proyecto en [supabase.com](https://supabase.com) → **SQL
   Editor**.
2. Pegá el contenido de `supabase/schema.sql` y ejecutalo.

Ese script es seguro de volver a correr más adelante si agregamos columnas
nuevas (usa `create table if not exists` / `add column if not exists`).

### Probar en el celular (mismo Wi-Fi)

```bash
npm run dev
```

La terminal muestra dos direcciones: `Local` (solo tu compu) y `Network`
(algo como `http://192.168.x.x:5173`). Abrí esa segunda dirección desde el
navegador del celular (Chrome/Safari), estando conectado a la misma red
Wi-Fi que la compu. No hace falta ninguna app (ni Expo Go): es una página
web común.

## Arquitectura

Diseño *feature-first* dentro de `src/`, separando a propósito la lógica de
la UI:

```
src/
├── lib/            # Lógica independiente de React: cliente de Supabase,
│   ├── api/         #   funciones de acceso a datos (pets.ts, ...),
│   └── ...          #   formatters, fechas. Reutilizable tal cual si el
│                     #   día de mañana se arma una app nativa.
├── context/        # AuthContext (sesión Supabase), PetContext (mascotas)
├── components/
│   ├── ui/         # Button, Card, Input — primitivos reutilizables
│   ├── layout/     # AppShell (barra de tabs), ProtectedRoute
│   └── pet/        # PetFormModal (alta/edición de mascota)
├── pages/          # LoginPage, DashboardPage, ProfilePage, ComingSoonPage
├── types/          # pet.ts (más los que se sumen con cada etapa)
└── App.tsx         # Rutas (react-router-dom)
```

**Por qué esta separación**: `src/lib` no importa nada de React ni sabe que
existe una pantalla — solo sabe "cómo se guarda/lee una mascota en
Supabase". Si en el futuro se arma una app nativa (React Native, o la app
web empaquetada con Capacitor), esa capa se reutiliza sin cambios; lo único
que cambiaría son los componentes visuales.

### Camino a Android/iOS: Capacitor

Cuando esta app web esté estable, el paso siguiente para tener una app
instalable en Android/iOS **sin reescribirla** es
[Capacitor](https://capacitorjs.com/): toma el build web (`npm run build`)
y lo empaqueta en un proyecto nativo, dando acceso además a APIs nativas
(cámara, notificaciones push, etc. vía plugins de Capacitor). No es
necesario configurar nada de esto todavía — se hace cuando la app web esté
lista.

### Modelo de datos

- **Pet** (`public.pets`): nombre, especie (`Dog` | `Cat` | `Other`, con
  `custom_species` para cuando es "Other" — ej. "Conejo"), raza, fecha de
  nacimiento, peso, foto, número de chip y `active` — mascotas "dadas de
  baja" conservan su historial pero quedan fuera de los selectores.
- **MedicalEvent** (`public.medical_events`): categoría (`Vacuna` |
  `Desparasitante` | `Medicamento` | `Turno Médico`), título, fecha, hora
  opcional y `repeat_interval_days` para tareas recurrentes (desparasitación,
  pipeta antipulgas) que no requieren visita al veterinario. *(Todavía no
  hay pantalla para esto — llega con el Historial médico.)*
- **EmergencyInfo** / **StudyFile**: definidos en el esquema, pendientes de
  reconstruir la pantalla que los use.

Ver `supabase/schema.sql` para el esquema completo, incluyendo las políticas
de RLS (cada usuario solo ve/edita sus propias mascotas y eventos).

## Próximos pasos (reconstrucción por etapas)

1. ~~Base del proyecto (Vite + Supabase Postgres) + login + gestión de
   mascotas~~ ✅
2. Historial médico: vacunas, visitas médicas (con recordatorios y eventos
   recurrentes) y galería de estudios.
3. Selector de fecha nativo del navegador (`<input type="date">` — ya en
   uso) y validaciones más finas.
4. Subida de fotos (mascota y estudios) a Supabase Storage.
5. Tienda: catálogo real y flujo de checkout.
6. Empaquetado con Capacitor para Android/iOS.
