"use client";

import {
  eachDayOfInterval,
  endOfYear,
  format,
  getDay,
  isSameDay,
  startOfYear,
  subMonths,
} from "date-fns";
import { useMemo } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface HeatmapProps {
  data: { occurredAt: Date; count: number }[];
  color: string;
}

export function Heatmap({ data, color }: HeatmapProps) {
  const calendarData = useMemo(() => {
    const today = new Date();
    // Show last 12 months roughly, or just current year.
    // Let's do current year for "Your Calendar" feel.
    const start = startOfYear(today);
    const end = endOfYear(today);

    const days = eachDayOfInterval({ start, end });

    // Calculate max count for intensity scaling
    let maxCount = 0;
    const dayMap = new Map<string, number>();

    data.forEach((log) => {
      const dateKey = format(new Date(log.occurredAt), "yyyy-MM-dd");
      const current = dayMap.get(dateKey) || 0;
      dayMap.set(dateKey, current + log.count);
      maxCount = Math.max(maxCount, current + log.count);
    });

    return { days, dayMap, maxCount: Math.max(1, maxCount) };
  }, [data]);

  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    // Simple 4-level intensity scale like GitHub
    const intensity = Math.ceil((count / calendarData.maxCount) * 4);
    return intensity;
  };

  // Helper to get color based on intensity
  // We'll use opacity for simplicity as it works with any base color
  const getStyle = (count: number) => {
    if (count === 0) return { backgroundColor: "#f3f4f6" }; // gray-100
    const alpha = 0.2 + (count / calendarData.maxCount) * 0.8;
    return { backgroundColor: color, opacity: alpha };
  };

  // Group by weeks for the grid layout
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];

    // Add empty days for the start of the first week if needed
    const firstDay = calendarData.days[0];
    const startDayOfWeek = getDay(firstDay); // 0 = Sunday

    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(new Date(0)); // Placeholder
    }

    calendarData.days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [calendarData.days]);

  // Transpose for the typical horizontal scrolling year view (optional)
  // OR standard month view grids.
  // Let's stick to a simple continuous grid for now, maybe "Months" as blocks?
  // Actually, a single continuous grid like GitHub's contribution graph is best for "Year View".
  // To make it responsive, let's just do a flex wrap of weeks.

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-1 min-w-max">
        {/* Days labels (Mon, Wed, Fri) */}
        <div className="flex flex-col gap-1 pt-4 text-xs text-gray-400 pr-2">
          <div className="h-3">Sun</div>
          <div className="h-3"></div>
          <div className="h-3"></div>
          <div className="h-3"></div>
          <div className="h-3"></div>
          <div className="h-3"></div>
          <div className="h-3">Sat</div>
        </div>

        {/* The Grid */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="flex flex-col gap-1 w-3 overflow-visible"
            >
              {/* Month Label (only if it's the first week of the month) */}
              <div className="h-3 text-xs text-gray-400 mb-1 whitespace-nowrap">
                {week.some((d) => d.getDate() === 1) &&
                  format(week.find((d) => d.getDate() === 1)!, "MMM")}
              </div>

              {week.map((day, dayIndex) => {
                if (day.getTime() === 0) {
                  return (
                    <div
                      key={`empty-${weekIndex}-${dayIndex}`}
                      className="w-3 h-3"
                    />
                  );
                }

                const dateKey = format(day, "yyyy-MM-dd");
                const count = calendarData.dayMap.get(dateKey) || 0;

                return (
                  <div
                    key={dateKey}
                    className="w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-gray-400 hover:z-10"
                    style={getStyle(count)}
                    data-tooltip-id="heatmap-tooltip"
                    data-tooltip-content={`${count} logs on ${format(
                      day,
                      "MMM do, yyyy"
                    )}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <ReactTooltip
        id="heatmap-tooltip"
        className="z-50 !rounded-lg !text-xs !px-3 !py-2"
      />
    </div>
  );
}
