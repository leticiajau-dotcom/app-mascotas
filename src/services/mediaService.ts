import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";

export interface PickedFile {
  uri: string;
  fileName: string;
  mimeType?: string;
}

export type PickResult =
  | { status: "success"; file: PickedFile }
  | { status: "denied" }
  | { status: "canceled" };

/**
 * Abre la galería de fotos del dispositivo y devuelve la imagen elegida.
 * Se usa tanto para la foto de perfil de una mascota como para agregar
 * fotos a la Galería de Estudios.
 */
export async function pickImageFromLibrary(): Promise<PickResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: "denied" };

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.[0]) return { status: "canceled" };

  const asset = result.assets[0];
  return {
    status: "success",
    file: {
      uri: asset.uri,
      fileName: asset.fileName ?? `foto-${Date.now()}.jpg`,
      mimeType: asset.mimeType,
    },
  };
}

/**
 * Abre el selector de documentos del sistema (PDF, imágenes, etc.). Se usa
 * para importar resultados de laboratorio o la historia clínica que envía
 * el veterinario, no solo fotos sacadas con la cámara.
 */
export async function pickDocument(): Promise<PickResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/pdf", "image/*"],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return { status: "canceled" };

  const asset = result.assets[0];
  return {
    status: "success",
    file: {
      uri: asset.uri,
      fileName: asset.name,
      mimeType: asset.mimeType,
    },
  };
}

/** Abre el diálogo nativo para ver/compartir un archivo ya importado. */
export async function openOrShareFile(uri: string, mimeType?: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, mimeType ? { mimeType } : undefined);
  } else {
    console.warn("[media] Compartir no está disponible en este dispositivo. Archivo en:", uri);
  }
}
