"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

export function DashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category") || "all";

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4 p-6 border rounded-2xl bg-card shadow-sm">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Filter className="h-4 w-4 text-primary" /> Filter Dashboard
      </h3>
      <div className="space-y-2">
        <Label htmlFor="category" className="text-muted-foreground">Filter by Category</Label>
        <Select value={currentCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
            <SelectItem value="Health">Health</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Auto">Auto</SelectItem>
            <SelectItem value="Shopping">Shopping</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Utilities">Utilities</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
