import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Apple, Clock, Leaf } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getPlantingStatus, getStatusColor } from "@/lib/date-utils";
import type { PlantingWithPlant } from "@shared/schema";

interface DashboardStats {
  activePlantings: number;
  readyHarvest: number;
  sproutingSoon: number;
  plantVarieties: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: plantings, isLoading: plantingsLoading } = useQuery<PlantingWithPlant[]>({
    queryKey: ["/api/plantings"],
  });

  const recentPlantings = plantings?.slice(-5) || [];
  const upcomingHarvest = plantings?.filter(p => {
    const status = getPlantingStatus(new Date(p.plantedDate), p.plant.daysToSprout, p.plant.daysToHarvest);
    return status === "ready" || status === "growing";
  }).slice(0, 5) || [];

  if (statsLoading || plantingsLoading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-seed-dark mb-2">Garden Dashboard</h2>
          <p className="text-soil-gray">Overview of your current plantings and upcoming harvest dates</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-seed-dark mb-2">Garden Dashboard</h2>
        <p className="text-soil-gray">Overview of your current plantings and upcoming harvest dates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-soil-gray">Active Plantings</p>
                <p className="text-2xl font-bold text-seed-dark">{stats?.activePlantings || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Sprout className="text-garden-green text-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-soil-gray">Ready to Harvest</p>
                <p className="text-2xl font-bold text-harvest-orange">{stats?.readyHarvest || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Apple className="text-harvest-orange text-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-soil-gray">Sprouting Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.sproutingSoon || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="text-yellow-600 text-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-soil-gray">Plant Varieties</p>
                <p className="text-2xl font-bold text-seed-dark">{stats?.plantVarieties || 0}</p>
              </div>
              <div className="bg-slate-100 p-3 rounded-full">
                <Leaf className="text-soil-gray text-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Plantings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-seed-dark">Recent Plantings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPlantings.length === 0 ? (
              <p className="text-soil-gray text-center py-8">No recent plantings found</p>
            ) : (
              <div className="space-y-4">
                {recentPlantings.map((planting) => {
                  const status = getPlantingStatus(new Date(planting.plantedDate), planting.plant.daysToSprout, planting.plant.daysToHarvest);
                  return (
                    <div key={planting.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Sprout className="text-garden-green text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-seed-dark">{planting.plant.name}</p>
                          <p className="text-sm text-soil-gray">
                            {planting.location} • {formatDistanceToNow(new Date(planting.plantedDate), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Harvest */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-seed-dark">Upcoming Harvest</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingHarvest.length === 0 ? (
              <p className="text-soil-gray text-center py-8">No upcoming harvests</p>
            ) : (
              <div className="space-y-4">
                {upcomingHarvest.map((planting) => {
                  const status = getPlantingStatus(new Date(planting.plantedDate), planting.plant.daysToSprout, planting.plant.daysToHarvest);
                  return (
                    <div key={planting.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Apple className="text-harvest-orange text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-seed-dark">{planting.plant.name}</p>
                          <p className="text-sm text-soil-gray">
                            {planting.location} • {formatDistanceToNow(new Date(planting.plantedDate), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(status)}>
                        {status === "ready" ? "Ready Soon" : "Growing"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
