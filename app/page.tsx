"use client";

import { useState, useCallback } from "react";
import { Homepage } from "@/components/homepage";
import { SetupPage } from "@/components/setup-page";
import { WheelGame } from "@/components/wheel-game";
import { SimpleWheelGame } from "@/components/simple-wheel-game";
import { FlashcardGame } from "@/components/flashcard-game";
import { YdsQuizGame } from "@/components/yds-quiz-game";
import type { GameMode, AppView, QuestionItem, WheelMode, SimpleWheelItem } from "@/lib/game-data";

type ExtendedView = AppView | "quiz";

export default function Page() {
  const [view, setView] = useState<ExtendedView>("home");
  const [gameMode, setGameMode] = useState<GameMode>("wheel");
  const [wheelMode, setWheelMode] = useState<WheelMode>("simple");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [simpleItems, setSimpleItems] = useState<SimpleWheelItem[]>([]);

  const handleSelectGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setView("setup");
  }, []);

  const handleStartGame = useCallback((q: QuestionItem[]) => {
    setQuestions(q);
    setView("game");
  }, []);

  const handleStartSimpleGame = useCallback((items: SimpleWheelItem[], mode: WheelMode) => {
    setSimpleItems(items);
    setWheelMode(mode);
    setView("game");
  }, []);

  const handleBackToSetup = useCallback(() => {
    setView("setup");
  }, []);

  const handleHome = useCallback(() => {
    setView("home");
    setQuestions([]);
    setSimpleItems([]);
  }, []);

  const handleStartQuiz = useCallback(() => {
    setView("quiz");
  }, []);

  if (view === "home") {
    return <Homepage onSelectGame={handleSelectGame} onStartQuiz={handleStartQuiz} />;
  }

  if (view === "quiz") {
    return <YdsQuizGame onHome={handleHome} />;
  }

  if (view === "setup") {
    return (
      <SetupPage
        gameMode={gameMode}
        onBack={handleHome}
        onStart={handleStartGame}
        onStartSimple={handleStartSimpleGame}
      />
    );
  }

  if (view === "game") {
    if (gameMode === "wheel") {
      if (wheelMode === "simple") {
        return (
          <SimpleWheelGame
            initialItems={simpleItems}
            onBack={handleBackToSetup}
            onHome={handleHome}
          />
        );
      }
      return (
        <WheelGame
          initialQuestions={questions}
          onBack={handleBackToSetup}
          onHome={handleHome}
        />
      );
    }
    return (
      <FlashcardGame
        initialQuestions={questions}
        onBack={handleBackToSetup}
        onHome={handleHome}
      />
    );
  }

  return null;
}
