import { useState } from "react";
import { useGarden } from "@/hooks/use-garden";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertGardenSchema, InsertGarden } from "@shared/schema";
import { ChevronDown, Plus, Sprout } from "lucide-react";

export function GardenSelector() {
  const { currentGarden, gardens, setCurrentGarden, createGardenMutation } = useGarden();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<InsertGarden>({
    resolver: zodResolver(insertGardenSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: InsertGarden) => {
    createGardenMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        form.reset();
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Sprout className="h-4 w-4 text-muted-foreground" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <span className="font-medium">
              {currentGarden ? currentGarden.name : "Select Garden"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Switch Garden</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {gardens.map((garden) => (
            <DropdownMenuItem
              key={garden.id}
              onClick={() => setCurrentGarden(garden)}
              className={currentGarden?.id === garden.id ? "bg-accent" : ""}
            >
              <div className="flex flex-col">
                <span className="font-medium">{garden.name}</span>
                {garden.description && (
                  <span className="text-sm text-muted-foreground truncate">
                    {garden.description}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Garden
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Garden</DialogTitle>
                <DialogDescription>
                  Add a new garden to organize your plants and locations.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Garden Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Home Garden, Cottage Garden" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your garden location and characteristics"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createGardenMutation.isPending}
                    >
                      {createGardenMutation.isPending ? "Creating..." : "Create Garden"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}