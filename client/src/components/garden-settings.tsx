import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, UserPlus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useGarden } from "@/hooks/use-garden";
import type { User, GardenCollaborator } from "@shared/schema";

interface GardenSettingsProps {
  gardenId: number;
  gardenName: string;
}

export function GardenSettings({ gardenId, gardenName }: GardenSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCollaboratorUsername, setNewCollaboratorUsername] = useState("");
  const { toast } = useToast();
  const { gardens } = useGarden();

  const currentGarden = gardens.find(g => g.id === gardenId);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
  });

  const addCollaboratorMutation = useMutation({
    mutationFn: async (username: string) => {
      const user = users.find(u => u.username === username);
      if (!user) {
        throw new Error("User not found");
      }
      const response = await apiRequest("POST", `/api/gardens/${gardenId}/collaborators`, {
        userId: user.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens"] });
      setNewCollaboratorUsername("");
      toast({
        title: "Success",
        description: "Collaborator added successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add collaborator",
        variant: "destructive",
      });
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/gardens/${gardenId}/collaborators/${userId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens"] });
      toast({
        title: "Success",
        description: "Collaborator removed successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove collaborator",
        variant: "destructive",
      });
    },
  });

  const handleAddCollaborator = () => {
    if (!newCollaboratorUsername.trim()) return;
    addCollaboratorMutation.mutate(newCollaboratorUsername.trim());
  };

  const handleRemoveCollaborator = (userId: number) => {
    removeCollaboratorMutation.mutate(userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Garden Settings - {gardenName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collaborators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter username"
                  value={newCollaboratorUsername}
                  onChange={(e) => setNewCollaboratorUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCollaborator()}
                />
                <Button 
                  onClick={handleAddCollaborator}
                  disabled={!newCollaboratorUsername.trim() || addCollaboratorMutation.isPending}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Collaborators</h4>
                <div className="space-y-2">
                  {currentGarden?.collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{collaborator.user.username}</span>
                        <Badge variant="secondary" className="text-xs">
                          {collaborator.role}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCollaborator(collaborator.userId)}
                        disabled={removeCollaboratorMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {!currentGarden?.collaborators.length && (
                    <p className="text-sm text-muted-foreground">No collaborators added yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}