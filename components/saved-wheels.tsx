"use client";

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import {
  Play,
  Trash2,
  Database,
  CircleDot,
  HelpCircle,
  Loader2,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { SavedWheel } from "@/lib/supabase";
import type { SimpleWheelItem, QuestionItem, WheelMode } from "@/lib/game-data";

export interface SavedWheelsRef {
  refresh: () => void;
}

interface SavedWheelsProps {
  onPlaySimple: (items: SimpleWheelItem[], mode: WheelMode) => void;
  onPlayQuestions: (questions: QuestionItem[], mode: WheelMode) => void;
  onEdit: (wheel: SavedWheel) => void;
}

export const SavedWheels = forwardRef<SavedWheelsRef, SavedWheelsProps>(
  function SavedWheels({ onPlaySimple, onPlayQuestions, onEdit }, ref) {
    const [wheels, setWheels] = useState<SavedWheel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    const fetchWheels = useCallback(async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const { data, error } = await supabase
          .from("wheels")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setWheels(data ?? []);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchWheels();
    }, [fetchWheels]);

    // Expose refresh() to parent via ref
    useImperativeHandle(ref, () => ({ refresh: fetchWheels }), [fetchWheels]);

    async function handleDelete(id: string) {
      setDeletingId(id);
      try {
        const { error } = await supabase.from("wheels").delete().eq("id", id);
        if (error) throw error;
        setWheels((prev) => prev.filter((w) => w.id !== id));
        toast.success("Wheel deleted.");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete.";
        toast.error(message);
      } finally {
        setDeletingId(null);
      }
    }

    function handlePlay(wheel: SavedWheel) {
      if (wheel.mode === "simple") {
        onPlaySimple(wheel.data as SimpleWheelItem[], "simple");
      } else {
        onPlayQuestions(wheel.data as QuestionItem[], "questions");
      }
    }

    function getItemCount(wheel: SavedWheel): number {
      return Array.isArray(wheel.data) ? wheel.data.length : 0;
    }

    function formatDate(dateStr: string): string {
      return new Date(dateStr).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    if (hasError && !isLoading) {
      return (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Database className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Could not load saved wheels
          </h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto leading-relaxed">
            Make sure your Supabase environment variables are set and the
            &quot;wheels&quot; table exists in your database.
          </p>
          <Button variant="outline" size="sm" onClick={fetchWheels}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 flex items-center gap-4"
            >
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      );
    }

    if (wheels.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
          <Database className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No saved wheels yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Create a wheel using the form and save it. Saved wheels will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">
            {wheels.length} saved wheel{wheels.length === 1 ? "" : "s"}
          </span>
          <button
            onClick={fetchWheels}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>

        {wheels.map((wheel) => (
          <div
            key={wheel.id}
            className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 transition-all hover:border-primary/20 hover:shadow-sm"
          >
            {/* Icon */}
            <div className="h-10 w-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
              {wheel.mode === "simple" ? (
                <CircleDot className="h-5 w-5 text-primary" />
              ) : (
                <HelpCircle className="h-5 w-5 text-primary" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {wheel.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase tracking-wider px-1.5 py-0"
                >
                  {wheel.mode === "simple" ? "Simple" : "Questions"}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {getItemCount(wheel)} item{getItemCount(wheel) === 1 ? "" : "s"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDate(wheel.created_at)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => handlePlay(wheel)}
              >
                <Play className="h-3.5 w-3.5 mr-1" />
                Play
              </Button>
              <button
                onClick={() => onEdit(wheel)}
                className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                aria-label={`Edit ${wheel.title}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(wheel.id)}
                disabled={deletingId === wheel.id}
                className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
                aria-label={`Delete ${wheel.title}`}
              >
                {deletingId === wheel.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }
);
