import { createFileRoute } from "@tanstack/react-router";
import { Grades } from "@/components/Grades";

export const Route = createFileRoute("/grades")({
  head: () => ({
    meta: [
      { title: "Grades — SMS" },
      { name: "description", content: "Record subject marks and compute averages." },
    ],
  }),
  component: Grades,
});