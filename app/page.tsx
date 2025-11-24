import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getActivities } from "./actions";
import { ActivityCard } from "./components/ActivityCard";
import { AddActivityButton } from "./components/AddActivityButton";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center space-y-8 animate-in fade-in duration-700">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-gray-900">
          Track your life, <span className="text-gray-500">simply.</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
          Not just habits. Track occurrences. <br />
          How many times did you have cake? Work late? Call your parents? <br />
          See the patterns in your life without the complexity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 text-center"
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="bg-white text-black border border-gray-200 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 text-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const activities = await getActivities();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            My Activities
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <AddActivityButton />
      </header>

      {activities.length === 0 ? (
        <div className="text-center py-24 px-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No activities yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Start by adding something simple you want to track. "Drank Water",
            "Read 10 pages", or "Went for a walk".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
