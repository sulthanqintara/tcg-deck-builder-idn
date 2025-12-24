import packageJson from "@/package.json";
import { FaGithub } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2 text-xs text-muted-foreground">
        <a
          href="https://github.com/sulthanqintara/tcg-deck-builder-idn"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors flex gap-2"
          aria-label="GitHub Repository"
        >
          <span className="opacity-80">Got any suggestion?</span>
          <FaGithub className="h-4 w-4" />
        </a>
        <span className="text-accent-foreground">•</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
        </span>
        <span className="font-medium">v{packageJson.version}</span>
        <span className="text-accent-foreground">•</span>
        <span className="opacity-80">
          This project is currently in alpha stage. Absolutely will subject to
          change!
        </span>
      </div>
    </footer>
  );
}
