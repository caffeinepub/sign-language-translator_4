import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Languages, Pause, Play, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAddTranslationRecord } from "../hooks/useQueries";
import {
  SIGN_LANGUAGES,
  SPOKEN_LANGUAGES,
  mapWordsToSigns,
  sanitizeInput,
} from "../lib/constants";
import { ProcessingState } from "./ProcessingState";
import { SignAvatar } from "./SignAvatar";

interface LanguageToSignProps {
  defaultSignLanguage: string;
  defaultSpokenLanguage: string;
  onPreferenceChange: (sign: string, spoken: string) => void;
}

export function LanguageToSign({
  defaultSignLanguage,
  defaultSpokenLanguage,
  onPreferenceChange,
}: LanguageToSignProps) {
  const [inputText, setInputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState(defaultSpokenLanguage);
  const [targetSignLanguage, setTargetSignLanguage] =
    useState(defaultSignLanguage);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordMappings, setWordMappings] = useState<
    { word: string; sign: string }[]
  >([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const addRecord = useAddTranslationRecord();

  const MAX_CHARS = 500;

  const handleSourceLangChange = useCallback(
    (val: string) => {
      setSourceLanguage(val);
      onPreferenceChange(targetSignLanguage, val);
    },
    [targetSignLanguage, onPreferenceChange],
  );

  const handleTargetSignChange = useCallback(
    (val: string) => {
      setTargetSignLanguage(val);
      onPreferenceChange(val, sourceLanguage);
    },
    [sourceLanguage, onPreferenceChange],
  );

  const handleGenerate = async () => {
    const cleanText = sanitizeInput(inputText.trim());
    if (!cleanText) {
      toast.error("Please enter text to translate");
      return;
    }
    setIsProcessing(true);
    setIsPlaying(false);
    setWordMappings([]);
    await new Promise((r) => setTimeout(r, 5400));
    const mappings = mapWordsToSigns(cleanText);
    setWordMappings(mappings);
    setIsProcessing(false);
    setIsPlaying(true);
    setRateLimited(true);
    setTimeout(() => setRateLimited(false), 2000);
  };

  const handleSave = async () => {
    if (!wordMappings.length) return;
    const outputContent = wordMappings.map((w) => w.sign).join(" → ");
    await addRecord.mutateAsync({
      mode: "language_to_sign",
      inputContent: sanitizeInput(inputText),
      outputContent,
      signLanguage: targetSignLanguage,
      spokenLanguage: sourceLanguage,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="lang-to-sign-textarea"
              className="text-xs font-medium"
              style={{ color: "oklch(58% 0.04 248)" }}
            >
              Text to Sign
            </label>
            <span
              className="text-xs font-mono"
              style={{
                color:
                  inputText.length > MAX_CHARS * 0.9
                    ? "oklch(55% 0.2 25)"
                    : "oklch(45% 0.03 248)",
              }}
            >
              {inputText.length}/{MAX_CHARS}
            </span>
          </div>
          <Textarea
            id="lang-to-sign-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Type or paste a sentence in any language..."
            className="resize-none min-h-[140px] text-sm"
            data-ocid="lang_to_sign.textarea"
            style={{
              background: "oklch(17% 0.018 248)",
              border: "1px solid oklch(24% 0.022 248)",
              color: "oklch(92% 0.006 250)",
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="source-language-select"
              className="text-xs font-medium"
              style={{ color: "oklch(58% 0.04 248)" }}
            >
              Source Language
            </label>
            <Select
              value={sourceLanguage}
              onValueChange={handleSourceLangChange}
            >
              <SelectTrigger
                id="source-language-select"
                data-ocid="lang_to_sign.source_lang_select"
                style={{
                  background: "oklch(17% 0.018 248)",
                  border: "1px solid oklch(24% 0.022 248)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {SPOKEN_LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="target-sign-select"
              className="text-xs font-medium"
              style={{ color: "oklch(58% 0.04 248)" }}
            >
              Target Sign Language
            </label>
            <Select
              value={targetSignLanguage}
              onValueChange={handleTargetSignChange}
            >
              <SelectTrigger
                id="target-sign-select"
                data-ocid="lang_to_sign.target_sign_select"
                style={{
                  background: "oklch(17% 0.018 248)",
                  border: "1px solid oklch(24% 0.022 248)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIGN_LANGUAGES.map((sl) => (
                  <SelectItem key={sl.value} value={sl.value}>
                    {sl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isProcessing || rateLimited || !inputText.trim()}
          className="w-full h-11 font-semibold gap-2"
          data-ocid="lang_to_sign.generate_button"
          style={{
            background:
              isProcessing || rateLimited
                ? "oklch(72% 0.19 186 / 0.2)"
                : "oklch(72% 0.19 186)",
            color:
              isProcessing || rateLimited
                ? "oklch(72% 0.19 186)"
                : "oklch(10% 0.01 250)",
          }}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4" />
              Generate Signs
            </>
          )}
        </Button>

        <div className="space-y-2">
          <p className="text-xs" style={{ color: "oklch(45% 0.03 248)" }}>
            Try a sample phrase:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Hello, nice to meet you",
              "Where is the restroom?",
              "Thank you for your help",
              "I need assistance please",
            ].map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => setInputText(phrase)}
                className="text-xs px-2.5 py-1 rounded-full transition-all duration-150 hover:scale-105"
                style={{
                  background: "oklch(22% 0.025 248)",
                  border: "1px solid oklch(30% 0.025 248)",
                  color: "oklch(65% 0.05 248)",
                }}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isProcessing ? (
          <ProcessingState
            data-ocid="lang_to_sign.loading_state"
            steps={[
              "Parsing text structure...",
              "Mapping words to signs...",
              "Generating animation sequence...",
            ]}
          />
        ) : wordMappings.length > 0 ? (
          <Card
            data-ocid="lang_to_sign.result_panel"
            className="border-0"
            style={{
              background: "oklch(17% 0.018 248)",
              border: "1px solid oklch(72% 0.19 186 / 0.2)",
            }}
          >
            <CardContent className="p-5 space-y-5">
              <div className="flex justify-center">
                <SignAvatar
                  isPlaying={isPlaying}
                  words={wordMappings}
                  onWordChange={setCurrentWordIndex}
                />
              </div>

              <Button
                onClick={() => setIsPlaying((p) => !p)}
                className="w-full gap-2"
                variant="outline"
                style={{
                  borderColor: "oklch(72% 0.19 186 / 0.3)",
                  color: "oklch(72% 0.19 186)",
                }}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Animation
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Play Animation
                  </>
                )}
              </Button>

              <div>
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: "oklch(58% 0.04 248)" }}
                >
                  Word-by-Word Mapping
                </p>
                <div className="flex flex-wrap gap-2">
                  {wordMappings.map((mapping, i) => (
                    <div
                      key={`${mapping.word}-${i}`}
                      className="px-2.5 py-1.5 rounded-lg text-xs transition-all duration-300"
                      style={{
                        background:
                          i === currentWordIndex && isPlaying
                            ? "oklch(72% 0.19 186 / 0.15)"
                            : "oklch(20% 0.02 248)",
                        border:
                          i === currentWordIndex && isPlaying
                            ? "1px solid oklch(72% 0.19 186 / 0.4)"
                            : "1px solid oklch(26% 0.022 248)",
                      }}
                    >
                      <span style={{ color: "oklch(75% 0.01 250)" }}>
                        {mapping.word}
                      </span>
                      <span style={{ color: "oklch(45% 0.03 248)" }}> → </span>
                      <span
                        className="font-mono font-semibold"
                        style={{ color: "oklch(72% 0.19 186)" }}
                      >
                        {mapping.sign}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    background: "oklch(22% 0.025 248)",
                    color: "oklch(78% 0.17 74)",
                  }}
                >
                  {sourceLanguage}
                </Badge>
                <span
                  style={{ color: "oklch(40% 0.03 248)" }}
                  className="text-xs"
                >
                  →
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    background: "oklch(22% 0.025 248)",
                    color: "oklch(72% 0.19 186)",
                  }}
                >
                  {targetSignLanguage}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={addRecord.isPending}
                  className="gap-1.5 ml-auto"
                  data-ocid="lang_to_sign.save_button"
                  style={{
                    borderColor: "oklch(24% 0.022 248)",
                    color: "oklch(78% 0.17 74)",
                  }}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            className="rounded-2xl flex flex-col items-center justify-center gap-4 text-center p-10"
            style={{
              minHeight: 280,
              background: "oklch(17% 0.018 248)",
              border: "1px dashed oklch(24% 0.022 248)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "oklch(72% 0.19 186 / 0.08)",
                border: "1px solid oklch(72% 0.19 186 / 0.15)",
              }}
            >
              <Languages
                className="w-7 h-7"
                style={{ color: "oklch(72% 0.19 186 / 0.5)" }}
              />
            </div>
            <div>
              <p
                className="font-medium"
                style={{ color: "oklch(70% 0.01 250)" }}
              >
                Ready to generate
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "oklch(45% 0.03 248)" }}
              >
                Enter text and click Generate Signs
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
