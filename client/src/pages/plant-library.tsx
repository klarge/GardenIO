import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Edit, Trash2, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlantForm } from "@/components/plant-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { PlantWithVendors, InsertPlant } from "@shared/schema";

export default function PlantLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantWithVendors | null>(null);
  const { toast } = useToast();

  const { data: plants = [], isLoading } = useQuery<PlantWithVendors[]>({
    queryKey: ["/api/plants"],
  });

  const createPlantMutation = useMutation({
    mutationFn: async ({ data, vendorIds }: { data: InsertPlant; vendorIds: number[] }) => {
      const response = await apiRequest("POST", "/api/plants", data);
      const plant = await response.json();
      if (vendorIds.length > 0) {
        await apiRequest("PUT", `/api/plants/${plant.id}/vendors`, { vendorIds });
      }
      return plant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Plant added to library successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add plant to library", variant: "destructive" });
    },
  });

  const updatePlantMutation = useMutation({
    mutationFn: async ({ id, data, vendorIds }: { id: number; data: Partial<InsertPlant>; vendorIds: number[] }) => {
      const response = await apiRequest("PUT", `/api/plants/${id}`, data);
      await apiRequest("PUT", `/api/plants/${id}/vendors`, { vendorIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      setEditingPlant(null);
      toast({ title: "Success", description: "Plant updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update plant", variant: "destructive" });
    },
  });

  const deletePlantMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/plants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      toast({ title: "Success", description: "Plant deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete plant", variant: "destructive" });
    },
  });

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || plant.category === categoryFilter;
    const matchesSeason = seasonFilter === "all" || plant.season.toLowerCase().includes(seasonFilter.toLowerCase());
    return matchesSearch && matchesCategory && matchesSeason;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "vegetable": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "herb": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "fruit": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Plant Library</h2>
          <p className="text-muted-foreground">Manage your collection of plant varieties and their growing information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0 bg-garden-green hover:bg-green-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Plant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Plant</DialogTitle>
            </DialogHeader>
            <PlantForm
              onSubmit={(data, vendorIds) => createPlantMutation.mutate({ data, vendorIds })}
              isLoading={createPlantMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search plants by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="vegetable">Vegetables</SelectItem>
                  <SelectItem value="herb">Herbs</SelectItem>
                  <SelectItem value="fruit">Fruits</SelectItem>
                </SelectContent>
              </Select>
              <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Seasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plants Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted"></div>
              <CardContent className="p-6 space-y-2">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPlants.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No plants found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => (
            <Card key={plant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={plant.imageUrl || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"}
                alt={plant.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{plant.name}</h3>
                  <Badge className={getCategoryColor(plant.category)}>
                    {plant.category.charAt(0).toUpperCase() + plant.category.slice(1)}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{plant.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Days to Sprout:</span>
                    <span className="font-medium">{plant.daysToSprout} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Days to Harvest:</span>
                    <span className="font-medium">{plant.daysToHarvest} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Best Season:</span>
                    <span className="font-medium">{plant.season}</span>
                  </div>
                </div>

                {plant.vendors && plant.vendors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 mb-1.5">
                      <Store className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Available from:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {plant.vendors.map(v => (
                        <Badge key={v.id} variant="outline" className="text-xs">
                          {v.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Link href="/tracker">
                    <Button className="flex-1 bg-garden-green hover:bg-green-600 text-sm">
                      <Plus className="mr-1 h-3 w-3" />
                      Plant This
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => setEditingPlant(plant)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Plant</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{plant.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePlantMutation.mutate(plant.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Plant Dialog */}
      <Dialog open={!!editingPlant} onOpenChange={() => setEditingPlant(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Plant</DialogTitle>
          </DialogHeader>
          {editingPlant && (
            <PlantForm
              initialData={editingPlant}
              initialVendorIds={editingPlant.vendors?.map(v => v.id) || []}
              onSubmit={(data, vendorIds) => updatePlantMutation.mutate({ id: editingPlant.id, data, vendorIds })}
              isLoading={updatePlantMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
