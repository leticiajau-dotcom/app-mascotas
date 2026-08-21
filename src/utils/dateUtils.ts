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

export function isUpcoming(isoDate: string, withinDays = 30): boolean {
  const target = new Date(isoDate).getTime();
  const now = Date.now();
  const diff = target - now;
  return diff >= 0 && diff <= withinDays * 24 * 60 * 60 * 1000;
}

export function isOverdue(isoDate: string): boolean {
  return new Date(isoDate).getTime() < Date.now();
}

export function sortByDateAsc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
