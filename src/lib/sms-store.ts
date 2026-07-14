import { useEffect, useState } from "react";

export type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  year: string;
};

export type AttendanceStatus = "present" | "absent" | "late";
// key: `${date}|${studentId}` -> status
export type AttendanceMap = Record<string, AttendanceStatus>;

export type Grade = {
  id: string; // uuid
  studentId: string;
  subject: string;
  marks: number; // 0-100
};

const K_STUDENTS = "sms.students.v1";
const K_ATTENDANCE = "sms.attendance.v1";
const K_GRADES = "sms.grades.v1";

export const SEED_STUDENTS: Student[] = [
  { id: "S001", name: "Aarav Sharma", email: "aarav@college.edu", course: "Computer Science", year: "2" },
  { id: "S002", name: "Priya Patel", email: "priya@college.edu", course: "Electronics", year: "3" },
  { id: "S003", name: "Rahul Verma", email: "rahul@college.edu", course: "Mechanical", year: "1" },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalStore<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read<T>(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (hydrated) write(key, state);
  }, [key, state, hydrated]);

  return [state, setState, hydrated] as const;
}

export const StoreKeys = { students: K_STUDENTS, attendance: K_ATTENDANCE, grades: K_GRADES };

// CSV helpers
export function toCSV(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          cur += c;
        }
      } else {
        if (c === ",") {
          out.push(cur);
          cur = "";
        } else if (c === '"') {
          inQuotes = true;
        } else {
          cur += c;
        }
      }
    }
    out.push(cur);
    return out;
  };
  const headers = parseLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (vals[i] ?? "").trim()));
    return row;
  });
}

export function downloadFile(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function gradeLetter(pct: number): { letter: string; pass: boolean } {
  if (pct >= 90) return { letter: "A+", pass: true };
  if (pct >= 80) return { letter: "A", pass: true };
  if (pct >= 70) return { letter: "B", pass: true };
  if (pct >= 60) return { letter: "C", pass: true };
  if (pct >= 50) return { letter: "D", pass: true };
  if (pct >= 40) return { letter: "E", pass: true };
  return { letter: "F", pass: false };
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}