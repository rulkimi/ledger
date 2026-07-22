"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSubscription } from "@/actions/subscription";
import { Plus, Loader2 } from "lucide-react";
import type { BillingFrequency as ServerBillingFrequency } from "@/generated/prisma/client";
import { FREQUENCY_LABEL } from "@/lib/subscription-utils";

const BILLING_FREQUENCIES = {
  WEEKLY:      "WEEKLY",
  MONTHLY:     "MONTHLY",
  BI_ANNUALLY: "BI_ANNUALLY",
  YEARLY:      "YEARLY",
  ONE_TIME:    "ONE_TIME",
} as const;
type BillingFrequency = (typeof BILLING_FREQUENCIES)[keyof typeof BILLING_FREQUENCIES];

const CATEGORIES = [
  "Entertainment", "Health", "Technology", "Auto", "Shopping",
  "Food", "Utilities", "Finance", "Education", "Travel", "Other",
];

export function AddSubscriptionDialog() {
  const router = useRouter();
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [frequency, setFrequency] = useState<BillingFrequency>("MONTHLY");
  const [category, setCategory]   = useState("none");
  const [error, setError]         = useState<string | null>(null);

  function resetForm() {
    setFrequency("MONTHLY");
    setCategory("none");
    setError(null);
  }

  async function action(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await createSubscription({
        name:             formData.get("name") as string,
        cost:             Number(formData.get("cost")),
        billingFrequency: frequency as ServerBillingFrequency,
        startDate:        new Date(formData.get("startDate") as string),
        endDate:          frequency === "ONE_TIME" ? undefined : (formData.get("endDate") ? new Date(formData.get("endDate") as string) : undefined),
        category:         category !== "none" ? category : undefined,
        notes:            (formData.get("notes") as string) || undefined,
      });
      setOpen(false);
      resetForm();
      // Always navigate to Bills after adding so the user can see their new entry
      router.push("/dashboard/bills");
    } catch (e) {
      setError("Failed to save. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger render={
        <Button size="sm" className="gap-1.5 font-medium">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      } />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">New Subscription</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-1">
          {error && (
            <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="add-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</Label>
            <Input id="add-name" name="name" required placeholder="Netflix, Spotify, Gym…" className="bg-muted/30" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-cost" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</Label>
              <Input id="add-cost" name="cost" type="number" step="0.01" min="0.01" required placeholder="0.00" className="bg-muted/30 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-frequency" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency((v ?? "MONTHLY") as BillingFrequency)}>
                <SelectTrigger id="add-frequency" className="bg-muted/30 w-full">
                  <SelectValue>
                    {FREQUENCY_LABEL[frequency]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="BI_ANNUALLY">Bi-Annually</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="ONE_TIME">One-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={frequency === "ONE_TIME" ? "grid grid-cols-1" : "grid grid-cols-2 gap-4"}>
            <div className="space-y-1.5">
              <Label htmlFor="add-startDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {frequency === "ONE_TIME" ? "Payment Date (Planned)" : "Start Date"}
              </Label>
              <Input id="add-startDate" name="startDate" type="date" required className="bg-muted/30" />
            </div>
            {frequency !== "ONE_TIME" && (
              <div className="space-y-1.5">
                <Label htmlFor="add-endDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date (Optional)</Label>
                <Input id="add-endDate" name="endDate" type="date" className="bg-muted/30" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-category" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "none")}>
              <SelectTrigger id="add-category" className="bg-muted/30 w-full">
                <SelectValue placeholder="Select a category…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-notes" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Notes <span className="normal-case font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input id="add-notes" name="notes" placeholder="e.g. Family plan, shared…" className="bg-muted/30" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={loading} className="min-w-[130px]">
              {loading
                ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</>
                : "Save & View Bills"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
