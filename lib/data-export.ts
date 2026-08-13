import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import type { StoredStudySpace } from "@/lib/dars-storage";
import { stringifyDarsHubExport } from "@/lib/export-format";

export type ExportResult = { kind: "shared" | "saved" | "downloaded"; uri?: string };

export async function exportStudySpace(space: StoredStudySpace): Promise<ExportResult> {
  const contents = stringifyDarsHubExport(space); const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); const name = `darshub-export-${timestamp}.json`;
  if (Platform.OS === "web") { const blob = new Blob([contents], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0); return { kind: "downloaded" }; }
  const file = new File(Paths.cache, name); file.write(contents); if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(file.uri, { mimeType: "application/json", dialogTitle: "Export DarsHub data", UTI: "public.json" }); return { kind: "shared", uri: file.uri }; }
  return { kind: "saved", uri: file.uri };
}
