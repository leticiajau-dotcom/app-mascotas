/** Formatea una fecha ISO como "15 de septiembre de 2026". */
export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "Sin registrar";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sin registrar";
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

/** Calcula una edad legible ("2 años", "5 meses") a partir de una fecha de nacimiento. */
export function calculateAge(birthDate: string | undefined | null): string {
  if (!birthDate) return "Edad desconocida";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "Edad desconocida";

  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0 && months <= 0) return "Recién nacido";
  if (years <= 0) return months === 1 ? "1 mes" : `${months} meses`;
  if (months === 0) return years === 1 ? "1 año" : `${years} años`;
  return `${years} ${years === 1 ? "año" : "años"} y ${months} ${months === 1 ? "mes" : "meses"}`;
}

/** Convierte una fecha ISO a un valor apto para <input type="date"> (AAAA-MM-DD). */
export function toDateInputValue(iso: string | undefined | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
