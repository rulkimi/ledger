"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteSubscription } from "@/actions/subscription";
import { Trash2, Loader2 } from "lucide-react";
import { useSound } from "@/hooks/use-sound";

export function DeleteSubscriptionButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { play } = useSound();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteSubscription(id);
        play("success");
        window.dispatchEvent(new CustomEvent("cento-refresh"));
        setOpen(false);
      } catch (e) {
        play("error");
        setError("Failed to delete. Please try again.");
        console.error(e);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button
          aria-label={`Delete ${name}`}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors active:scale-[0.97]"
          onClick={() => play("click")}
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
            <Button type="button" variant="ghost" size="sm" onClick={() => { play("click"); setOpen(false); }} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleDelete}
              className="min-w-[90px]"
            >
              {isPending ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Deleting…</> : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
