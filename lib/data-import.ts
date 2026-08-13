import type { StoredStudySpace } from "@/lib/dars-storage";
import type { DarsHubExport } from "@/lib/export-format";

export type RestoreSummary = { imported: { classes: number; teachers: number; books: number; locations: number }; conflicts: { classes: number; teachers: number; books: number; locations: number } };
export type RestoreStrategy = "merge" | "replace";

function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function isStoredStudySpace(value: unknown): value is StoredStudySpace { return isRecord(value) && Array.isArray(value.classes) && Array.isArray(value.teachers) && Array.isArray(value.books) && Array.isArray(value.locations) && isRecord(value.preferences); }
export function parseDarsHubImport(contents: string): DarsHubExport { const candidate: unknown = JSON.parse(contents); if (!isRecord(candidate) || candidate.format !== "darshub-local-export" || candidate.version !== 1 || !isStoredStudySpace(candidate.data)) throw new Error("invalid-darshub-export"); return candidate as DarsHubExport; }
function conflicts<T extends { id: string }>(current: T[], incoming: T[]) { const ids = new Set(current.map((item) => item.id)); return incoming.filter((item) => ids.has(item.id)).length; }
export function summarizeRestore(current: StoredStudySpace, incoming: StoredStudySpace): RestoreSummary { return { imported: { classes: incoming.classes.length, teachers: incoming.teachers.length, books: incoming.books.length, locations: incoming.locations.length }, conflicts: { classes: conflicts(current.classes, incoming.classes), teachers: conflicts(current.teachers, incoming.teachers), books: conflicts(current.books, incoming.books), locations: conflicts(current.locations, incoming.locations) } }; }
function mergeById<T extends { id: string }>(current: T[], incoming: T[]) { const known = new Set(current.map((item) => item.id)); return [...current, ...incoming.filter((item) => !known.has(item.id))]; }
export function applyRestore(current: StoredStudySpace, incoming: StoredStudySpace, strategy: RestoreStrategy) { const summary = summarizeRestore(current, incoming); if (strategy === "replace") return { summary, space: incoming }; return { summary, space: { classes: mergeById(current.classes, incoming.classes), teachers: mergeById(current.teachers, incoming.teachers), books: mergeById(current.books, incoming.books), locations: mergeById(current.locations, incoming.locations), preferences: incoming.preferences } }; }
