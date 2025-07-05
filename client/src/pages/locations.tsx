import { useState } from "react";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Location {
  id: number;
  name: string;
  description?: string;
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([
    { id: 1, name: "Garden Bed A", description: "Main vegetable garden bed" },
    { id: 2, name: "Garden Bed B", description: "Herb garden bed" },
    { id: 3, name: "Garden Bed C", description: "Flower garden bed" },
    { id: 4, name: "Container 1", description: "Large container on patio" },
    { id: 5, name: "Container 2", description: "Medium container on balcony" },
    { id: 6, name: "Container 3", description: "Small container for herbs" },
    { id: 7, name: "Greenhouse", description: "Climate controlled greenhouse" },
    { id: 8, name: "Indoor", description: "Indoor growing area" },
    { id: 9, name: "Balcony", description: "Balcony container garden" },
    { id: 10, name: "Windowsill", description: "Indoor windowsill herbs" },
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationDescription, setNewLocationDescription] = useState("");
  const { toast } = useToast();

  const handleAddLocation = () => {
    if (!newLocationName.trim()) {
      toast({
        title: "Error",
        description: "Location name is required",
        variant: "destructive",
      });
      return;
    }

    const newLocation: Location = {
      id: Math.max(...locations.map(l => l.id)) + 1,
      name: newLocationName.trim(),
      description: newLocationDescription.trim() || undefined,
    };

    setLocations([...locations, newLocation]);
    setNewLocationName("");
    setNewLocationDescription("");
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Location added successfully",
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

    setLocations(locations.map(loc => 
      loc.id === editingLocation.id 
        ? { ...loc, name: newLocationName.trim(), description: newLocationDescription.trim() || undefined }
        : loc
    ));
    
    setEditingLocation(null);
    setNewLocationName("");
    setNewLocationDescription("");
    
    toast({
      title: "Success",
      description: "Location updated successfully",
    });
  };

  const handleDeleteLocation = (id: number) => {
    setLocations(locations.filter(loc => loc.id !== id));
    toast({
      title: "Success",
      description: "Location deleted successfully",
    });
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
              Add New Location
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