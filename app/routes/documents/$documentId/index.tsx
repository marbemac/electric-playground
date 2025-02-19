import { createFileRoute, useParams } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { SyncButton } from "~/routes/-components/SyncButton";

import type { CommentStore } from "~/stores/comments.ts";
import type { DocumentStore } from "~/stores/documents.ts";
import { useRootStore } from "~/stores/root.ts";
import { useSyncIfNotPaused } from "~/utils/use-sync-if-not-paused.ts";

export const Route = createFileRoute("/documents/$documentId/")({
  ssr: false,
  component: DocumentRoute,
});

function DocumentRoute() {
  const { documentId } = Route.useParams();

  return <DocumentAndComments documentId={documentId} />;
}

const DocumentAndComments = observer(
  ({ documentId }: { documentId: string }) => {
    const rootStore = useRootStore();
    const { documents } = rootStore;
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Comments</h2>
            <SyncButton syncer={rootStore.comments.syncer} />
          </div>

          <CommentsList document={document} />
        </div>
      </div>
    );
  }
);

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

const CommentsList = observer(({ document }: { document: DocumentStore }) => {
  const comments = document.comments;

  if (comments.length === 0) {
    return <div className="text-sm text-gray-500">No comments yet</div>;
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
});

const Comment = observer(({ comment }: { comment: CommentStore }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">{comment.createdBy?.username}</span>
        <span className="text-sm text-gray-500">
          {new Date(comment.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
    </div>
  );
});
