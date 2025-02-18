import { createFileRoute, useParams } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

import type { DocumentStore } from "~/stores/documents.ts";
import { useRootStore } from "~/stores/root.ts";

export const Route = createFileRoute("/documents/$documentId/")({
  component: DocumentRoute,
});

function DocumentRoute() {
  const { documentId } = useParams({ from: "/documents/$documentId/" });
  const { documents } = useRootStore();
  const document = documents.records[documentId];

  if (!document) {
    return (
      <div className="h-full flex-1 flex items-center justify-center uppercase text-gray-600 font-semibold text-sm">
        Document {documentId} not found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto divide-y">
      <div className="px-4 py-10">
        <Document document={document} />
      </div>

      <div className="px-4 py-10">
        <h2 className="text-lg font-semibold">Comments</h2>
        {/* Comments section will be implemented later */}
      </div>
    </div>
  );
}

const Document = observer(({ document }: { document: DocumentStore }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{document.title}</h1>
        <div className="mt-2 text-sm text-gray-500">
          Created by {document.createdBy?.username} • {document.status} •{" "}
          {document.visibility}
        </div>
      </div>

      <div className="prose">
        <div className="whitespace-pre-wrap">{document.content}</div>
      </div>
    </div>
  );
});
