import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { insertPlantSchema, type InsertPlant, type Vendor } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, Link, X, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PlantFormProps {
  onSubmit: (data: InsertPlant, vendorIds: number[]) => void;
  initialData?: Partial<InsertPlant>;
  initialVendorIds?: number[];
  isLoading?: boolean;
}

export function PlantForm({ onSubmit, initialData, initialVendorIds = [], isLoading }: PlantFormProps) {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>(initialVendorIds);
  const { toast } = useToast();

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const form = useForm<InsertPlant>({
    resolver: zodResolver(insertPlantSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "vegetable",
      daysToSprout: initialData?.daysToSprout || 7,
      daysToHarvest: initialData?.daysToHarvest || 60,
      season: initialData?.season || "Spring",
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiRequest("POST", "/api/upload-image", formData);
      const result = await response.json();
      setUploadedImageUrl(result.imageUrl);
      form.setValue('imageUrl', result.imageUrl);
      toast({ title: "Success", description: "Image uploaded successfully!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Error", description: "Please select an image file.", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "Image must be smaller than 5MB.", variant: "destructive" });
        return;
      }
      handleFileUpload(file);
    }
  };

  const clearImage = () => {
    setUploadedImageUrl("");
    form.setValue('imageUrl', "");
  };

  const toggleVendor = (vendorId: number) => {
    setSelectedVendorIds(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const handleSubmit = (data: InsertPlant) => {
    onSubmit(data, selectedVendorIds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Plant" : "Add New Plant"}</CardTitle>
        <CardDescription>
          {initialData ? "Update the plant information" : "Add a new plant variety to your library"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tomato - Cherry" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vegetable">Vegetable</SelectItem>
                        <SelectItem value="herb">Herb</SelectItem>
                        <SelectItem value="fruit">Fruit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the plant variety, growing tips, and characteristics..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="daysToSprout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days to Sprout</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="30" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>Average days for seeds to germinate</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="daysToHarvest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days to Harvest</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="365" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>Days from planting to harvest</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Best Season</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                        <SelectItem value="Spring/Summer">Spring/Summer</SelectItem>
                        <SelectItem value="Spring/Fall">Spring/Fall</SelectItem>
                        <SelectItem value="Year Round">Year Round</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Vendor Association */}
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-1.5">
                <Store className="h-4 w-4" />
                Vendors (Optional)
              </FormLabel>
              {vendors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No vendors added yet. Go to the Vendors page to add suppliers first.
                </p>
              ) : (
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {vendors.map((vendor) => (
                    <label key={vendor.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded px-1 py-0.5">
                      <Checkbox
                        checked={selectedVendorIds.includes(vendor.id)}
                        onCheckedChange={() => toggleVendor(vendor.id)}
                      />
                      <span className="text-sm font-medium">{vendor.name}</span>
                      {vendor.website && (
                        <span className="text-xs text-muted-foreground truncate">{vendor.website}</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
              {selectedVendorIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedVendorIds.map(id => {
                    const v = vendors.find(v => v.id === id);
                    return v ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {v.name}
                        <button type="button" onClick={() => toggleVendor(id)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant Image (Optional)</FormLabel>
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url" className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        Image URL
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="url" className="space-y-2">
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Enter a URL to an image of the plant</FormDescription>
                    </TabsContent>
                    
                    <TabsContent value="upload" className="space-y-2">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground text-center">
                            <label htmlFor="image-upload" className="cursor-pointer hover:text-foreground">
                              <span className="font-medium text-primary">Click to upload</span> or drag and drop
                              <br />
                              PNG, JPG, GIF up to 5MB
                            </label>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isUploading}
                          />
                          {isUploading && <div className="text-sm text-muted-foreground">Uploading...</div>}
                        </div>
                      </div>
                      
                      {(uploadedImageUrl || field.value) && (
                        <div className="relative">
                          <img
                            src={uploadedImageUrl || field.value || ""}
                            alt="Plant preview"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading} className="bg-garden-green hover:bg-green-600">
                {isLoading ? "Saving..." : initialData ? "Update Plant" : "Add Plant"}
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
