import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlantingSchema, type InsertPlanting, type Plant, type Location } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useGarden } from "@/hooks/use-garden";
import { apiRequest } from "@/lib/queryClient";

interface PlantingFormProps {
  plants: Plant[];
  onSubmit: (data: InsertPlanting) => void;
  initialData?: Partial<InsertPlanting>;
  isLoading?: boolean;
}

export function PlantingForm({ plants, onSubmit, initialData, isLoading }: PlantingFormProps) {
  const { currentGarden } = useGarden();
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations", currentGarden?.id],
    enabled: !!currentGarden,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/locations?gardenId=${currentGarden!.id}`);
      return response.json();
    },
  });

  const form = useForm<InsertPlanting>({
    resolver: zodResolver(insertPlantingSchema),
    defaultValues: {
      plantId: initialData?.plantId || 0,
      location: initialData?.location || "",
      plantedDate: initialData?.plantedDate || format(new Date(), "yyyy-MM-dd"),
      quantity: initialData?.quantity || 1,
      notes: initialData?.notes || "",
      gardenId: currentGarden?.id || 0,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Planting" : "Add New Planting"}</CardTitle>
        <CardDescription>
          {initialData ? "Update the planting information" : "Record a new planting in your garden"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Variety</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plant..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plants.map((plant) => (
                          <SelectItem key={plant.id} value={plant.id.toString()}>
                            {plant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planting Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plantedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planting Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="Number of plants/seeds"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes about this planting..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading} className="bg-garden-green hover:bg-green-600">
                {isLoading ? "Saving..." : initialData ? "Update Planting" : "Add Planting"}
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
