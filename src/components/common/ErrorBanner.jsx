import { AlertTriangle } from 'lucide-react';

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <span className="text-red-300 text-sm">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors shrink-0 ml-4"
        >
          Retry
        </button>
      )}
    </div>
  );
}
