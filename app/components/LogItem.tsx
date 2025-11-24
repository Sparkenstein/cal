'use client';

import { deleteLog } from "@/app/actions";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

interface LogItemProps {
  log: {
    id: string;
    occurredAt: Date;
  };
}

export function LogItem({ log }: LogItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this log entry?")) {
      startTransition(async () => {
        await deleteLog(log.id);
      });
    }
  };

  return (
    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg group">
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-900">Recorded</span>
        <span className="text-sm text-gray-500">
          {new Date(log.occurredAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>
      
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete log"
      >
        {isPending ? (
          <div className="h-4 w-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>
    </div>
  );
}

