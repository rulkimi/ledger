"use client";

import { deleteSubscription } from "@/actions/subscription";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export function DeleteSubscriptionButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${name}"?`)) return;
    setLoading(true);
    try {
      await deleteSubscription(id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      aria-label={`Delete ${name}`}
      className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors disabled:opacity-50"
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Trash2 className="h-3.5 w-3.5" />
      }
    </button>
  );
}
