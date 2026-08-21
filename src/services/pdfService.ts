import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Pet } from "@/types/pet";
import { EVENT_TYPE_LABELS, MedicalEvent } from "@/types/event";
import { calculateAge, formatDate } from "@/utils/dateUtils";
import { SPECIES_LABELS, formatWeight } from "@/utils/formatters";

function buildHtml(pet: Pet, events: MedicalEvent[]): string {
  const rows = events
    .map(
      (event) => `
        <tr>
          <td>${formatDate(event.date)}</td>
          <td>${EVENT_TYPE_LABELS[event.type]}</td>
          <td>${event.title}</td>
          <td>${event.notes ?? "-"}</td>
          <td>${event.completed ? "Completado" : "Pendiente"}</td>
        </tr>`
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1F2937; padding: 24px; }
          h1 { color: #FF7A59; margin-bottom: 4px; }
          .subtitle { color: #6B7280; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #E5E7EB; padding: 8px 12px; text-align: left; font-size: 12px; }
          th { background-color: #FFF1EC; color: #E85D3D; }
          .info-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
          .info-item { min-width: 160px; }
          .info-label { font-size: 11px; color: #6B7280; text-transform: uppercase; }
          .info-value { font-size: 14px; font-weight: 600; }
        </style>
      </head>
      <body>
        <h1>Historial médico de ${pet.name}</h1>
        <p class="subtitle">Generado el ${formatDate(new Date().toISOString())}</p>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Especie</div>
            <div class="info-value">${SPECIES_LABELS[pet.species]}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Raza</div>
            <div class="info-value">${pet.breed ?? "-"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Edad</div>
            <div class="info-value">${calculateAge(pet.birthDate)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Peso</div>
            <div class="info-value">${formatWeight(pet.weight)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Título</th>
              <th>Notas</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5">Sin eventos registrados.</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

/**
 * Genera un PDF con el historial médico completo de una mascota y abre el
 * diálogo nativo para compartirlo/guardarlo.
 */
export async function exportMedicalHistoryToPdf(
  pet: Pet,
  events: MedicalEvent[]
): Promise<void> {
  const html = buildHtml(pet, events);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Historial médico de ${pet.name}`,
      UTI: "com.adobe.pdf",
    });
  } else {
    console.warn("[pdf] Compartir no está disponible en este dispositivo. Archivo en:", uri);
  }
}
