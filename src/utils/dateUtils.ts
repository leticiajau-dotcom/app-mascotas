const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Recorta un ISO string a su parte "AAAA-MM-DD", para precargar un input de fecha. */
export function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

/** Parsea un input de fecha en formato "AAAA-MM-DD"; null si no es válido. */
export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return "Sin fecha";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}`;
}

export function formatDateShort(isoDate: string | undefined): string {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

export function calculateAge(birthDateIso: string | undefined): string {
  if (!birthDateIso) return "Edad desconocida";
  const birth = new Date(birthDateIso);
  if (Number.isNaN(birth.getTime())) return "Edad desconocida";

  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) {
    return `${Math.max(months, 0)} ${months === 1 ? "mes" : "meses"}`;
  }
  if (months === 0) return `${years} ${years === 1 ? "año" : "años"}`;
  return `${years} ${years === 1 ? "año" : "años"} y ${months} ${
    months === 1 ? "mes" : "meses"
  }`;
}

/**
 * Combina la fecha (día) de un evento con su hora opcional ("HH:MM") para
 * obtener el instante exacto en el que debe dispararse su recordatorio.
 * Sin hora especificada, usa las 9:00 AM como valor por defecto.
 */
export function combineDateAndTime(dateIso: string, time?: string): Date {
  const base = new Date(dateIso);
  const match = time ? /^(\d{1,2}):(\d{2})$/.exec(time.trim()) : null;

  if (match) {
    base.setHours(Number(match[1]), Number(match[2]), 0, 0);
  } else {
    base.setHours(9, 0, 0, 0);
  }

  return base;
}

export function isUpcoming(isoDate: string, withinDays = 30): boolean {
  const target = new Date(isoDate).getTime();
  const now = Date.now();
  const diff = target - now;
  return diff >= 0 && diff <= withinDays * 24 * 60 * 60 * 1000;
}

/**
 * True si `isoDate` es de un día calendario anterior a hoy. Se compara por
 * día, no por instante exacto: un evento "de hoy" sin hora específica (que
 * internamente se guarda a medianoche) no debe verse "Vencido" apenas pasa
 * la medianoche — recién al otro día.
 */
export function isOverdue(isoDate: string): boolean {
  const target = new Date(isoDate);
  const now = new Date();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return targetDay.getTime() < today.getTime();
}

/** True si `isoDate` cae en el mismo día calendario que hoy (hora local). */
export function isToday(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function sortByDateAsc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
