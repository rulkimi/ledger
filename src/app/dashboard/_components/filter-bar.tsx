"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CATEGORIES = [
  "Entertainment", "Health", "Technology", "Auto", "Shopping",
  "Food", "Utilities", "Finance", "Education", "Travel", "Other",
];

export function FilterBar({ count }: { count: number }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const sort     = searchParams.get("sort")     ?? "date";
  const view     = searchParams.get("view")     ?? "original";

  const hasFilters = category !== "all" || sort !== "date" || view !== "original";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    const isDefault =
      (key === "category" && value === "all") ||
      (key === "sort"     && value === "date") ||
      (key === "view"     && value === "original");
    if (isDefault) params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Bill count — far left */}
      <span className="text-xs text-muted-foreground font-medium mr-auto tabular-nums">
        {count} bill{count !== 1 ? "s" : ""}
      </span>

      {/* View as — normalize amounts */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground hidden sm:inline">View as</span>
        <Select value={view} onValueChange={(v) => update("view", v ?? "original")}>
          <SelectTrigger className="h-8 text-xs w-auto min-w-[100px] border-border/50 bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="original">Original</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-border/60 hidden sm:block" />

      {/* Category */}
      <Select value={category} onValueChange={(v) => update("category", v ?? "all")}>
        <SelectTrigger className="h-8 text-xs w-auto min-w-[130px] border-border/50 bg-transparent">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sort} onValueChange={(v) => update("sort", v ?? "date")}>
        <SelectTrigger className="h-8 text-xs w-auto min-w-[120px] border-border/50 bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Due Date</SelectItem>
          <SelectItem value="cost">Highest Cost</SelectItem>
          <SelectItem value="name">Name A–Z</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          onClick={() => router.replace(pathname)}
        >
          <X className="h-3 w-3" /> Reset
        </Button>
      )}
    </div>
  );
}
