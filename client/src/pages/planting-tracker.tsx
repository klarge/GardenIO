import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Edit, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlantingForm } from "@/components/planting-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatDate, calculateSproutDate, calculateHarvestDate, getPlantingStatus, getStatusColor } from "@/lib/date-utils";
import type { Plant, PlantingWithPlant, InsertPlanting } from "@shared/schema";

export default function PlantingTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingPlanting, setEditingPlanting] = useState<PlantingWithPlant | null>(null);
  const { toast } = useToast();

  const { data: plants = [], isLoading: plantsLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  const { data: plantings = [], isLoading: plantingsLoading } = useQuery<PlantingWithPlant[]>({
    queryKey: ["/api/plantings"],
  });

  const createPlantingMutation = useMutation({
    mutationFn: async (data: InsertPlanting) => {
      const response = await apiRequest("POST", "/api/plantings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plantings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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

  const filteredPlantings = plantings.filter((planting) => {
    const matchesSearch = planting.plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         planting.location.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getPlantingStatus(new Date(planting.plantedDate), planting.plant.daysToSprout, planting.plant.daysToHarvest);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const isLoading = plantsLoading || plantingsLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-seed-dark mb-2">Planting Tracker</h2>
        <p className="text-soil-gray">Record new plantings and manage your current garden activity</p>
      </div>

      {/* Add New Planting Form */}
      <PlantingForm
        plants={plants}
        onSubmit={(data) => createPlantingMutation.mutate(data)}
        isLoading={createPlantingMutation.isPending}
      />

      {/* Current Plantings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-seed-dark">Current Plantings</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soil-gray h-4 w-4" />
                <Input
                  placeholder="Search plantings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sprouting">Sprouting</SelectItem>
                  <SelectItem value="growing">Growing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : filteredPlantings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-soil-gray">No plantings found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plant & Location</TableHead>
                    <TableHead>Planted Date</TableHead>
                    <TableHead>Expected Sprout</TableHead>
                    <TableHead>Expected Harvest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlantings.map((planting) => {
                    const plantedDate = new Date(planting.plantedDate);
                    const sproutDate = calculateSproutDate(plantedDate, planting.plant.daysToSprout);
                    const harvestDate = calculateHarvestDate(plantedDate, planting.plant.daysToHarvest);
                    const status = getPlantingStatus(plantedDate, planting.plant.daysToSprout, planting.plant.daysToHarvest);
                    
                    return (
                      <TableRow key={planting.id}>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-seed-dark">{planting.plant.name}</div>
                            <div className="text-sm text-soil-gray">{planting.location}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-soil-gray">
                          {formatDate(plantedDate)}
                        </TableCell>
                        <TableCell className="text-sm text-soil-gray">
                          {formatDate(sproutDate)}
                        </TableCell>
                        <TableCell className="text-sm text-soil-gray">
                          {formatDate(harvestDate)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPlanting(planting)}
                              className="text-garden-green hover:text-green-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
