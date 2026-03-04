"use client";

import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  BookOpen,
  Save,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { SavedWheel } from "@/lib/supabase";
import { SavedWheels, type SavedWheelsRef } from "@/components/saved-wheels";
import type { QuestionItem, GameMode, WheelMode, SimpleWheelItem } from "@/lib/game-data";
import {
  defaultWheelQuestions,
  defaultFlashcardQuestions,
  defaultSimpleWheelItems,
} from "@/lib/game-data";

interface SetupPageProps {
  gameMode: GameMode;
  onBack: () => void;
  onStart: (questions: QuestionItem[]) => void;
  onStartSimple: (items: SimpleWheelItem[], mode: WheelMode) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

type SetupTab = "create" | "saved";

export function SetupPage({ gameMode, onBack, onStart, onStartSimple }: SetupPageProps) {
  const isWheelSetup = gameMode === "wheel";

  // Tab state (only relevant for wheel)
  const [activeTab, setActiveTab] = useState<SetupTab>("create");

  // Wheel mode
  const [wheelMode, setWheelMode] = useState<WheelMode>("simple");

  // Save / Edit state
  const [wheelTitle, setWheelTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Question items
  const [questions, setQuestions] = useState<QuestionItem[]>(
    gameMode === "wheel" ? defaultWheelQuestions : defaultFlashcardQuestions
  );

  // Simple wheel items
  const [simpleItems, setSimpleItems] = useState<SimpleWheelItem[]>(defaultSimpleWheelItems);

  // Ref to the SavedWheels component to trigger a refresh
  const savedWheelsRef = useRef<SavedWheelsRef>(null);

  const title = isWheelSetup ? "Wheel of Fortune" : "Flashcard Setup";
  const subtitle = isWheelSetup
    ? "Create a new wheel or load a saved one."
    : "Add word pairs with their Turkish meanings for flashcard practice.";

  // ─── Question helpers ─────────────────────────────────────────────────────
  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { id: generateId(), question: "", options: ["", "", "", ""], correctAnswer: 0, meaning: "" },
    ]);
  }
  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }
  function updateQuestion(id: string, field: string, value: string | number) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  }
  function updateOption(id: string, optionIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const newOptions = [...q.options] as [string, string, string, string];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  }

  // ─── Simple wheel helpers ─────────────────────────────────────────────────
  function addSimpleItem() {
    setSimpleItems((prev) => [...prev, { id: generateId(), word: "" }]);
  }
  function removeSimpleItem(id: string) {
    setSimpleItems((prev) => prev.filter((item) => item.id !== id));
  }
  function updateSimpleItem(id: string, word: string) {
    setSimpleItems((prev) => prev.map((item) => (item.id === id ? { ...item, word } : item)));
  }

  // ─── Validation ───────────────────────────────────────────────────────────
  const isQuestionsValid =
    questions.length >= 2 &&
    questions.every((q) => {
      if (!q.question.trim()) return false;
      if (isWheelSetup && wheelMode === "questions") return q.options.every((o) => o.trim());
      return q.meaning.trim();
    });

  const isSimpleValid =
    simpleItems.length >= 2 && simpleItems.every((item) => item.word.trim());

  const isValid =
    gameMode === "flashcard"
      ? isQuestionsValid
      : wheelMode === "simple"
        ? isSimpleValid
        : isQuestionsValid;

  const itemCount =
    gameMode === "flashcard"
      ? questions.length
      : wheelMode === "simple"
        ? simpleItems.length
        : questions.length;

  // ─── Edit: populate form from saved wheel ────────────────────────────────
  const handleEdit = useCallback(
    (wheel: SavedWheel) => {
      setWheelTitle(wheel.title);
      setEditingId(wheel.id);

      if (wheel.mode === "simple") {
        setWheelMode("simple");
        setSimpleItems(wheel.data as SimpleWheelItem[]);
      } else {
        setWheelMode("questions");
        setQuestions(wheel.data as QuestionItem[]);
      }

      // Switch to Create tab so the user sees the populated form
      setActiveTab("create");
    },
    []
  );

  // ─── Clear edit mode ──────────────────────────────────────────────────────
  function clearEditMode() {
    setEditingId(null);
    setWheelTitle("");
    setSimpleItems(defaultSimpleWheelItems);
    setQuestions(defaultWheelQuestions);
    setWheelMode("simple");
  }

  // ─── Save / Update ────────────────────────────────────────────────────────
  async function handleSave() {
    if (!wheelTitle.trim()) {
      toast.error("Please enter a title for the wheel.");
      return;
    }
    if (!isValid) {
      toast.error("Please complete all items before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const mode = wheelMode;
      const data = wheelMode === "simple" ? simpleItems : questions;

      if (editingId) {
        // Update existing record
        const { error } = await supabase
          .from("wheels")
          .update({ title: wheelTitle.trim(), mode, data })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Wheel updated successfully!");
      } else {
        // Insert new record
        const { error } = await supabase
          .from("wheels")
          .insert({ title: wheelTitle.trim(), mode, data });
        if (error) throw error;
        toast.success("Wheel saved successfully!");
      }

      clearEditMode();
      savedWheelsRef.current?.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save wheel.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Play from saved wheels ───────────────────────────────────────────────
  function handlePlaySimple(items: SimpleWheelItem[], mode: WheelMode) {
    onStartSimple(items, mode);
  }
  function handlePlayQuestions(q: QuestionItem[], mode: WheelMode) {
    setQuestions(q);
    onStartSimple([], mode);
    onStart(q);
  }

  // ─── Start game ──────────────────────────────────────────────────────────
  function handleStart() {
    if (gameMode === "flashcard") {
      onStart(questions);
    } else if (wheelMode === "simple") {
      onStartSimple(simpleItems, "simple");
    } else {
      onStartSimple([], "questions");
      onStart(questions);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-6xl flex items-center gap-3 px-6 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="ml-auto flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground font-mono">YDS Prep</span>
          </div>
        </div>
      </header>

      {/* Page title */}
      <div className="mx-auto max-w-6xl w-full px-6 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-mono">{title}</h1>
        <p className="mt-1 text-muted-foreground text-sm">{subtitle}</p>
      </div>

      {/* Flashcard: single column layout */}
      {!isWheelSetup && (
        <section className="flex-1 mx-auto max-w-3xl w-full px-6 pb-10">
          <QuestionsForm
            questions={questions}
            isWheelSetup={false}
            wheelMode="questions"
            onAdd={addQuestion}
            onRemove={removeQuestion}
            onUpdate={updateQuestion}
            onUpdateOption={updateOption}
          />
          <StartButton isValid={isValid} itemCount={itemCount} onStart={handleStart} />
        </section>
      )}

      {/* Wheel: two-column layout with tabs on narrow screens */}
      {isWheelSetup && (
        <>
          {/* Tab bar (visible on mobile / medium) */}
          <div className="mx-auto max-w-6xl w-full px-6 mb-6 lg:hidden">
            <div className="inline-flex rounded-lg border border-border bg-muted p-1">
              <button
                onClick={() => setActiveTab("create")}
                className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                  activeTab === "create"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {editingId ? "Edit Wheel" : "Create New"}
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                  activeTab === "saved"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Saved Wheels
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <section className="flex-1 mx-auto max-w-6xl w-full px-6 pb-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Create / Edit form */}
              <div
                className={`flex-1 min-w-0 flex flex-col gap-0 ${
                  activeTab === "saved" ? "hidden lg:flex" : "flex"
                }`}
              >
                {/* Wheel mode toggle */}
                <div className="mb-6">
                  <div className="inline-flex rounded-lg border border-border bg-muted p-1">
                    <button
                      onClick={() => setWheelMode("simple")}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        wheelMode === "simple"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Basit Carkifelek
                    </button>
                    <button
                      onClick={() => setWheelMode("questions")}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        wheelMode === "questions"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Sorularla Carkifelek
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {wheelMode === "simple"
                      ? "Add vocabulary words. Spin and decide to keep or remove each word."
                      : "Add questions with multiple-choice options. Answer correctly to remove words."}
                  </p>
                </div>

                {/* Edit mode banner */}
                {editingId && (
                  <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                    <span className="text-sm font-medium text-primary">
                      Editing: &quot;{wheelTitle}&quot;
                    </span>
                    <button
                      onClick={clearEditMode}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      <RefreshCcw className="h-3 w-3" />
                      Cancel Edit
                    </button>
                  </div>
                )}

                {/* Simple form */}
                {wheelMode === "simple" && (
                  <>
                    <div className="flex flex-col gap-3">
                      {simpleItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                        >
                          <span className="text-xs font-medium text-muted-foreground w-6 shrink-0">
                            {idx + 1}.
                          </span>
                          <Input
                            value={item.word}
                            onChange={(e) => updateSimpleItem(item.id, e.target.value)}
                            placeholder="e.g. Abandon"
                            className="bg-background flex-1"
                          />
                          <button
                            onClick={() => removeSimpleItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
                            aria-label={`Remove item ${idx + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addSimpleItem}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Add Word
                    </button>
                  </>
                )}

                {/* Questions form */}
                {wheelMode === "questions" && (
                  <QuestionsForm
                    questions={questions}
                    isWheelSetup
                    wheelMode="questions"
                    onAdd={addQuestion}
                    onRemove={removeQuestion}
                    onUpdate={updateQuestion}
                    onUpdateOption={updateOption}
                  />
                )}

                {/* Save section */}
                <div className="mt-6 rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {editingId ? "Update Wheel" : "Save to Database"}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {editingId
                      ? "Modify the title or items above, then click Update Wheel."
                      : "Give your wheel a title and save it for later use."}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Wheel Title
                      </Label>
                      <Input
                        value={wheelTitle}
                        onChange={(e) => setWheelTitle(e.target.value)}
                        placeholder="e.g. YDS Verbs, Unit 5 Vocab"
                        className="bg-background"
                      />
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !wheelTitle.trim() || !isValid}
                      variant={editingId ? "default" : "outline"}
                      className="shrink-0"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving
                        ? editingId
                          ? "Updating..."
                          : "Saving..."
                        : editingId
                          ? "Update Wheel"
                          : "Save to Database"}
                    </Button>
                  </div>
                </div>

                {/* Start button */}
                <div className="mt-4">
                  <StartButton isValid={isValid} itemCount={itemCount} onStart={handleStart} />
                </div>
              </div>

              {/* Right: Saved Wheels panel */}
              <div
                className={`lg:w-[380px] shrink-0 ${
                  activeTab === "create" ? "hidden lg:block" : "block"
                }`}
              >
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-foreground font-mono">
                    My Saved Wheels
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Load or edit a previously saved wheel.
                  </p>
                </div>
                <SavedWheels
                  ref={savedWheelsRef}
                  onPlaySimple={handlePlaySimple}
                  onPlayQuestions={handlePlayQuestions}
                  onEdit={handleEdit}
                />
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────

interface QuestionsFormProps {
  questions: QuestionItem[];
  isWheelSetup: boolean;
  wheelMode: WheelMode;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onUpdateOption: (id: string, optionIndex: number, value: string) => void;
}

function QuestionsForm({
  questions,
  isWheelSetup,
  wheelMode,
  onAdd,
  onRemove,
  onUpdate,
  onUpdateOption,
}: QuestionsFormProps) {
  return (
    <>
      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Question {idx + 1}
              </span>
              <button
                onClick={() => onRemove(q.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                aria-label={`Remove question ${idx + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  English Word / Question
                </Label>
                <Input
                  value={q.question}
                  onChange={(e) => onUpdate(q.id, "question", e.target.value)}
                  placeholder="e.g. Abundant"
                  className="bg-background"
                />
              </div>

              {isWheelSetup && wheelMode === "questions" && (
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((opt, oi) => (
                    <div key={oi}>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Option {String.fromCharCode(65 + oi)}
                        {oi === q.correctAnswer && (
                          <span className="text-success ml-1">(Correct)</span>
                        )}
                      </Label>
                      <Input
                        value={opt}
                        onChange={(e) => onUpdateOption(q.id, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="bg-background"
                      />
                    </div>
                  ))}
                </div>
              )}

              {isWheelSetup && wheelMode === "questions" && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Correct Answer
                  </Label>
                  <div className="flex gap-2">
                    {["A", "B", "C", "D"].map((letter, i) => (
                      <button
                        key={letter}
                        onClick={() => onUpdate(q.id, "correctAnswer", i)}
                        className={`h-9 w-9 rounded-md text-sm font-medium transition-colors ${
                          q.correctAnswer === i
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Turkish Meaning
                </Label>
                <Input
                  value={q.meaning}
                  onChange={(e) => onUpdate(q.id, "meaning", e.target.value)}
                  placeholder="e.g. Bol, bereketli"
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Add Question
      </button>
    </>
  );
}

interface StartButtonProps {
  isValid: boolean;
  itemCount: number;
  onStart: () => void;
}

function StartButton({ isValid, itemCount, onStart }: StartButtonProps) {
  return (
    <div className="pb-4">
      <Button
        size="lg"
        className="w-full text-base font-semibold"
        disabled={!isValid}
        onClick={onStart}
      >
        <Play className="h-5 w-5 mr-2" />
        Start Game ({itemCount} items)
      </Button>
      {!isValid && (
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Fill in at least 2 complete items to start.
        </p>
      )}
    </div>
  );
}
