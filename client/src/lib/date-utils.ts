import { addDays, format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

export function calculateSproutDate(plantedDate: Date, daysToSprout: number): Date {
  return addDays(plantedDate, daysToSprout);
}

export function calculateHarvestDate(plantedDate: Date, daysToHarvest: number): Date {
  return addDays(plantedDate, daysToHarvest);
}

export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, "MMM d")}-${format(endDate, "MMM d, yyyy")}`;
}

export function getRelativeTime(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isPast(date)) return formatDistanceToNow(date, { addSuffix: true });
  return `in ${formatDistanceToNow(date)}`;
}

export function getPlantingStatus(plantedDate: Date, daysToSprout: number, daysToHarvest: number): string {
  const today = new Date();
  const daysSincePlanted = Math.floor((today.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSincePlanted >= daysToHarvest) {
    return "ready";
  } else if (daysSincePlanted >= daysToSprout) {
    return "growing";
  } else {
    return "sprouting";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "planted":
      return "bg-blue-100 text-blue-800";
    case "sprouting":
      return "bg-yellow-100 text-yellow-800";
    case "growing":
      return "bg-green-100 text-green-800";
    case "ready":
      return "bg-harvest-orange text-white";
    case "harvested":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
