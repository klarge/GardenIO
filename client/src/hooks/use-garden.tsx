import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { Garden, GardenWithCollaborators, InsertGarden, InsertGardenCollaborator } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type GardenContextType = {
  currentGarden: GardenWithCollaborators | null;
  gardens: GardenWithCollaborators[];
  isLoading: boolean;
  error: Error | null;
  setCurrentGarden: (garden: GardenWithCollaborators | null) => void;
  createGardenMutation: UseMutationResult<Garden, Error, InsertGarden>;
  updateGardenMutation: UseMutationResult<Garden, Error, { id: number; data: Partial<InsertGarden> }>;
  deleteGardenMutation: UseMutationResult<void, Error, number>;
  addCollaboratorMutation: UseMutationResult<any, Error, { gardenId: number; userId: number }>;
  removeCollaboratorMutation: UseMutationResult<void, Error, { gardenId: number; userId: number }>;
};

export const GardenContext = createContext<GardenContextType | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [currentGarden, setCurrentGarden] = useState<GardenWithCollaborators | null>(null);

  const {
    data: gardens = [],
    error,
    isLoading,
  } = useQuery<GardenWithCollaborators[], Error>({
    queryKey: ["/api/gardens"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/gardens");
      return response.json();
    },
  });

  // Set the first garden as current if none is selected
  useEffect(() => {
    if (gardens.length > 0 && !currentGarden) {
      const savedGardenId = localStorage.getItem("currentGardenId");
      if (savedGardenId) {
        const savedGarden = gardens.find(g => g.id === parseInt(savedGardenId));
        if (savedGarden) {
          setCurrentGarden(savedGarden);
          return;
        }
      }
      setCurrentGarden(gardens[0]);
    }
  }, [gardens, currentGarden]);

  // Save current garden to localStorage
  useEffect(() => {
    if (currentGarden) {
      localStorage.setItem("currentGardenId", currentGarden.id.toString());
    }
  }, [currentGarden]);

  const createGardenMutation = useMutation({
    mutationFn: async (gardenData: InsertGarden) => {
      const res = await apiRequest("POST", "/api/gardens", gardenData);
      return await res.json();
    },
    onSuccess: (newGarden: Garden) => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens"] });
      toast({
        title: "Garden created",
        description: `${newGarden.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create garden",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateGardenMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertGarden> }) => {
      const res = await apiRequest("PUT", `/api/gardens/${id}`, data);
      return await res.json();
    },
    onSuccess: (updatedGarden: Garden) => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens"] });
      toast({
        title: "Garden updated",
        description: `${updatedGarden.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update garden",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteGardenMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/gardens/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens"] });
      toast({
        title: "Garden deleted",
        description: "The garden has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete garden",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addCollaboratorMutation = useMutation({
    mutationFn: async ({ gardenId, userId }: { gardenId: number; userId: number }) => {
      const res = await apiRequest("POST", `/api/gardens/${gardenId}/collaborators`, { userId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens"] });
      toast({
        title: "Collaborator added",
        description: "The collaborator has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add collaborator",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async ({ gardenId, userId }: { gardenId: number; userId: number }) => {
      await apiRequest("DELETE", `/api/gardens/${gardenId}/collaborators/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens"] });
      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove collaborator",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <GardenContext.Provider
      value={{
        currentGarden,
        gardens,
        isLoading,
        error,
        setCurrentGarden,
        createGardenMutation,
        updateGardenMutation,
        deleteGardenMutation,
        addCollaboratorMutation,
        removeCollaboratorMutation,
      }}
    >
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error("useGarden must be used within a GardenProvider");
  }
  return context;
}