import { createFileRoute } from "@tanstack/react-router";
import { StudentManager } from "@/components/StudentManager";

export const Route = createFileRoute("/students")({
  head: () => ({
    meta: [
      { title: "Students — SMS" },
      { name: "description", content: "Add, edit, search and manage student records." },
    ],
  }),
  component: StudentManager,
});