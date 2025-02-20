import {
  Link,
  Outlet,
  createFileRoute,
  useParams,
} from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { twJoin } from "tailwind-merge";
import type { DocumentStore } from "~/stores/documents.ts";
import { useRootStore } from "~/stores/root.ts";

export const Route = createFileRoute("/documents")({
  ssr: false,
  component: DocumentsLayout,
});

function DocumentsLayout() {
  return (
    <div className="flex w-full">
      <div className="border-r h-screen w-96 flex flex-col shrink-0">
        <div className="flex flex-col gap-1items-center justify-between px-4 py-2 border-b">
          <h2 className="font-semibold">Documents</h2>
          <div className="opacity-50 text-xs">
            Anybody can see public documents. Logged in users can see private
            documents that they created. Tenant admins can see all documents in
            their tenant.
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DocumentsList />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
}

const DocumentsList = observer(() => {
  const documentsStore = useRootStore().documents;
  const { documentId: currentDocumentId } = useParams({ strict: false });

  return (
    <div className="flex flex-1 flex-col divide-y">
      {Object.values(documentsStore.records).map((document) => (
        <DocumentRow
          key={document.id}
          document={document}
          isActive={document.id === currentDocumentId}
        />
      ))}
    </div>
  );
});

const DocumentRow = observer(
  ({ document, isActive }: { document: DocumentStore; isActive: boolean }) => {
    const content = (
      <>
        <div className="text-sm font-semibold">{document.title}</div>

        <div className="text-gray-400 text-xs flex gap-2">
          <div className="flex gap-1">
            <div>{document.createdBy?.username}</div>
            <div>•</div>
            <div>{document.tenant?.name}</div>
          </div>

          <div className="ml-auto flex gap-1">
            <div>{document.visibility}</div>
          </div>
        </div>
      </>
    );

    const className = "px-4 py-2.5 flex flex-col gap-0.5";

    if (isActive) {
      return (
        <Link className={twJoin(className, "bg-gray-900/30")} to="/documents">
          {content}
        </Link>
      );
    }

    return (
      <Link
        className={twJoin(className, "hover:bg-gray-900/30")}
        to="/documents/$documentId"
        params={{ documentId: document.id }}
      >
        {content}
      </Link>
    );
  }
);
