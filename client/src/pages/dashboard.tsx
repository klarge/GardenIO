import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sprout, Apple, Clock, Edit, Trash2, MapPin, Calendar, Plus } from "lucide-react";
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

type FilterType = "all" | "active" | "ready" | "sprouting";

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showAddPlanting, setShowAddPlanting] = useState(false);
  const [editingPlanting, setEditingPlanting] = useState<PlantingWithPlant | null>(null);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: plantings = [], isLoading: plantingsLoading } = useQuery<PlantingWithPlant[]>({
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
        description: "Planting added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add planting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePlantingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPlanting> }) => {
      const response = await apiRequest("PATCH", `/api/plantings/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plantings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setEditingPlanting(null);
      toast({
        title: "Success",
        description: "Planting updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update planting. Please try again.",
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
        description: "Planting deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete planting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getFilteredPlantings = () => {
    const now = new Date();
    
    switch (activeFilter) {
      case "active":
        return plantings.filter(p => p.status !== "harvested");
      case "ready":
        return plantings.filter(p => {
          const plantedDate = new Date(p.plantedDate);
          const daysSincePlanted = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysSincePlanted >= p.plant.daysToHarvest && p.status !== "harvested";
        });
      case "sprouting":
        return plantings.filter(p => {
          const plantedDate = new Date(p.plantedDate);
          const daysSincePlanted = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysSincePlanted >= p.plant.daysToSprout && daysSincePlanted < p.plant.daysToHarvest && p.status !== "harvested";
        });
      default:
        return plantings;
    }
  };

  const filteredPlantings = getFilteredPlantings();

  const handleEditPlanting = (planting: PlantingWithPlant) => {
    setEditingPlanting(planting);
  };

  const handleDeletePlanting = (id: number) => {
    deletePlantingMutation.mutate(id);
  };

  if (statsLoading || plantingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your garden's progress</p>
        </div>
        <Button onClick={() => setShowAddPlanting(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Planting
        </Button>
      </div>

      {/* Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className={`cursor-pointer transition-all ${activeFilter === "all" ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-md"}`}
          onClick={() => setActiveFilter("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Plantings</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plantings.length}</div>
            <p className="text-xs text-muted-foreground">Total plantings</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${activeFilter === "active" ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-md"}`}
          onClick={() => setActiveFilter("active")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plantings</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePlantings || 0}</div>
            <p className="text-xs text-muted-foreground">Currently growing</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${activeFilter === "ready" ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-md"}`}
          onClick={() => setActiveFilter("ready")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Harvest</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.readyHarvest || 0}</div>
            <p className="text-xs text-muted-foreground">Ready now</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${activeFilter === "sprouting" ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-md"}`}
          onClick={() => setActiveFilter("sprouting")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprouting Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sproutingSoon || 0}</div>
            <p className="text-xs text-muted-foreground">Almost ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Plantings Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {activeFilter === "all" && "All Plantings"}
            {activeFilter === "active" && "Active Plantings"}
            {activeFilter === "ready" && "Ready to Harvest"}
            {activeFilter === "sprouting" && "Sprouting Soon"}
            {filteredPlantings.length > 0 && ` (${filteredPlantings.length})`}
          </h2>
        </div>

        {filteredPlantings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sprout className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No plantings found</h3>
              <p className="text-gray-600 text-center max-w-md">
                {activeFilter === "all" 
                  ? "Get started by adding your first planting!"
                  : `No plantings match the ${activeFilter} filter.`
                }
              </p>
              {activeFilter === "all" && (
                <Button onClick={() => setShowAddPlanting(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Planting
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlantings.map((planting) => {
              const status = getPlantingStatus(
                new Date(planting.plantedDate),
                planting.plant.daysToSprout,
                planting.plant.daysToHarvest
              );
              const statusColor = getStatusColor(status);
              const sproutDate = calculateSproutDate(new Date(planting.plantedDate), planting.plant.daysToSprout);
              const harvestDate = calculateHarvestDate(new Date(planting.plantedDate), planting.plant.daysToHarvest);

              return (
                <Card key={planting.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{planting.plant.name}</CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {planting.location}
                        </div>
                      </div>
                      <Badge variant={statusColor as any}>{status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Planted</div>
                        <div className="font-medium">{formatDate(new Date(planting.plantedDate))}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Quantity</div>
                        <div className="font-medium">{planting.quantity}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Expected Sprout</span>
                        <span className="font-medium">{formatDate(sproutDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Expected Harvest</span>
                        <span className="font-medium">{formatDate(harvestDate)}</span>
                      </div>
                    </div>

                    {planting.notes && (
                      <div className="text-sm">
                        <div className="text-gray-600 mb-1">Notes</div>
                        <div className="text-gray-800 italic">{planting.notes}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlanting(planting)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Planting</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this {planting.plant.name} planting? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePlanting(planting.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

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

      {/* Edit Planting Dialog */}
      <Dialog open={!!editingPlanting} onOpenChange={() => setEditingPlanting(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Planting</DialogTitle>
          </DialogHeader>
          {editingPlanting && (
            <PlantingForm
              plants={plants}
              initialData={{
                plantId: editingPlanting.plantId,
                location: editingPlanting.location,
                plantedDate: editingPlanting.plantedDate,
                quantity: editingPlanting.quantity,
                notes: editingPlanting.notes || "",
              }}
              onSubmit={(data) => updatePlantingMutation.mutate({ id: editingPlanting.id, data })}
              isLoading={updatePlantingMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}