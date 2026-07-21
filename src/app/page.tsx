import { auth, signIn, signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-background">
      <div className="max-w-3xl w-full flex flex-col items-center gap-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-center">
          Ledger
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-center max-w-xl">
          Your accurate cash-flow forecasting and prorated budgeting platform.
        </p>
        
        {session?.user ? (
          <div className="flex flex-col items-center gap-6 mt-8 p-8 border rounded-xl shadow-sm bg-card w-full max-w-md">
            <p className="text-lg font-medium text-center">
              Welcome back, {session.user.name || session.user.email}!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/dashboard" className="w-full">
                <Button size="lg" className="w-full">Go to Dashboard</Button>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
                className="w-full"
              >
                <Button size="lg" variant="outline" type="submit" className="w-full">Sign Out</Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="mt-8 p-8 border rounded-xl shadow-sm bg-card w-full max-w-sm flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold mb-2">Get Started</h2>
            <form
              action={async () => {
                "use server";
                await signIn();
              }}
              className="w-full"
            >
              <Button size="lg" type="submit" className="w-full">
                Log In
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
