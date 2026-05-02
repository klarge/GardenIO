import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Store, Globe, Truck, ShoppingBag, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertVendorSchema, type Vendor, type InsertVendor } from "@shared/schema";

const VENDOR_CATEGORIES = [
  { value: "seeds", label: "Seeds" },
  { value: "vegetables", label: "Vegetables" },
  { value: "herbs", label: "Herbs" },
  { value: "fruits", label: "Fruits" },
  { value: "general", label: "General / All Plants" },
  { value: "specialty", label: "Specialty" },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "seeds": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "vegetables": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "herbs": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "fruits": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "specialty": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  }
};

function VendorForm({ onSubmit, initialData, isLoading, onCancel }: {
  onSubmit: (data: InsertVendor) => void;
  initialData?: Vendor;
  isLoading?: boolean;
  onCancel: () => void;
}) {
  const form = useForm<InsertVendor>({
    resolver: zodResolver(insertVendorSchema),
    defaultValues: {
      name: initialData?.name || "",
      website: initialData?.website || "",
      address: initialData?.address || "",
      category: initialData?.category || "general",
      offersShipping: initialData?.offersShipping ?? false,
      offersPickup: initialData?.offersPickup ?? false,
      notes: initialData?.notes || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Baker Creek Seeds" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plant Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VENDOR_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, City, State ZIP" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-6">
          <FormField
            control={form.control}
            name="offersShipping"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal flex items-center gap-1">
                  <Truck className="h-4 w-4" /> Ships orders
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="offersPickup"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4" /> Local pickup
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes about this vendor..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isLoading} className="bg-garden-green hover:bg-green-600">
            {isLoading ? "Saving..." : initialData ? "Update Vendor" : "Add Vendor"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Form>
  );
}

export default function Vendors() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertVendor) => {
      const res = await apiRequest("POST", "/api/vendors", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      setIsAddDialogOpen(false);
      toast({ title: "Success", description: "Vendor added successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to add vendor", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertVendor> }) => {
      const res = await apiRequest("PUT", `/api/vendors/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      setEditingVendor(null);
      toast({ title: "Success", description: "Vendor updated successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update vendor", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      toast({ title: "Success", description: "Vendor deleted successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete vendor", variant: "destructive" }),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Vendors</h2>
          <p className="text-muted-foreground">Manage seed and plant suppliers you buy from</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0 bg-garden-green hover:bg-green-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <VendorForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vendors added yet. Add your first supplier to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Store className="h-5 w-5 text-garden-green shrink-0" />
                    <CardTitle className="text-base truncate">{vendor.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setEditingVendor(vendor)} className="text-muted-foreground hover:text-foreground h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{vendor.name}"? Plant associations with this vendor will also be removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(vendor.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={getCategoryColor(vendor.category)}>
                  {VENDOR_CATEGORIES.find(c => c.value === vendor.category)?.label || vendor.category}
                </Badge>

                {vendor.website && (
                  <a
                    href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    {vendor.website}
                  </a>
                )}

                {vendor.address && (
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{vendor.address}</span>
                  </div>
                )}

                <div className="flex gap-3 text-sm text-muted-foreground">
                  {vendor.offersShipping && (
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-green-600" /> Ships
                    </span>
                  )}
                  {vendor.offersPickup && (
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5 text-green-600" /> Pickup
                    </span>
                  )}
                  {!vendor.offersShipping && !vendor.offersPickup && (
                    <span className="text-muted-foreground/60 text-xs">No fulfillment info</span>
                  )}
                </div>

                {vendor.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{vendor.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingVendor} onOpenChange={() => setEditingVendor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          {editingVendor && (
            <VendorForm
              initialData={editingVendor}
              onSubmit={(data) => updateMutation.mutate({ id: editingVendor.id, data })}
              isLoading={updateMutation.isPending}
              onCancel={() => setEditingVendor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
