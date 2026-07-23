"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

import { SUBSCRIPTION_CATEGORIES as CATEGORIES } from "@/lib/constants";

export function DashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? "date";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === "all" || value === "date") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const hasFilters = category !== "all" || sort !== "date";

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-5 sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters & Sorting
        </h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
            onClick={() => router.replace(pathname)}
          >
            <X className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Category</Label>
        <Select value={category} onValueChange={(v) => update("category", v ?? "all")}>
          <SelectTrigger className="w-full h-9 text-sm">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sort By</Label>
        <Select value={sort} onValueChange={(v) => update("sort", v ?? "date")}>
          <SelectTrigger className="w-full h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Nearest Due Date</SelectItem>
            <SelectItem value="cost">Highest Cost</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="pt-2 flex flex-wrap gap-1.5">
          {category !== "all" && (
            <Badge variant="secondary" className="text-xs gap-1">
              {category}
              <button onClick={() => update("category", "all")} className="hover:text-destructive ml-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
          {sort !== "date" && (
            <Badge variant="secondary" className="text-xs gap-1">
              Sort: {sort}
              <button onClick={() => update("sort", "date")} className="hover:text-destructive ml-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
