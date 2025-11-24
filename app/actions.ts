"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { Activity } from "../prisma/generated/client";

export type ActivityWithCounts = Activity & {
  monthCount: number;
  todayCount: number;
};

export async function getActivities(): Promise<ActivityWithCounts[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return [];
  }

  // Get user ID from email (or ensure session has ID)
  // The auth options callback ensures session.user.id is set.
  const userId = (session.user as any).id;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const activities = await prisma.activity.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          logs: {
            where: {
              occurredAt: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // We also want today's count separately to show "Done today" status
  // Prisma doesn't easily support multiple filtered counts in one go without raw query or separate queries.
  // For simplicity/performance trade-off, we can fetch today's logs for all user activities or just do a separate count.
  // Since the number of activities is likely small (< 50), we can iterate.

  const activitiesWithCounts = await Promise.all(
    activities.map(async (activity) => {
      const todayCount = await prisma.log.count({
        where: {
          activityId: activity.id,
          occurredAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      return {
        ...activity,
        monthCount: activity._count.logs,
        todayCount,
      };
    })
  );

  return activitiesWithCounts;
}

export async function getActivity(activityId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      logs: {
        orderBy: { occurredAt: "desc" },
      },
    },
  });

  if (!activity) {
    return null;
  }

  if (activity.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return activity;
}

export async function createActivity(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;
  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || "#000000";

  if (!name) throw new Error("Name is required");

  await prisma.activity.create({
    data: {
      name,
      color,
      userId,
    },
  });

  revalidatePath("/");
}

export async function logActivity(activityId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.log.create({
    data: {
      activityId,
      count: 1,
      occurredAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath(`/activities/${activityId}`);
}

export async function deleteLog(logId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const log = await prisma.log.findUnique({
    where: { id: logId },
    include: { activity: true },
  });

  if (!log) {
    throw new Error("Log not found");
  }

  if (log.activity.userId !== (session.user as any).id) {
    throw new Error("Unauthorized");
  }

  await prisma.log.delete({
    where: { id: logId },
  });

  revalidatePath("/");
  revalidatePath(`/activities/${log.activityId}`);
}

export async function deleteActivity(activityId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (activity?.userId !== (session.user as any).id) {
    throw new Error("Unauthorized");
  }

  await prisma.activity.delete({
    where: { id: activityId },
  });

  revalidatePath("/");
}
