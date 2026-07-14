import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Student Management System" },
      { name: "description", content: "Overview of students, attendance, and grades." },
    ],
  }),
  component: Dashboard,
});
