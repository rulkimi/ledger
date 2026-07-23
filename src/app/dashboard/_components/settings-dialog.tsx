"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Loader2, LogOut, Monitor, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { updateProfile } from "@/actions/user";
import { logout } from "@/actions/auth";
import { useTheme } from "next-themes";
import { useSound } from "@/hooks/use-sound";

export function SettingsDialog({ 
  user 
}: { 
  user: { name?: string | null; email?: string | null; monthlyIncome?: number | null; centoPrompt?: string | null; centoRoastLevel?: string } 
}) {
  const { theme, setTheme } = useTheme();
  const { play } = useSound();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [income, setIncome] = useState(user.monthlyIncome ? user.monthlyIncome.toString() : "");
  const [centoPrompt, setCentoPrompt] = useState(user.centoPrompt || "");
  const [centoRoastLevel, setCentoRoastLevel] = useState(user.centoRoastLevel || "MEDIUM");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const parsedIncome = parseFloat(income);
      await updateProfile({
        name,
        email,
        income: isNaN(parsedIncome) ? null : parsedIncome,
        centoPrompt: centoPrompt.trim() === "" ? null : centoPrompt,
        centoRoastLevel,
        currentPassword: currentPassword ? currentPassword : undefined,
        password: password ? password : undefined
      });
      play("success");
      window.dispatchEvent(new CustomEvent("cento-refresh"));
      setOpen(false);
      setCurrentPassword("");
      setPassword(""); 
    } catch (err: any) {
      play("error");
      console.error(err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full inline-flex items-center justify-center transition-colors"><Settings className="h-4 w-4" /><span className="sr-only">Settings</span></button>} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-2">
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <p className="text-xs text-muted-foreground">Note: We don&apos;t verify emails right now.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="income">Monthly Income</Label>
            <Input id="income" type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. 5000" />
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
            <Label>Cento&apos;s Roast Level</Label>
            <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50">
              {['ENABLER', 'MEDIUM', 'ROASTER'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    if (centoRoastLevel !== level) play("pop");
                    setCentoRoastLevel(level);
                  }}
                  className={`flex-1 text-[10px] sm:text-xs font-medium py-1.5 px-2 rounded-md transition-colors ${
                    centoRoastLevel === level ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {level === 'ENABLER' ? 'Enabler' : level === 'MEDIUM' ? 'Medium' : 'Rage Baiter'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground px-1">
              {centoRoastLevel === 'ENABLER' && "Validates your spending but keeps you financially responsible."}
              {centoRoastLevel === 'MEDIUM' && "Balances realistic advice with a bit of sass."}
              {centoRoastLevel === 'ROASTER' && "No mercy. Prepare to be absolutely cooked for your choices."}
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-border/40">
            <Label>Cento&apos;s Custom Instructions (Optional)</Label>
            <textarea 
              id="centoPrompt" 
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={centoPrompt} 
              onChange={(e) => setCentoPrompt(e.target.value)} 
              placeholder="e.g. Talk to me like a pirate, or always mention my savings goals."
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
            <Label>Appearance</Label>
            {mounted && (
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`flex-1 h-8 gap-2 rounded-md ${theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => { if (theme !== 'light') play("pop"); setTheme("light"); }}
                >
                  <Sun className="h-4 w-4" />
                  <span className="text-xs font-medium">Light</span>
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`flex-1 h-8 gap-2 rounded-md ${theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => { if (theme !== 'dark') play("pop"); setTheme("dark"); }}
                >
                  <Moon className="h-4 w-4" />
                  <span className="text-xs font-medium">Dark</span>
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`flex-1 h-8 gap-2 rounded-md ${theme === 'system' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => { if (theme !== 'system') play("pop"); setTheme("system"); }}
                >
                  <Monitor className="h-4 w-4" />
                  <span className="text-xs font-medium">System</span>
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2 pt-2 border-t border-border/40">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input id="current-password" type={showCurrentPassword ? "text" : "password"} autoComplete="new-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to change password" />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="px-3 text-destructive hover:bg-destructive/10 hover:text-destructive" 
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
