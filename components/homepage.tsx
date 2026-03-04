"use client";

import { CircleDot, Layers, BookOpen, ArrowRight } from "lucide-react";
import type { GameMode } from "@/lib/game-data";

interface HomepageProps {
  onSelectGame: (mode: GameMode) => void;
}

export function Homepage({ onSelectGame }: HomepageProps) {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl flex items-center gap-3 px-6 py-4">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight text-foreground font-mono">
            YDS Prep Platform
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 py-16 flex-1">
        <div className="max-w-2xl text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-mono text-balance">
            Master Your Vocabulary
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Practice YDS English vocabulary with interactive games. Choose your
            study mode and start building your word power.
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Wheel of Fortune Card */}
          <button
            onClick={() => onSelectGame("wheel")}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <CircleDot className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground font-mono mb-2">
              Wheel of Fortune
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Spin the wheel and test your vocabulary with multiple-choice
              questions. Answer correctly to remove words from play.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span>Start Playing</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Flashcards Card */}
          <button
            onClick={() => onSelectGame("flashcard")}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground font-mono mb-2">
              Flashcards
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Flip through cards to learn English-Turkish word pairs. Mark words
              you know to focus on the ones you need.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span>Start Learning</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        YDS Prep Platform - Practice makes perfect.
      </footer>
    </main>
  );
}
