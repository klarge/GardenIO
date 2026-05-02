import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Sprout, Clock, TreePine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDate, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, addDays } from "date-fns";
import { getRelativeTime } from "@/lib/date-utils";
import { useGarden } from "@/hooks/use-garden";
import { apiRequest } from "@/lib/queryClient";
import type { PlantingWithPlant } from "@shared/schema";

type EventType = "planted" | "sprouting" | "maturity";

interface CalendarEvent {
  date: Date;
  type: EventType;
  planting: PlantingWithPlant;
  title: string;
  description?: string;
}

export default function Timeline() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { currentGarden } = useGarden();

  const { data: plantings = [], isLoading } = useQuery<PlantingWithPlant[]>({
    queryKey: ["/api/plantings", currentGarden?.id],
    enabled: !!currentGarden,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/plantings?gardenId=${currentGarden!.id}`);
      return response.json();
    },
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const buildEvents = (planting: PlantingWithPlant): CalendarEvent[] => {
    const plantedDate = new Date(planting.plantedDate);
    const { plant } = planting;
    const events: CalendarEvent[] = [];

    const candidates: { days: number | null | undefined; type: EventType; label: string }[] = [
      { days: 0,                    type: "planted",   label: `${plant.name} planted` },
      { days: plant.daysToSprout,   type: "sprouting", label: `${plant.name} sprouting` },
      { days: plant.daysToMaturity, type: "maturity",  label: `${plant.name} reaching maturity` },
    ];

    for (const { days, type, label } of candidates) {
      if (days == null) continue;
      const date = addDays(plantedDate, days);
      events.push({ date, type, planting, title: label });
    }

    return events;
  };

  // All events across all plantings
  const allEvents = plantings.flatMap(buildEvents);

  // Events visible in the current month's calendar
  const monthEvents = allEvents.filter(e => e.date >= monthStart && e.date <= monthEnd);

  // Upcoming events (next 30 days)
  const now = new Date();
  const upcoming = allEvents
    .filter(e => e.date > now && e.date <= addMonths(now, 1))
    .map(e => ({
      ...e,
      description: `${e.planting.location} • Expected: ${format(e.date, "MMM d, yyyy")} (${getRelativeTime(e.date)})`,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "planted":   return "bg-green-700 dark:bg-green-600 text-white";
      case "sprouting": return "bg-yellow-500 dark:bg-yellow-400 text-white dark:text-black";
      case "maturity":  return "bg-red-500 dark:bg-red-400 text-white";
      default:          return "bg-gray-500 text-white";
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "planted":   return <Sprout className="h-3.5 w-3.5 shrink-0" />;
      case "sprouting": return <Clock className="h-3.5 w-3.5 shrink-0" />;
      case "maturity":  return <TreePine className="h-3.5 w-3.5 shrink-0" />;
      default:          return <Sprout className="h-3.5 w-3.5 shrink-0" />;
    }
  };

  const getEventLabel = (type: EventType) => {
    switch (type) {
      case "planted":   return "Planted";
      case "sprouting": return "Sprouting";
      case "maturity":  return "Maturity";
      default:          return type;
    }
  };

  const getEventsForDay = (date: Date) =>
    monthEvents.filter(e => format(e.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Garden Calendar</h2>
        <p className="text-muted-foreground">Track planting milestones and upcoming garden activities</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(["planted", "sprouting", "maturity"] as EventType[]).map(type => (
          <span key={type} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${getEventColor(type)}`}>
            {getEventIcon(type)}
            {getEventLabel(type)}
          </span>
        ))}
      </div>

      {/* Month Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold text-foreground min-w-[160px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="animate-pulse h-96 bg-muted rounded" />
          ) : (
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Day cells */}
              {calendarDays.map((date) => {
                const dayEvents = getEventsForDay(date);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                return (
                  <div
                    key={date.toISOString()}
                    className={`bg-card p-2 min-h-[110px] ${!isCurrentMonth ? "opacity-40" : ""}`}
                  >
                    <div className={`text-sm font-medium mb-1.5 ${
                      isToday(date)
                        ? "text-green-600 dark:text-green-400 font-bold"
                        : isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {getDate(date)}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.map((event, index) => (
                        <div
                          key={index}
                          className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${getEventColor(event.type)}`}
                          title={event.title}
                        >
                          {getEventIcon(event.type)}
                          <span className="truncate">{event.planting.plant.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Upcoming Events (Next 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No upcoming events in the next 30 days</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{event.description}</p>
                    </div>
                  </div>
                  <Badge className={`${getEventColor(event.type)} shrink-0`}>
                    {getEventLabel(event.type)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
