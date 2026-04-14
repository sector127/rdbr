import { ModalOverlay } from "../ModalOverlay";

interface Props {
  courseTitle: string;
  onClose: () => void;
}

export function CourseSuccessModal({ courseTitle, onClose }: Props) {
  return (
    <ModalOverlay onClose={onClose} className="max-w-sm text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Congratulations!</h2>
      <p className="text-sm text-zinc-500 mb-6">
        You&apos;ve completed <strong className="text-zinc-900 dark:text-white">{courseTitle}</strong>!
      </p>
      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
      >
        Awesome!
      </button>
    </ModalOverlay>
  );
}
