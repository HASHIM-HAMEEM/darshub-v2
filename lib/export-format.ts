import type { StoredStudySpace } from "@/lib/dars-storage";

export type DarsHubExport = {
  format: "darshub-local-export";
  version: 1;
  exportedAt: string;
  data: StoredStudySpace;
};

export function createDarsHubExport(data: StoredStudySpace, exportedAt = new Date().toISOString()): DarsHubExport { return { format: "darshub-local-export", version: 1, exportedAt, data }; }
export function stringifyDarsHubExport(data: StoredStudySpace, exportedAt?: string) { return JSON.stringify(createDarsHubExport(data, exportedAt), null, 2); }
