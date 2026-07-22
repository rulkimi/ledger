"use client";

import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ChatUI } from "../advisor/chat-ui";

export function SlideOverChat() {
  const pathname = usePathname();

  // Hide the floating button if we are already on the dedicated advisor page
  if (pathname === "/dashboard/advisor") {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-primary text-primary-foreground hover:scale-105"
            aria-label="Open Cento"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        }
      />
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-md p-0 flex flex-col sm:w-[450px]">
        <SheetHeader className="px-4 py-3 border-b sr-only">
          <SheetTitle>Cento</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col min-h-0 relative">
          <ChatUI />
        </div>
      </SheetContent>
    </Sheet>
  );
}
