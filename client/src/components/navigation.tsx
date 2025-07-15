import { Link, useLocation } from "wouter";
import { Sprout, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "@/components/user-menu";
import { GardenSelector } from "@/components/garden-selector";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/library", label: "Plant Library" },
    { href: "/locations", label: "Locations" },
    { href: "/timeline", label: "Calendar" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Sprout className="text-green-600 dark:text-green-400 text-2xl mr-3" />
              <h1 className="text-xl font-bold text-foreground">GardenIO</h1>
            </div>
            <nav className="hidden md:ml-8 md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium pb-4 px-1 border-b-2 transition-colors ${
                    isActive(item.href)
                      ? "text-green-600 dark:text-green-400 border-green-600 dark:border-green-400"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user && <GardenSelector />}
            {user && <UserMenu />}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`font-medium py-2 px-3 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex space-x-6 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-medium whitespace-nowrap pb-2 border-b-2 transition-colors ${
                isActive(item.href)
                  ? "text-garden-green border-garden-green"
                  : "text-soil-gray border-transparent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
