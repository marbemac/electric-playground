import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/documents/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex-1 flex items-center justify-center uppercase text-gray-600 font-semibold text-sm h-full">
      Select a document
    </div>
  );
}
