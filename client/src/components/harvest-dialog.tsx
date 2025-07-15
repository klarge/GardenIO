import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { harvestPlantingSchema, HarvestPlanting, PlantingWithPlant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HarvestDialogProps {
  planting: PlantingWithPlant;
  isOpen: boolean;
  onClose: () => void;
}

export function HarvestDialog({ planting, isOpen, onClose }: HarvestDialogProps) {
  const { toast } = useToast();

  const form = useForm<HarvestPlanting>({
    resolver: zodResolver(harvestPlantingSchema),
    defaultValues: {
      harvestedDate: format(new Date(), "yyyy-MM-dd"),
      harvestedQuantity: planting.quantity,
      harvestedNotes: "",
    },
  });

  const harvestMutation = useMutation({
    mutationFn: async (data: HarvestPlanting) => {
      const res = await apiRequest("POST", `/api/plantings/${planting.id}/harvest`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plantings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Harvest recorded",
        description: `${planting.plant.name} has been marked as harvested.`,
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record harvest",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HarvestPlanting) => {
    harvestMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Harvest</DialogTitle>
          <DialogDescription>
            Record the harvest details for {planting.plant.name} planted on {format(new Date(planting.plantedDate), "MMM d, yyyy")}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="harvestedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Harvest Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="harvestedQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvested Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter harvested quantity"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="harvestedNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any notes about the harvest..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={harvestMutation.isPending}>
                {harvestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Harvest
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}