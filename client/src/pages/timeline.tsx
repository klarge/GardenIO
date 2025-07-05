import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Sprout, Apple, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDate, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth } from "date-fns";
import { calculateSproutDate, calculateHarvestDate, getPlantingStatus, getRelativeTime } from "@/lib/date-utils";
import type { PlantingWithPlant } from "@shared/schema";

export default function Timeline() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: plantings = [], isLoading } = useQuery<PlantingWithPlant[]>({
    queryKey: ["/api/plantings"],
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get events for the current month
  const monthEvents = plantings.flatMap(planting => {
    const plantedDate = new Date(planting.plantedDate);
    const sproutDate = calculateSproutDate(plantedDate, planting.plant.daysToSprout);
    const harvestDate = calculateHarvestDate(plantedDate, planting.plant.daysToHarvest);
    
    const events = [];
    
    // Add planting event
    if (plantedDate >= monthStart && plantedDate <= monthEnd) {
      events.push({
        date: plantedDate,
        type: "planted",
        planting,
        title: `${planting.plant.name} planted`,
      });
    }
    
    // Add sprout event
    if (sproutDate >= monthStart && sproutDate <= monthEnd) {
      events.push({
        date: sproutDate,
        type: "sprouting",
        planting,
        title: `${planting.plant.name} sprouting`,
      });
    }
    
    // Add harvest event
    if (harvestDate >= monthStart && harvestDate <= monthEnd) {
      events.push({
        date: harvestDate,
        type: "harvest",
        planting,
        title: `${planting.plant.name} ready to harvest`,
      });
    }
    
    return events;
  });

  // Get upcoming events (next 30 days)
  const now = new Date();
  const upcoming = plantings.flatMap(planting => {
    const plantedDate = new Date(planting.plantedDate);
    const sproutDate = calculateSproutDate(plantedDate, planting.plant.daysToSprout);
    const harvestDate = calculateHarvestDate(plantedDate, planting.plant.daysToHarvest);
    const status = getPlantingStatus(plantedDate, planting.plant.daysToSprout, planting.plant.daysToHarvest);
    
    const events = [];
    
    // Add upcoming sprout events
    if (sproutDate > now && sproutDate <= addMonths(now, 1) && status === "sprouting") {
      events.push({
        date: sproutDate,
        type: "sprouting",
        planting,
        title: `${planting.plant.name} Expected to Sprout`,
        description: `${planting.location} • Expected: ${format(sproutDate, "MMM d, yyyy")} (${getRelativeTime(sproutDate)})`,
      });
    }
    
    // Add upcoming harvest events
    if (harvestDate > now && harvestDate <= addMonths(now, 1)) {
      events.push({
        date: harvestDate,
        type: "harvest",
        planting,
        title: `${planting.plant.name} Ready to Harvest`,
        description: `${planting.location} • Expected: ${format(harvestDate, "MMM d, yyyy")} (${getRelativeTime(harvestDate)})`,
      });
    }
    
    return events;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  const getEventColor = (type: string) => {
    switch (type) {
      case "planted":
        return "bg-green-600 dark:bg-green-500 text-white";
      case "sprouting":
        return "bg-yellow-500 dark:bg-yellow-400 text-white dark:text-black";
      case "harvest":
        return "bg-orange-500 dark:bg-orange-400 text-white dark:text-black";
      default:
        return "bg-gray-500 dark:bg-gray-400 text-white dark:text-black";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "planted":
        return <Sprout className="h-4 w-4" />;
      case "sprouting":
        return <Clock className="h-4 w-4" />;
      case "harvest":
        return <Apple className="h-4 w-4" />;
      default:
        return <Sprout className="h-4 w-4" />;
    }
  };

  const getEventsForDay = (date: Date) => {
    return monthEvents.filter(event => 
      format(event.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Garden Timeline</h2>
        <p className="text-muted-foreground">Track your garden's progress and upcoming activities</p>
      </div>

      {/* Timeline Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold text-foreground">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
                Month
              </Button>
              <Button variant="outline">Week</Button>
              <Button variant="outline">List</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-96 bg-muted rounded"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {/* Calendar Header */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-muted p-4 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarDays.map((date) => {
                const dayEvents = getEventsForDay(date);
                const dayNumber = getDate(date);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                
                return (
                  <div key={date.toISOString()} className={`bg-card p-3 min-h-[120px] ${
                    !isCurrentMonth ? "opacity-40" : ""
                  }`}>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday(date) 
                        ? "text-green-600 dark:text-green-400 font-bold" 
                        : isCurrentMonth 
                          ? "text-foreground" 
                          : "text-muted-foreground"
                    }`}>
                      {dayNumber}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event, index) => (
                        <div
                          key={index}
                          className={`text-xs px-2 py-1 rounded ${getEventColor(event.type)}`}
                        >
                          <div className="flex items-center gap-1">
                            {getEventIcon(event.type)}
                            <span className="truncate">{event.title}</span>
                          </div>
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
          <CardTitle className="text-lg font-semibold text-foreground">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No upcoming events in the next 30 days</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      event.type === "harvest" 
                        ? "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300" 
                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300"
                    }`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                  <Badge className={getEventColor(event.type)}>
                    {event.type === "harvest" ? "Harvest" : "Sprouting"}
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
