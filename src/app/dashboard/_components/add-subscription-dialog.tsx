"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSubscription } from "@/actions/subscription";
import { Plus, Loader2 } from "lucide-react";

// Define the enum locally so we don't import Prisma Client into the browser bundle!
enum BillingFrequency {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  BI_ANNUALLY = "BI_ANNUALLY",
  YEARLY = "YEARLY"
}

export function AddSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState<BillingFrequency>(BillingFrequency.MONTHLY);

  async function action(formData: FormData) {
    setLoading(true);
    try {
      await createSubscription({
        name: formData.get("name") as string,
        cost: Number(formData.get("cost")),
        billingFrequency: frequency as any,
        startDate: new Date(formData.get("startDate") as string),
        category: formData.get("category") as string,
      });
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="gap-2 shadow-md hover:shadow-lg transition-all" size="lg">
          <Plus className="h-5 w-5" /> Add Subscription
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Subscription</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subscription Name</Label>
            <Input id="name" name="name" required placeholder="e.g., Netflix, Gym, Internet..." className="bg-muted/50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input id="cost" name="cost" type="number" step="0.01" required placeholder="15.99" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Billing Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as BillingFrequency)}>
                <SelectTrigger id="frequency" className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BillingFrequency.WEEKLY}>Weekly</SelectItem>
                  <SelectItem value={BillingFrequency.MONTHLY}>Monthly</SelectItem>
                  <SelectItem value={BillingFrequency.BI_ANNUALLY}>Bi-Annually</SelectItem>
                  <SelectItem value={BillingFrequency.YEARLY}>Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">First Payment / Start Date</Label>
            <Input id="startDate" name="startDate" type="date" required className="bg-muted/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input id="category" name="category" placeholder="e.g., Entertainment, Health..." className="bg-muted/50" />
          </div>

          <div className="pt-6 flex justify-end">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[120px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : "Save Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
