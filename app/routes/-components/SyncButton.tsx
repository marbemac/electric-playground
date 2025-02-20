import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react-lite";
import { twJoin } from "tailwind-merge";

export const SyncButton = observer(
  ({
    syncer,
    iconOnly,
    label,
    fullWidth,
  }: {
    syncer: {
      isSyncing: boolean;
      isPaused: boolean;
      error: Error | null;
      togglePause: () => void;
    };
    iconOnly?: boolean;
    label?: string;
    fullWidth?: boolean;
  }) => {
    return (
      <div className={twJoin("flex items-center gap-3", fullWidth && "w-full")}>
        <div
          title={syncer.isSyncing ? "Syncing" : "Not syncing"}
          className="cursor-pointer flex items-center justify-between gap-2 text-xs flex-1 py-1"
          onClick={() => syncer.togglePause()}
        >
          {label && <div className="opacity-80">{label}</div>}

          <div className="flex items-center gap-2">
            {!iconOnly && (
              <div className="opacity-80">
                {syncer.isSyncing ? "syncing" : "not syncing"}
              </div>
            )}

            <div
              className={`h-1.5 w-1.5 rounded-full ${
                syncer.isSyncing ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {syncer.error && (
          <div className="text-red-500 text-xs" title={syncer.error.message}>
            <FontAwesomeIcon icon={faExclamationCircle} />
          </div>
        )}
      </div>
    );
  }
);
