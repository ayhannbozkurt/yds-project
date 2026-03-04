"use client";

import { useState, useCallback } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  X,
  RotateCcw,
  Trophy,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QuestionItem } from "@/lib/game-data";

interface FlashcardGameProps {
  initialQuestions: QuestionItem[];
  onBack: () => void;
  onHome: () => void;
}

export function FlashcardGame({
  initialQuestions,
  onBack,
  onHome,
}: FlashcardGameProps) {
  const [deck, setDeck] = useState<QuestionItem[]>(() =>
    shuffleArray([...initialQuestions])
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const totalCards = initialQuestions.length;

  const currentCard = deck[currentIndex] || null;
  const isComplete = deck.length === 0;
  const progress = ((totalCards - deck.length) / totalCards) * 100;

  function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const handleKnew = useCallback(() => {
    if (!currentCard) return;
    setKnownCount((c) => c + 1);
    const newDeck = deck.filter((q) => q.id !== currentCard.id);
    setDeck(newDeck);
    setCurrentIndex((prev) => (prev >= newDeck.length ? 0 : prev));
    setIsFlipped(false);
  }, [currentCard, deck]);

  const handleDidntKnow = useCallback(() => {
    if (!currentCard) return;
    // Move to next card (keep in deck)
    setCurrentIndex((prev) => (prev + 1 >= deck.length ? 0 : prev + 1));
    setIsFlipped(false);
  }, [currentCard, deck.length]);

  if (isComplete) {
    return (
      <main className="min-h-screen flex flex-col">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-3xl flex items-center gap-3 px-6 py-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground font-mono">
              YDS Prep
            </span>
          </div>
        </header>
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mb-6">
            <Trophy className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-mono mb-2">
            All Cards Learned!
          </h1>
          <p className="text-muted-foreground mb-2">
            {"You've mastered all "}{totalCards}{" flashcards."}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Known on first try: {knownCount}/{totalCards}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Practice Again
            </Button>
            <Button onClick={onHome}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {deck.length} {"cards remaining"}
            </span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="mx-auto max-w-md w-full px-6 pt-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>
            {totalCards - deck.length}/{totalCards} learned
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Card with flip animation */}
        <div
          className="w-full max-w-sm cursor-pointer mb-8"
          style={{ perspective: "1000px" }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              height: "280px",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-xl border-2 border-border bg-card shadow-lg flex flex-col items-center justify-center p-8"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                English
              </p>
              <h2 className="text-3xl font-bold text-foreground font-mono text-center">
                {currentCard?.question}
              </h2>
              <p className="mt-6 text-xs text-muted-foreground">
                Tap to flip
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-xl border-2 border-primary/30 bg-primary/5 shadow-lg flex flex-col items-center justify-center p-8"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-xs uppercase tracking-wider text-primary mb-4">
                Turkish Meaning
              </p>
              <h2 className="text-2xl font-bold text-foreground font-mono text-center">
                {currentCard?.meaning}
              </h2>
              <p className="mt-6 text-xs text-muted-foreground">
                Tap to flip back
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleDidntKnow}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="h-14 w-14 rounded-full border-2 border-destructive/30 bg-destructive/5 flex items-center justify-center transition-all group-hover:bg-destructive/10 group-hover:border-destructive/50">
              <X className="h-6 w-6 text-destructive" />
            </div>
            <span className="text-xs text-muted-foreground">
              {"Didn't Know"}
            </span>
          </button>

          <button
            onClick={handleKnew}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="h-14 w-14 rounded-full border-2 border-success/30 bg-success/5 flex items-center justify-center transition-all group-hover:bg-success/10 group-hover:border-success/50">
              <Check className="h-6 w-6 text-success" />
            </div>
            <span className="text-xs text-muted-foreground">I Knew It</span>
          </button>
        </div>

        {/* Card counter */}
        <p className="mt-6 text-sm text-muted-foreground">
          {"Card "}{currentIndex + 1}{" of "}{deck.length}
        </p>
      </section>
    </main>
  );
}
