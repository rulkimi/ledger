"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteSubscription } from "@/actions/subscription";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteSubscriptionButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await deleteSubscription(id);
      setOpen(false);
    } catch (e) {
      setError("Failed to delete. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button
          aria-label={`Delete ${name}`}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors active:scale-[0.97]"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      } />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Delete Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {error && (
            <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground font-semibold">&quot;{name}&quot;</strong>? This action cannot be undone.
          </p>

          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={loading}
              onClick={handleDelete}
              className="min-w-[90px]"
            >
              {loading ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Deleting…</> : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
