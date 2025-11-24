import { getActivity } from "@/app/actions";
import { HistoryChart } from "@/app/components/HistoryChart";
import { LogItem } from "@/app/components/LogItem";
import { Heatmap } from "@/app/components/Heatmap";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityPage({ params }: PageProps) {
  const { id } = await params;
  const activity = await getActivity(id);

  if (!activity) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Dashboard
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: activity.color }}
          />
          <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
        </div>
        <p className="text-gray-500">
          Total logs: {activity.logs.length}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Yearly Activity</h2>
          <div className="overflow-x-auto pb-2">
             <Heatmap data={activity.logs} color={activity.color} />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Last 30 Days</h2>
          <HistoryChart data={activity.logs} color={activity.color} />
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Recent History</h2>
          {activity.logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No logs yet.</p>
          ) : (
            <div className="space-y-2">
              {activity.logs.slice(0, 10).map((log) => (
                <LogItem key={log.id} log={log} />
              ))}
              {activity.logs.length > 10 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  ...and {activity.logs.length - 10} more
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

