import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sprout, Apple, Clock, Leaf, Edit, Trash2, MapPin, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getPlantingStatus, getStatusColor, formatDate, calculateSproutDate, calculateHarvestDate } from "@/lib/date-utils";
import { PlantingForm } from "@/components/planting-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { PlantingWithPlant, Plant, InsertPlanting } from "@shared/schema";

interface DashboardStats {
  activePlantings: number;
  readyHarvest: number;
  sproutingSoon: number;
  plantVarieties: number;
}

export default function Dashboard() {
  const [showActivePlantings, setShowActivePlantings] = useState(false);
  const [showAddPlanting, setShowAddPlanting] = useState(false);
  const [editingPlanting, setEditingPlanting] = useState<PlantingWithPlant | null>(null);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: plantings, isLoading: plantingsLoading } = useQuery<PlantingWithPlant[]>({
    queryKey: ["/api/plantings"],
  });

  const { data: plants = [] } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  const createPlantingMutation = useMutation({
    mutationFn: async (data: InsertPlanting) => {
      const response = await apiRequest("POST", "/api/plantings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plantings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowAddPlanting(false);
      toast({
        title: "Success",
        description: "Planting recorded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record planting",
        variant: "destructive",
      });
    },
  });

  const updatePlantingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPlanting> }) => {
      const response = await apiRequest("PUT", `/api/plantings/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plantings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setEditingPlanting(null);
      toast({
        title: "Success",
        description: "Planting updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update planting",
        variant: "destructive",
      });
    },
  });

  const deletePlantingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/plantings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plantings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Planting deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete planting",
        variant: "destructive",
      });
    },
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-seed-dark mb-2">Garden Dashboard</h2>
          <p className="text-soil-gray">Overview of your current plantings and upcoming harvest dates</p>
        </div>
        <Button 
          onClick={() => setShowAddPlanting(true)}
          className="mt-4 sm:mt-0 bg-garden-green hover:bg-green-600"
        >
          <span className="mr-2">+</span>Add New Planting
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowActivePlantings(true)}>
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

      {/* Active Plantings Dialog */}
      <Dialog open={showActivePlantings} onOpenChange={setShowActivePlantings}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Active Plantings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {plantings?.length === 0 ? (
              <p className="text-soil-gray text-center py-8">No active plantings found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plantings?.map((planting) => {
                  const plantedDate = new Date(planting.plantedDate);
                  const sproutDate = calculateSproutDate(plantedDate, planting.plant.daysToSprout);
                  const harvestDate = calculateHarvestDate(plantedDate, planting.plant.daysToHarvest);
                  const status = getPlantingStatus(plantedDate, planting.plant.daysToSprout, planting.plant.daysToHarvest);
                  
                  return (
                    <Card key={planting.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{planting.plant.name}</CardTitle>
                          <Badge className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-soil-gray">
                            <MapPin className="h-4 w-4" />
                            <span>{planting.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-soil-gray">
                            <Calendar className="h-4 w-4" />
                            <span>Planted: {formatDate(plantedDate)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-soil-gray">Expected Sprout:</span>
                              <p className="font-medium">{formatDate(sproutDate)}</p>
                            </div>
                            <div>
                              <span className="text-soil-gray">Expected Harvest:</span>
                              <p className="font-medium">{formatDate(harvestDate)}</p>
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-soil-gray">Quantity: </span>
                            <span className="font-medium">{planting.quantity}</span>
                          </div>
                          {planting.notes && (
                            <div className="text-sm">
                              <span className="text-soil-gray">Notes: </span>
                              <p className="text-seed-dark">{planting.notes}</p>
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPlanting(planting)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Planting</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this planting record? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deletePlantingMutation.mutate(planting.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Planting Dialog */}
      <Dialog open={!!editingPlanting} onOpenChange={() => setEditingPlanting(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Planting</DialogTitle>
          </DialogHeader>
          {editingPlanting && (
            <PlantingForm
              plants={plants}
              initialData={editingPlanting}
              onSubmit={(data) => updatePlantingMutation.mutate({ id: editingPlanting.id, data })}
              isLoading={updatePlantingMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Planting Dialog */}
      <Dialog open={showAddPlanting} onOpenChange={setShowAddPlanting}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Planting</DialogTitle>
          </DialogHeader>
          <PlantingForm
            plants={plants}
            onSubmit={(data) => createPlantingMutation.mutate(data)}
            isLoading={createPlantingMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
