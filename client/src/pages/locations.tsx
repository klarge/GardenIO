import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Location, InsertLocation } from "@shared/schema";

export default function Locations() {
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationDescription, setNewLocationDescription] = useState("");
  const { toast } = useToast();

  const createLocationMutation = useMutation({
    mutationFn: async (data: InsertLocation) => {
      const response = await apiRequest("POST", "/api/locations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setIsAddDialogOpen(false);
      setNewLocationName("");
      setNewLocationDescription("");
      toast({
        title: "Success",
        description: "Location added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add location",
        variant: "destructive",
      });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLocation> }) => {
      const response = await apiRequest("PUT", `/api/locations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setEditingLocation(null);
      setNewLocationName("");
      setNewLocationDescription("");
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/locations/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  const handleAddLocation = () => {
    if (!newLocationName.trim()) {
      toast({
        title: "Error",
        description: "Location name is required",
        variant: "destructive",
      });
      return;
    }

    createLocationMutation.mutate({
      name: newLocationName.trim(),
      description: newLocationDescription.trim() || null
    });
  };

  const handleEditLocation = () => {
    if (!editingLocation || !newLocationName.trim()) {
      toast({
        title: "Error",
        description: "Location name is required",
        variant: "destructive",
      });
      return;
    }

    updateLocationMutation.mutate({
      id: editingLocation.id,
      data: {
        name: newLocationName.trim(),
        description: newLocationDescription.trim() || null
      }
    });
  };

  const handleDeleteLocation = (id: number) => {
    deleteLocationMutation.mutate(id);
  };

  const openEditDialog = (location: Location) => {
    setEditingLocation(location);
    setNewLocationName(location.name);
    setNewLocationDescription(location.description || "");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-seed-dark mb-2">Planting Locations</h2>
          <p className="text-soil-gray">Manage your garden beds, containers, and growing areas</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0 bg-garden-green hover:bg-green-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="locationName" className="block text-sm font-medium text-seed-dark mb-2">
                  Location Name *
                </label>
                <Input
                  id="locationName"
                  placeholder="e.g., Garden Bed D, Container 4"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="locationDescription" className="block text-sm font-medium text-seed-dark mb-2">
                  Description (Optional)
                </label>
                <Input
                  id="locationDescription"
                  placeholder="Brief description of the location"
                  value={newLocationDescription}
                  onChange={(e) => setNewLocationDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddLocation} className="bg-garden-green hover:bg-green-600">
                  Add Location
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-garden-green" />
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(location)}
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
                        <AlertDialogTitle>Delete Location</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{location.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteLocation(location.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            {location.description && (
              <CardContent>
                <p className="text-soil-gray text-sm">{location.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Edit Location Dialog */}
      <Dialog open={!!editingLocation} onOpenChange={() => setEditingLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="editLocationName" className="block text-sm font-medium text-seed-dark mb-2">
                Location Name *
              </label>
              <Input
                id="editLocationName"
                placeholder="e.g., Garden Bed D, Container 4"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="editLocationDescription" className="block text-sm font-medium text-seed-dark mb-2">
                Description (Optional)
              </label>
              <Input
                id="editLocationDescription"
                placeholder="Brief description of the location"
                value={newLocationDescription}
                onChange={(e) => setNewLocationDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleEditLocation} className="bg-garden-green hover:bg-green-600">
                Update Location
              </Button>
              <Button variant="outline" onClick={() => setEditingLocation(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}