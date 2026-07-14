import { createFileRoute } from "@tanstack/react-router";
import { StudentManager } from "@/components/StudentManager";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <StudentManager />;
}
