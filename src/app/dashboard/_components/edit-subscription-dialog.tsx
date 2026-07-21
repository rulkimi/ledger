"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateSubscription } from "@/actions/subscription";
import { Pencil, Loader2 } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  "Entertainment", "Health", "Technology", "Auto", "Shopping",
  "Food", "Utilities", "Finance", "Education", "Travel", "Other",
];

const BILLING_FREQUENCIES = {
  WEEKLY:      "WEEKLY",
  MONTHLY:     "MONTHLY",
  BI_ANNUALLY: "BI_ANNUALLY",
  YEARLY:      "YEARLY",
} as const;
type BillingFrequency = (typeof BILLING_FREQUENCIES)[keyof typeof BILLING_FREQUENCIES];

interface Props {
  id: string;
  defaultValues: {
    name: string;
    cost: number;
    billingFrequency: BillingFrequency;
    startDate: Date;
    category?: string | null;
    notes?: string | null;
  };
}

export function EditSubscriptionDialog({ id, defaultValues }: Props) {
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [frequency, setFrequency] = useState<BillingFrequency>(defaultValues.billingFrequency);
  const [category, setCategory]   = useState<string>(defaultValues.category ?? "");

  async function action(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await updateSubscription(id, {
        name:             formData.get("name") as string,
        cost:             Number(formData.get("cost")),
        billingFrequency: frequency as any,
        startDate:        new Date(formData.get("startDate") as string),
        category:         category || undefined,
        notes:            (formData.get("notes") as string) || undefined,
      });
      setOpen(false);
    } catch (e) {
      setError("Failed to update. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button
          aria-label={`Edit ${defaultValues.name}`}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      } />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Edit Subscription</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-1">
          {error && (
            <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</Label>
            <Input
              id="edit-name"
              name="name"
              required
              defaultValue={defaultValues.name}
              className="bg-muted/30 border-border/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-cost" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount (RM)</Label>
              <Input
                id="edit-cost"
                name="cost"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue={defaultValues.cost}
                className="bg-muted/30 border-border/60 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-frequency" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency((v ?? "MONTHLY") as BillingFrequency)}>
                <SelectTrigger id="edit-frequency" className="bg-muted/30 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="BI_ANNUALLY">Bi-Annually</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-startDate" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Payment Date</Label>
            <Input
              id="edit-startDate"
              name="startDate"
              type="date"
              required
              defaultValue={format(new Date(defaultValues.startDate), "yyyy-MM-dd")}
              className="bg-muted/30 border-border/60"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-category" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger id="edit-category" className="bg-muted/30 border-border/60">
                <SelectValue placeholder="Select a category…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Notes <span className="normal-case font-normal">(optional)</span>
            </Label>
            <Input
              id="edit-notes"
              name="notes"
              placeholder="e.g. Family plan, shared…"
              defaultValue={defaultValues.notes ?? ""}
              className="bg-muted/30 border-border/60"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="min-w-[90px]">
              {loading ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</> : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
