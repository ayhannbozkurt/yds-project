"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, BookOpen, RotateCcw, Trophy, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuestionItem } from "@/lib/game-data";
import { generateWheelColors } from "@/lib/game-data";

interface WheelGameProps {
  initialQuestions: QuestionItem[];
  onBack: () => void;
  onHome: () => void;
}

export function WheelGame({ initialQuestions, onBack, onHome }: WheelGameProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [answerState, setAnswerState] = useState<"none" | "correct" | "wrong">("none");
  const [rotation, setRotation] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const wheelRef = useRef<SVGSVGElement>(null);
  const totalQuestions = initialQuestions.length;

  // Dynamically generate colors based on current question count
  const wheelColors = useMemo(() => generateWheelColors(questions.length), [questions.length]);

  const isComplete = questions.length === 0;

  const spin = useCallback(() => {
    if (isSpinning || questions.length === 0) return;

    setSelectedQuestion(null);
    setAnswerState("none");
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * questions.length);
    const segmentAngle = 360 / questions.length;
    const targetAngle = segmentAngle * randomIndex + segmentAngle / 2;
    const spins = 5 + Math.random() * 3;
    const desiredMod = ((270 - targetAngle) % 360 + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    let delta = desiredMod - currentMod;
    if (delta < 0) delta += 360;
    const finalRotation = rotation + spins * 360 + delta;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedQuestion(questions[randomIndex]);
    }, 4000);
  }, [isSpinning, questions, rotation]);

  function handleAnswer(optionIndex: number) {
    if (!selectedQuestion || answerState !== "none") return;

    if (optionIndex === selectedQuestion.correctAnswer) {
      setAnswerState("correct");
      setCorrectCount((c) => c + 1);
      setTimeout(() => {
        setQuestions((prev) => prev.filter((q) => q.id !== selectedQuestion.id));
      }, 1200);
    } else {
      setAnswerState("wrong");
    }
  }

  const renderWheel = () => {
    if (questions.length === 0) return null;
    const size = 340;
    const center = size / 2;
    const radius = size / 2 - 10;
    const segmentAngle = 360 / questions.length;

    return (
      <svg
        ref={wheelRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transition-transform duration-[4000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {questions.map((q, i) => {
          const startAngle = (i * segmentAngle * Math.PI) / 180;
          const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180;
          const x1 = center + radius * Math.cos(startAngle);
          const y1 = center + radius * Math.sin(startAngle);
          const x2 = center + radius * Math.cos(endAngle);
          const y2 = center + radius * Math.sin(endAngle);
          const largeArc = segmentAngle > 180 ? 1 : 0;
          const color = wheelColors[i];

          const midAngle = ((i + 0.5) * segmentAngle * Math.PI) / 180;
          const textRadius = radius * 0.62;
          const textX = center + textRadius * Math.cos(midAngle);
          const textY = center + textRadius * Math.sin(midAngle);
          const textRotation = (i + 0.5) * segmentAngle;

          return (
            <g key={q.id}>
              <path
                d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={textX}
                y={textY}
                fill="oklch(0.20 0.02 260)"
                fontSize={questions.length > 10 ? "8" : questions.length > 6 ? "9.5" : "11"}
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
              >
                {q.question.length > 10
                  ? q.question.slice(0, 9) + "\u2026"
                  : q.question}
              </text>
            </g>
          );
        })}
        {/* Outer ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="oklch(0.30 0.02 260)"
          strokeWidth="3"
        />
        {/* Center decoration */}
        <circle cx={center} cy={center} r="22" fill="oklch(0.20 0.02 260)" />
        <circle cx={center} cy={center} r="17" fill="white" />
        <circle cx={center} cy={center} r="6" fill="oklch(0.20 0.02 260)" />
      </svg>
    );
  };

  if (isComplete) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
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
            Congratulations!
          </h1>
          <p className="text-muted-foreground mb-2">
            {"You answered all "}{totalQuestions}{" questions correctly."}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {"Score: "}{correctCount}{"/"}{totalQuestions}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
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
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {questions.length}{" remaining"}
            </span>
            <span className="text-sm font-medium text-foreground">
              {correctCount}{"/"}{totalQuestions}
            </span>
          </div>
        </div>
      </header>

      {/* Game Area */}
      <section className="flex-1 flex flex-col items-center px-6 py-8">
        {/* Wheel */}
        <div className="relative mb-8">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderTop: "24px solid oklch(0.20 0.02 260)",
              }}
            />
          </div>
          <div className="rounded-full shadow-2xl shadow-primary/10">
            {renderWheel()}
          </div>
        </div>

        {/* Spin Button */}
        {!selectedQuestion && (
          <Button
            size="lg"
            className="text-base font-semibold px-12 mb-8"
            onClick={spin}
            disabled={isSpinning}
          >
            {isSpinning ? "Spinning..." : "Spin the Wheel"}
          </Button>
        )}

        {/* Question & Options */}
        {selectedQuestion && (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-xl border border-border bg-card p-6 text-center shadow-lg">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                What does this word mean?
              </p>
              <h2 className="text-2xl font-bold text-foreground font-mono mb-6">
                {selectedQuestion.question}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {selectedQuestion.options.map((option, i) => {
                  let btnClass =
                    "rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:border-primary/50 hover:bg-primary/5";

                  if (answerState !== "none") {
                    if (i === selectedQuestion.correctAnswer) {
                      btnClass =
                        "rounded-lg border-2 border-success bg-success/10 px-4 py-3 text-sm font-medium text-foreground";
                    } else if (
                      answerState === "wrong" &&
                      i !== selectedQuestion.correctAnswer
                    ) {
                      btnClass =
                        "rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground opacity-50";
                    }
                  }

                  return (
                    <button
                      key={i}
                      className={btnClass}
                      onClick={() => handleAnswer(i)}
                      disabled={answerState !== "none"}
                    >
                      <span className="text-muted-foreground mr-1">
                        {String.fromCharCode(65 + i)}.
                      </span>{" "}
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {answerState === "correct" && (
                <div className="mt-4 rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-sm text-foreground animate-in fade-in duration-300">
                  Correct! The word has been removed from the wheel.
                </div>
              )}
              {answerState === "wrong" && (
                <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-foreground animate-in fade-in duration-300">
                  {"Wrong! The correct answer is: "}
                  <strong>
                    {selectedQuestion.options[selectedQuestion.correctAnswer]}
                  </strong>
                  {". This word stays on the wheel."}
                </div>
              )}

              {/* Next action */}
              {answerState !== "none" && (
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedQuestion(null);
                    setAnswerState("none");
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Spin Again
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
