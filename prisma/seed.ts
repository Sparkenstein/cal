import { PrismaClient } from "./generated/client";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log("Starting seed...");

  // Cleanup existing data
  await prisma.log.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();

  // Create Test User
  const hashedPassword = await bcrypt.hash("password", 10);
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
    },
  });

  console.log(`Created user: ${user.email}`);

  // Define Activities
  const activitiesData = [
    { name: "Gym Workout", color: "#ef4444" }, // Red
    { name: "Read Book", color: "#3b82f6" }, // Blue
    { name: "Drank Water", color: "#10b981" }, // Emerald
    { name: "Code Side Project", color: "#8b5cf6" }, // Violet
    { name: "Meditation", color: "#f59e0b" }, // Amber
  ];

  for (const activityData of activitiesData) {
    const activity = await prisma.activity.create({
      data: {
        ...activityData,
        userId: user.id,
      },
    });

    console.log(`Created activity: ${activity.name}`);

    // Generate logs for the last 365 days
    // We'll vary the frequency to make it look realistic
    const logsData = [];
    for (let i = 0; i < 365; i++) {
      const date = subDays(new Date(), i);
      const probability = Math.random();

      // Simulate different habits
      let shouldLog = false;
      let count = 1;

      if (activity.name === "Gym Workout") {
        // Gym 3-4 times a week (approx 50% chance), rarely twice a day
        shouldLog = probability > 0.5;
      } else if (activity.name === "Read Book") {
        // Read almost every day
        shouldLog = probability > 0.2;
      } else if (activity.name === "Drank Water") {
        // Multiple times a day
        shouldLog = true;
        count = Math.floor(Math.random() * 5) + 1; // 1-5 times
      } else if (activity.name === "Code Side Project") {
        // Weekends mostly or sporadic
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        shouldLog = isWeekend ? probability > 0.3 : probability > 0.8;
      } else {
        // Random sporadic
        shouldLog = probability > 0.7;
      }

      if (shouldLog) {
        // Create 'count' number of logs for this day
        for (let c = 0; c < count; c++) {
          // Randomize time within the day
          const logDate = new Date(date);
          logDate.setHours(
            Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 60)
          );

          logsData.push({
            activityId: activity.id,
            count: 1,
            occurredAt: logDate,
          });
        }
      }
    }

    if (logsData.length > 0) {
      await prisma.log.createMany({
        data: logsData,
      });
      console.log(`  - Generated ${logsData.length} logs`);
    }
  }

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
