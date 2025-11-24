'use client';

import { logActivity } from '@/app/actions';
import { Plus, Check, Activity as ActivityIcon } from 'lucide-react';
import { useTransition } from 'react';
import { clsx } from 'clsx';

import Link from 'next/link';

interface ActivityCardProps {
  activity: {
    id: string;
    name: string;
    color: string;
    todayCount: number;
    monthCount: number;
  };
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleLog = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking log
    startTransition(async () => {
      await logActivity(activity.id);
    });
  };

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all hover:shadow-md block"
      style={{ borderTop: `4px solid ${activity.color}` }}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg text-gray-900">{activity.name}</h3>
        <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          This Month: {activity.monthCount}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Today: <span className="font-bold text-gray-900">{activity.todayCount}</span>
        </div>
        
        <button
          onClick={handleLog}
          disabled={isPending}
          className={clsx(
            "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
            "bg-gray-900 text-white hover:bg-gray-800 active:scale-95",
            isPending && "opacity-70 cursor-wait"
          )}
          aria-label="Log activity"
        >
          {isPending ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus size={20} />
          )}
        </button>
      </div>
    </Link>
  );
}

