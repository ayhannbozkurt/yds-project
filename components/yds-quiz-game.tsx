"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Home,
  Trophy,
  XCircle,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  X,
  BookOpen,
  Zap,
  ListRestart,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import {
  fetchAllQuestions,
  fetchQuestionsByIds,
  fetchWrongAnswerIds,
  addWrongAnswer,
  removeWrongAnswer,
  clearWrongAnswers,
  shuffleArray,
  getOrCreateSessionId,
  type YdsQuestion,
} from "@/lib/yds-questions";

interface YdsQuizGameProps {
  onHome: () => void;
}

type QuizMode = "menu" | "loading" | "playing" | "results";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export function YdsQuizGame({ onHome }: YdsQuizGameProps) {
  const [mode, setMode] = useState<QuizMode>("loading");
  const [allQuestions, setAllQuestions] = useState<YdsQuestion[]>([]);
  const [questions, setQuestions] = useState<YdsQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<YdsQuestion[]>([]);
  const [wrongAnswerIds, setWrongAnswerIds] = useState<number[]>([]);
  const [showPassage, setShowPassage] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [showWrongList, setShowWrongList] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);

    async function load() {
      try {
        const [qs, wIds] = await Promise.all([
          fetchAllQuestions(),
          fetchWrongAnswerIds(sid),
        ]);
        setAllQuestions(qs);
        setWrongAnswerIds(wIds);
        setMode("menu");
      } catch (err) {
        console.error("Failed to load questions:", err);
        setMode("menu");
      }
    }
    load();
  }, []);

  const refreshWrongIds = useCallback(async () => {
    if (!sessionId) return;
    const ids = await fetchWrongAnswerIds(sessionId);
    setWrongAnswerIds(ids);
  }, [sessionId]);

  const wrongQuestions = allQuestions.filter((q) => wrongAnswerIds.includes(q.id));

  const startQuiz = useCallback(
    (questionsToUse: YdsQuestion[], retry = false) => {
      const shuffled = shuffleArray(questionsToUse);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setCorrectCount(0);
      setWrongAnswers([]);
      setShowPassage(false);
      setIsRetryMode(retry);
      setMode("playing");
    },
    []
  );

  const startAllQuestions = useCallback(() => {
    startQuiz(allQuestions);
  }, [startQuiz, allQuestions]);

  const startRetry = useCallback(() => {
    if (wrongQuestions.length > 0) {
      startQuiz(wrongQuestions, true);
    }
  }, [startQuiz, wrongQuestions]);

  const handleSelectOption = useCallback(
    async (optionIndex: number) => {
      if (isAnswered) return;
      setSelectedOption(optionIndex);
      setIsAnswered(true);

      const currentQuestion = questions[currentIndex];
      if (optionIndex === currentQuestion.correctAnswer) {
        setCorrectCount((prev) => prev + 1);
        if (isRetryMode) {
          await removeWrongAnswer(currentQuestion.id, sessionId);
          setWrongAnswerIds((prev) => prev.filter((id) => id !== currentQuestion.id));
        }
      } else {
        setWrongAnswers((prev) => [...prev, currentQuestion]);
        if (!wrongAnswerIds.includes(currentQuestion.id)) {
          await addWrongAnswer(currentQuestion.id, sessionId);
          setWrongAnswerIds((prev) => [...prev, currentQuestion.id]);
        }
      }
    },
    [isAnswered, questions, currentIndex, isRetryMode, sessionId, wrongAnswerIds]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setMode("results");
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowPassage(false);
  }, [currentIndex, questions.length]);

  const handleBackToMenu = useCallback(() => {
    refreshWrongIds();
    setMode("menu");
    setShowWrongList(false);
  }, [refreshWrongIds]);

  const handleClearWrongHistory = useCallback(async () => {
    await clearWrongAnswers(sessionId);
    setWrongAnswerIds([]);
  }, [sessionId]);

  // Loading state
  if (mode === "loading") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Sorular yükleniyor...</p>
      </main>
    );
  }

  // Menu
  if (mode === "menu") {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-5xl flex items-center gap-3 px-6 py-4">
            <button
              onClick={onHome}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </button>
            <div className="h-4 w-px bg-border" />
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight text-foreground font-mono">
              YDS Çıkmış Sorular
            </span>
          </div>
        </header>

        <section className="flex-1 flex flex-col items-center px-6 py-12">
          <div className="max-w-lg w-full space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
                YDS Çıkmış Sorular
              </h1>
              <p className="mt-2 text-muted-foreground">
                Toplam {allQuestions.length} soru ile pratik yapın
              </p>
            </div>

            <button
              onClick={startAllQuestions}
              className="w-full group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground font-mono mb-1">
                    Tüm Soruları Çöz
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {allQuestions.length} soru karışık sırayla
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChevronRight className="h-6 w-6 text-primary group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>

            {wrongQuestions.length > 0 && (
              <button
                onClick={startRetry}
                className="w-full group relative overflow-hidden rounded-xl border border-destructive/30 bg-card p-6 text-left transition-all duration-300 hover:border-destructive/50 hover:shadow-lg hover:shadow-destructive/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground font-mono mb-1 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-destructive" />
                      Yanlış Yaptıklarım
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {wrongQuestions.length} soru tekrar çöz
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <RotateCcw className="h-6 w-6 text-destructive group-hover:rotate-[-20deg] transition-transform" />
                  </div>
                </div>
              </button>
            )}

            {wrongQuestions.length > 0 && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setShowWrongList(!showWrongList)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    Yanlış yapılan soruları görüntüle ({wrongQuestions.length})
                  </span>
                  {showWrongList ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {showWrongList && (
                  <div className="border-t border-border">
                    <div className="max-h-64 overflow-y-auto">
                      {wrongQuestions.map((q, i) => (
                        <div
                          key={q.id}
                          className="px-6 py-3 text-sm border-b border-border last:border-0"
                        >
                          <span className="text-muted-foreground mr-2">{i + 1}.</span>
                          <span className="text-foreground line-clamp-2">{q.question}</span>
                          <span className="block mt-1 text-xs text-emerald-500">
                            Doğru: {OPTION_LABELS[q.correctAnswer]}) {q.options[q.correctAnswer]}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border px-6 py-3">
                      <button
                        onClick={handleClearWrongHistory}
                        className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Listeyi Temizle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  // Results
  if (mode === "results") {
    const total = questions.length;
    const wrong = total - correctCount;
    const percentage = Math.round((correctCount / total) * 100);

    return (
      <main className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-5xl flex items-center gap-3 px-6 py-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight text-foreground font-mono">
              Sonuçlar
            </span>
          </div>
        </header>

        <section className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-md w-full text-center space-y-8">
            <div
              className={`inline-flex h-20 w-20 items-center justify-center rounded-full ${
                percentage >= 70
                  ? "bg-emerald-500/10"
                  : percentage >= 50
                  ? "bg-amber-500/10"
                  : "bg-destructive/10"
              }`}
            >
              <Trophy
                className={`h-10 w-10 ${
                  percentage >= 70
                    ? "text-emerald-500"
                    : percentage >= 50
                    ? "text-amber-500"
                    : "text-destructive"
                }`}
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight font-mono text-foreground">
                %{percentage}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {total} sorudan {correctCount} doğru, {wrong} yanlış
              </p>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  percentage >= 70
                    ? "bg-emerald-500"
                    : percentage >= 50
                    ? "bg-amber-500"
                    : "bg-destructive"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground font-mono">{correctCount}</div>
                <div className="text-xs text-muted-foreground">Doğru</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <XCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground font-mono">{wrong}</div>
                <div className="text-xs text-muted-foreground">Yanlış</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {wrongAnswers.length > 0 && (
                <button
                  onClick={() => startQuiz(wrongAnswers, true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Yanlışları Tekrar Çöz ({wrongAnswers.length})
                </button>
              )}
              <button
                onClick={startAllQuestions}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                <ListRestart className="h-4 w-4" />
                Baştan Başla
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Home className="h-4 w-4" />
                Menüye Dön
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Playing mode
  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion.correctAnswer;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToMenu}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500 font-mono">{correctCount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive font-mono">{wrongAnswers.length}</span>
            </div>
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <section className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {currentQuestion.passage && (
            <div className="mb-4">
              <button
                onClick={() => setShowPassage(!showPassage)}
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                {showPassage ? "Paragrafı Gizle" : "Paragrafı Göster"}
              </button>
              {showPassage && (
                <div className="mt-3 rounded-xl border border-border bg-muted/50 p-5 text-sm leading-relaxed text-foreground/80">
                  {currentQuestion.passage}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Soru {currentQuestion.id}
                </span>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Deneme {currentQuestion.deneme}
                </span>
              </div>
              <p className="text-base leading-relaxed text-foreground font-medium">
                {currentQuestion.question}
              </p>
            </div>

            <div className="p-4 space-y-2">
              {currentQuestion.options.map((option, index) => {
                let optionStyle =
                  "border-border bg-card hover:bg-muted/50 hover:border-primary/30 text-foreground";

                if (isAnswered) {
                  if (index === currentQuestion.correctAnswer) {
                    optionStyle =
                      "border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20";
                  } else if (index === selectedOption && !isCorrect) {
                    optionStyle =
                      "border-destructive/50 bg-destructive/5 text-destructive ring-1 ring-destructive/20";
                  } else {
                    optionStyle = "border-border bg-card text-muted-foreground opacity-50";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    disabled={isAnswered}
                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${optionStyle} ${
                      !isAnswered ? "cursor-pointer active:scale-[0.99]" : "cursor-default"
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        isAnswered && index === currentQuestion.correctAnswer
                          ? "bg-emerald-500 text-white"
                          : isAnswered && index === selectedOption && !isCorrect
                          ? "bg-destructive text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {OPTION_LABELS[index]}
                    </span>
                    <span className="text-sm leading-relaxed flex-1">{option}</span>
                    {isAnswered && index === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    )}
                    {isAnswered && index === selectedOption && !isCorrect && (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="px-6 py-4 border-t border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          Doğru!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-destructive" />
                        <span className="text-sm font-medium text-destructive">
                          Yanlış! Doğru cevap: {OPTION_LABELS[currentQuestion.correctAnswer]}
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {currentIndex + 1 >= questions.length ? "Sonuçları Gör" : "Sonraki"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
