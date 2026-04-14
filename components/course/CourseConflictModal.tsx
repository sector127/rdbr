import { ModalOverlay } from "../ModalOverlay";
import { WarningIcon } from "../icons";
import { ConflictError } from "@/types/conflictError";

interface Props {
  conflictData: ConflictError;
  onCancel: () => void;
  onContinue: () => void;
}

export function CourseConflictModal({ conflictData, onCancel, onContinue }: Props) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
          <WarningIcon />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Schedule Conflict</h2>
      </div>
      {conflictData.conflicts.map((c, i) => (
        <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          You are already enrolled in{" "}
          <strong className="text-zinc-900 dark:text-white">{c.conflictingCourseName}</strong>{" "}
          with the same schedule: <strong>{c.schedule}</strong>.
        </p>
      ))}
      <p className="text-sm text-zinc-500 mb-6">Are you sure you want to continue?</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
        >
          Continue Anyway
        </button>
      </div>
    </ModalOverlay>
  );
}
