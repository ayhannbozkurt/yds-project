"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, BookOpen, RotateCcw, Trophy, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SimpleWheelItem } from "@/lib/game-data";
import { generateWheelColors } from "@/lib/game-data";

interface SimpleWheelGameProps {
  initialItems: SimpleWheelItem[];
  onBack: () => void;
  onHome: () => void;
}

export function SimpleWheelGame({ initialItems, onBack, onHome }: SimpleWheelGameProps) {
  const [items, setItems] = useState<SimpleWheelItem[]>(initialItems);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SimpleWheelItem | null>(null);
  const [rotation, setRotation] = useState(0);
  const [removedCount, setRemovedCount] = useState(0);
  const wheelRef = useRef<SVGSVGElement>(null);
  const totalItems = initialItems.length;

  // Dynamically generate colors based on current item count
  const wheelColors = useMemo(() => generateWheelColors(items.length), [items.length]);

  const isComplete = items.length === 0;

  const spin = useCallback(() => {
    if (isSpinning || items.length === 0) return;

    setSelectedItem(null);
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * items.length);
    const segmentAngle = 360 / items.length;
    const targetAngle = segmentAngle * randomIndex + segmentAngle / 2;
    const spins = 5 + Math.random() * 3;
    const finalRotation = rotation + spins * 360 + (360 - targetAngle);

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedItem(items[randomIndex]);
    }, 4000);
  }, [isSpinning, items, rotation]);

  function handleResume() {
    // Keep the word on the wheel, seamlessly return to spin-ready state
    setSelectedItem(null);
  }

  function handleRemove() {
    if (!selectedItem) return;
    setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
    setRemovedCount((c) => c + 1);
    setSelectedItem(null);
  }

  const renderWheel = () => {
    if (items.length === 0) return null;
    const size = 340;
    const center = size / 2;
    const radius = size / 2 - 10;
    const segmentAngle = 360 / items.length;

    return (
      <svg
        ref={wheelRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transition-transform duration-[4000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {items.map((item, i) => {
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
            <g key={item.id}>
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
                fontSize={items.length > 10 ? "8" : items.length > 6 ? "9.5" : "11"}
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
              >
                {item.word.length > 12
                  ? item.word.slice(0, 11) + "\u2026"
                  : item.word}
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
            All Words Removed!
          </h1>
          <p className="text-muted-foreground mb-2">
            {"You went through all "}{totalItems}{" words on the wheel."}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {"Removed: "}{removedCount}{"/"}{totalItems}
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
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Basit Carkifelek
            </span>
            <span className="text-sm text-muted-foreground">
              {items.length}{" remaining"}
            </span>
            <span className="text-sm font-medium text-foreground">
              {removedCount}{" removed"}
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
        {!selectedItem && (
          <Button
            size="lg"
            className="text-base font-semibold px-12 mb-8"
            onClick={spin}
            disabled={isSpinning}
          >
            {isSpinning ? "Spinning..." : "Spin the Wheel"}
          </Button>
        )}

        {/* Selected Word Display */}
        {selectedItem && (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-lg">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                The wheel landed on
              </p>
              <h2 className="text-3xl font-bold text-foreground font-mono mb-8">
                {selectedItem.word}
              </h2>

              <div className="flex gap-4">
                {/* Resume button - clean, readable outline style */}
                <button
                  onClick={handleResume}
                  className="flex-1 rounded-lg border-2 border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted hover:border-primary/40"
                >
                  Surdur
                </button>
                {/* Remove button - solid black background, white text */}
                <button
                  onClick={handleRemove}
                  className="flex-1 rounded-lg px-6 py-3.5 text-base font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#000000", color: "#ffffff" }}
                >
                  Ortadan Kaldir
                </button>
              </div>

              <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
                {"\"Surdur\" keeps the word on the wheel. \"Ortadan Kaldir\" removes it permanently."}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
