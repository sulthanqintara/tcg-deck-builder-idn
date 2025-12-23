"use client";

import Link from "next/link";
import { Layers, LogIn, LayoutGrid, Plus } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function Navbar() {
  return (
    <nav className="border-b bg-card text-card-foreground">
      <div className="flex items-center justify-between h-16 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tighter"
        >
          <LayoutGrid className="h-6 w-6 text-primary" />
          <span>TCG Builder</span>
        </Link>
        <div className="flex items-center gap-6">
          <ModeToggle />
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Deck Builder
          </Link>
          <Link
            href="/decks"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            My Decks
          </Link>
          <div className="h-4 w-px bg-border" />
          <Link
            href="/login"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
