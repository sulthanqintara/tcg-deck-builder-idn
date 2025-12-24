"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, LogIn, LayoutGrid, Plus, Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/", label: "Deck Builder", icon: Plus },
  { href: "/decks", label: "My Decks", icon: Layers },
  { href: "/login", label: "Login", icon: LogIn },
] as const;

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-card text-card-foreground">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tighter"
        >
          <LayoutGrid className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">TCG Builder</span>
          <span className="sm:hidden">TCG</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <ModeToggle />
          {NAV_LINKS.map((link, index) => (
            <div key={link.href} className="flex items-center gap-6">
              {index === NAV_LINKS.length - 1 && (
                <div className="h-4 w-px bg-border" />
              )}
              <Link
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-72">
            <SheetHeader className="border-b pb-4">
              <SheetTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                TCG Builder
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
