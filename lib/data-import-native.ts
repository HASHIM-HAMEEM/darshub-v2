import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { parseDarsHubImport } from "@/lib/data-import";

export async function pickDarsHubImport() {
  const result = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true, multiple: false });
  if (result.canceled || !result.assets[0]) return null;
  const file = new File(result.assets[0].uri);
  return parseDarsHubImport(await file.text());
}
