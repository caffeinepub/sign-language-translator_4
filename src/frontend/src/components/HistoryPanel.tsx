import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowLeft, ArrowRight, Clock, History, Trash2 } from "lucide-react";
import type { TranslationRecord } from "../backend.d";
import { useClearHistory, useTranslationHistory } from "../hooks/useQueries";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryItem({
  record,
  index,
}: { record: TranslationRecord; index: number }) {
  const ocid = `history.item.${index}` as const;
  const isSignToLang = record.mode === "sign_to_language";

  return (
    <div
      data-ocid={ocid}
      className="p-4 rounded-xl space-y-2.5 transition-all duration-150 hover:scale-[1.01]"
      style={{
        background: "oklch(15% 0.015 250)",
        border: "1px solid oklch(22% 0.022 248)",
      }}
    >
      {/* Mode + time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{
              background: isSignToLang
                ? "oklch(72% 0.19 186 / 0.12)"
                : "oklch(78% 0.17 74 / 0.12)",
            }}
          >
            {isSignToLang ? (
              <ArrowRight
                className="w-3 h-3"
                style={{ color: "oklch(72% 0.19 186)" }}
              />
            ) : (
              <ArrowLeft
                className="w-3 h-3"
                style={{ color: "oklch(78% 0.17 74)" }}
              />
            )}
          </div>
          <span
            className="text-xs font-medium"
            style={{
              color: isSignToLang
                ? "oklch(72% 0.19 186)"
                : "oklch(78% 0.17 74)",
            }}
          >
            {isSignToLang ? "Sign → Text" : "Text → Sign"}
          </span>
        </div>
        <div
          className="flex items-center gap-1"
          style={{ color: "oklch(45% 0.03 248)" }}
        >
          <Clock className="w-3 h-3" />
          <span className="text-xs">{formatTimestamp(record.timestamp)}</span>
        </div>
      </div>

      {/* Input snippet */}
      <div
        className="text-xs rounded-lg px-3 py-2 truncate"
        style={{
          background: "oklch(13% 0.012 250)",
          color: "oklch(65% 0.04 248)",
        }}
      >
        <span style={{ color: "oklch(45% 0.03 248)" }}>In: </span>
        {record.inputContent}
      </div>

      {/* Output snippet */}
      <div
        className="text-xs rounded-lg px-3 py-2 truncate"
        style={{
          background: "oklch(13% 0.012 250)",
          color: "oklch(80% 0.01 250)",
        }}
      >
        <span style={{ color: "oklch(45% 0.03 248)" }}>Out: </span>
        {record.outputContent}
      </div>

      {/* Languages */}
      <div className="flex gap-1.5">
        <Badge
          className="text-xs"
          style={{
            background: "oklch(20% 0.02 248)",
            color: "oklch(60% 0.04 248)",
            border: "none",
          }}
        >
          {record.signLanguage}
        </Badge>
        <Badge
          className="text-xs"
          style={{
            background: "oklch(20% 0.02 248)",
            color: "oklch(60% 0.04 248)",
            border: "none",
          }}
        >
          {record.spokenLanguage}
        </Badge>
      </div>
    </div>
  );
}

export function HistoryPanel() {
  const { data: history = [], isLoading } = useTranslationHistory();
  const clearHistory = useClearHistory();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-ocid="history.panel"
          style={{
            borderColor: "oklch(24% 0.022 248)",
            color: "oklch(65% 0.04 248)",
            background: "transparent",
          }}
        >
          <History className="w-4 h-4" />
          History
          {history.length > 0 && (
            <span
              className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-mono"
              style={{
                background: "oklch(72% 0.19 186 / 0.15)",
                color: "oklch(72% 0.19 186)",
              }}
            >
              {history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:w-[420px] p-0"
        style={{
          background: "oklch(13% 0.012 250)",
          border: "1px solid oklch(22% 0.022 248)",
        }}
      >
        <SheetHeader
          className="px-5 py-4"
          style={{ borderBottom: "1px solid oklch(20% 0.02 248)" }}
        >
          <div className="flex items-center justify-between">
            <SheetTitle
              className="font-display text-base"
              style={{ color: "oklch(92% 0.006 250)" }}
            >
              Translation History
            </SheetTitle>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearHistory.mutate()}
                disabled={clearHistory.isPending}
                className="gap-1.5 text-xs h-8"
                data-ocid="history.clear_button"
                style={{ color: "oklch(55% 0.2 25)" }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-xl shimmer-loading" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-3 py-16 text-center"
                data-ocid="history.empty_state"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "oklch(17% 0.018 248)",
                    border: "1px solid oklch(24% 0.022 248)",
                  }}
                >
                  <History
                    className="w-6 h-6"
                    style={{ color: "oklch(40% 0.03 248)" }}
                  />
                </div>
                <p className="text-sm" style={{ color: "oklch(45% 0.03 248)" }}>
                  No translations yet
                </p>
                <p className="text-xs" style={{ color: "oklch(35% 0.02 248)" }}>
                  Saved translations will appear here
                </p>
              </div>
            ) : (
              history.map((record, i) => (
                <HistoryItem
                  key={String(record.id)}
                  record={record}
                  index={i + 1}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
