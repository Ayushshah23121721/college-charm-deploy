import { createFileRoute } from "@tanstack/react-router";
import { Attendance } from "@/components/Attendance";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — SMS" },
      { name: "description", content: "Mark daily attendance and review history." },
    ],
  }),
  component: Attendance,
});