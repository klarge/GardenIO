import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sprout, Apple, Clock, Edit, Trash2, MapPin, Calendar, Plus, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getPlantingStatus, getStatusColor, formatDate, calculateSproutDate, calculateHarvestDate } from "@/lib/date-utils";
import { PlantingForm } from "@/components/planting-form";
import { HarvestDialog } from "@/components/harvest-dialog";
import { useToast } from "@/hooks/use-toast";
import { useGarden } from "@/hooks/use-garden";
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
  const [viewingPlanting, setViewingPlanting] = useState<PlantingWithPlant | null>(null);
  const [harvestingPlanting, setHarvestingPlanting] = useState<PlantingWithPlant | null>(null);
  const { toast } = useToast();
  const { currentGarden } = useGarden();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats", currentGarden?.id],
    enabled: !!currentGarden,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/stats?gardenId=${currentGarden!.id}`);
      return response.json();
    },
  });

  const { data: plantings = [], isLoading: plantingsLoading } = useQuery<PlantingWithPlant[]>({
    queryKey: ["/api/plantings", currentGarden?.id],
    enabled: !!currentGarden,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/plantings?gardenId=${currentGarden!.id}`);
      return response.json();
    },
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
      queryClient.invalidateQueries({ queryKey: ["/api/plantings", currentGarden?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats", currentGarden?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/plantings", currentGarden?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats", currentGarden?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/plantings", currentGarden?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats", currentGarden?.id] });
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
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your garden's progress</p>
        </div>
        <Button onClick={() => setShowAddPlanting(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Planting
        </Button>
      </div>

      {/* Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className={`cursor-pointer transition-all ${activeFilter === "all" ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950" : "hover:shadow-md"}`}
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
          className={`cursor-pointer transition-all ${activeFilter === "active" ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950" : "hover:shadow-md"}`}
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
          className={`cursor-pointer transition-all ${activeFilter === "ready" ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950" : "hover:shadow-md"}`}
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
          className={`cursor-pointer transition-all ${activeFilter === "sprouting" ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950" : "hover:shadow-md"}`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPlantings.map((planting) => {
              const status = getPlantingStatus(
                new Date(planting.plantedDate),
                planting.plant.daysToSprout,
                planting.plant.daysToHarvest
              );
              const statusColor = getStatusColor(status);

              return (
                <Card key={planting.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewingPlanting(planting)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm truncate">{planting.plant.name}</CardTitle>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{planting.location}</span>
                        </div>
                      </div>
                      <Badge variant={statusColor as any} className="text-xs">{status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Planted: {formatDate(new Date(planting.plantedDate))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {planting.quantity}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingPlanting(planting);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      <div className="flex gap-1">
                        {status === "Ready to Harvest" && planting.status !== "harvested" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHarvestingPlanting(planting);
                            }}
                            className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                          >
                            <Apple className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPlanting(planting);
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
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

      {/* View Planting Details Dialog */}
      <Dialog open={!!viewingPlanting} onOpenChange={() => setViewingPlanting(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{viewingPlanting?.plant.name} Details</DialogTitle>
            <DialogDescription>
              View complete information about this planting
            </DialogDescription>
          </DialogHeader>
          {viewingPlanting && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plant Image */}
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {viewingPlanting.plant.imageUrl ? (
                    <img
                      src={viewingPlanting.plant.imageUrl}
                      alt={viewingPlanting.plant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Sprout className="h-16 w-16" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">About this plant</h3>
                  <p className="text-sm text-muted-foreground">{viewingPlanting.plant.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Category: {viewingPlanting.plant.category}</span>
                    <span>Season: {viewingPlanting.plant.season}</span>
                  </div>
                </div>
              </div>

              {/* Planting Details */}
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{viewingPlanting.plant.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {viewingPlanting.location}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(getPlantingStatus(
                    new Date(viewingPlanting.plantedDate),
                    viewingPlanting.plant.daysToSprout,
                    viewingPlanting.plant.daysToHarvest
                  )) as any}>
                    {getPlantingStatus(
                      new Date(viewingPlanting.plantedDate),
                      viewingPlanting.plant.daysToSprout,
                      viewingPlanting.plant.daysToHarvest
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Planted Date</div>
                    <div className="text-sm text-muted-foreground">{formatDate(new Date(viewingPlanting.plantedDate))}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Quantity</div>
                    <div className="text-sm text-muted-foreground">{viewingPlanting.quantity} plants</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Expected Sprout</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(calculateSproutDate(new Date(viewingPlanting.plantedDate), viewingPlanting.plant.daysToSprout))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Expected Harvest</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(calculateHarvestDate(new Date(viewingPlanting.plantedDate), viewingPlanting.plant.daysToHarvest))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium">Growing Timeline</div>
                  <div className="text-xs text-muted-foreground">
                    Sprouts in {viewingPlanting.plant.daysToSprout} days • Ready to harvest in {viewingPlanting.plant.daysToHarvest} days
                  </div>
                </div>

                {viewingPlanting.notes && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Notes</div>
                    <div className="text-sm text-muted-foreground italic">{viewingPlanting.notes}</div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setViewingPlanting(null);
                      handleEditPlanting(viewingPlanting);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Planting
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Planting</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this {viewingPlanting.plant.name} planting? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          handleDeletePlanting(viewingPlanting.id);
                          setViewingPlanting(null);
                        }}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Harvest Dialog */}
      {harvestingPlanting && (
        <HarvestDialog
          planting={harvestingPlanting}
          isOpen={!!harvestingPlanting}
          onClose={() => setHarvestingPlanting(null)}
        />
      )}
    </div>
  );
}