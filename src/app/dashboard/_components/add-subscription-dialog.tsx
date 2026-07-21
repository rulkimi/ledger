"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSubscription } from "@/actions/subscription";
import { Plus, Loader2, DollarSign } from "lucide-react";

// Local enum mirrors Prisma — keeps Prisma out of the browser bundle
const BILLING_FREQUENCIES = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  BI_ANNUALLY: "BI_ANNUALLY",
  YEARLY: "YEARLY",
} as const;
type BillingFrequency = (typeof BILLING_FREQUENCIES)[keyof typeof BILLING_FREQUENCIES];

const CATEGORIES = [
  "Entertainment", "Health", "Technology", "Auto", "Shopping",
  "Food", "Utilities", "Finance", "Education", "Travel", "Other",
];

export function AddSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState<BillingFrequency>("MONTHLY");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await createSubscription({
        name: formData.get("name") as string,
        cost: Number(formData.get("cost")),
        billingFrequency: frequency as any,
        startDate: new Date(formData.get("startDate") as string),
        category: category || undefined,
        notes: (formData.get("notes") as string) || undefined,
      });
      setOpen(false);
      setFrequency("MONTHLY");
      setCategory("");
    } catch (e) {
      setError("Failed to save subscription. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all font-semibold" size="default">
          <Plus className="h-4 w-4" /> Add Subscription
        </Button>
      } />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">New Subscription</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="add-name" className="text-sm font-medium">Name</Label>
            <Input id="add-name" name="name" required placeholder="Netflix, Spotify, Gym…" className="bg-muted/40" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-cost" className="text-sm font-medium">Amount (RM)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input id="add-cost" name="cost" type="number" step="0.01" min="0.01" required placeholder="0.00" className="pl-7 bg-muted/40 font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-frequency" className="text-sm font-medium">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as BillingFrequency)}>
                <SelectTrigger id="add-frequency" className="bg-muted/40">
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
            <Label htmlFor="add-startDate" className="text-sm font-medium">First Payment Date</Label>
            <Input id="add-startDate" name="startDate" type="date" required className="bg-muted/40" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-category" className="text-sm font-medium">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="add-category" className="bg-muted/40">
                <SelectValue placeholder="Select a category…" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-notes" className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="add-notes" name="notes" placeholder="e.g. Family plan, shared with spouse…" className="bg-muted/40" />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
