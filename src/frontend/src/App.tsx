import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeftRight, Hand, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HistoryPanel } from "./components/HistoryPanel";
import { LanguageToSign } from "./components/LanguageToSign";
import { SignToLanguage } from "./components/SignToLanguage";
import { useSetPreferences, useUserPreferences } from "./hooks/useQueries";

type Mode = "sign_to_lang" | "lang_to_sign";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [mode, setMode] = useState<Mode>("sign_to_lang");
  const [signLanguage, setSignLanguage] = useState("ASL");
  const [spokenLanguage, setSpokenLanguage] = useState("English");
  const setPreferences = useSetPreferences();
  const { data: preferences } = useUserPreferences();
  const isPrefsLoaded = useRef(false);
  const mutate = setPreferences.mutate;

  useEffect(() => {
    if (preferences && !isPrefsLoaded.current) {
      isPrefsLoaded.current = true;
      if (preferences.preferredSignLanguage)
        setSignLanguage(preferences.preferredSignLanguage);
      if (preferences.preferredSpokenLanguage)
        setSpokenLanguage(preferences.preferredSpokenLanguage);
    }
  }, [preferences]);

  const [pendingPrefs, setPendingPrefs] = useState<{
    sign: string;
    spoken: string;
  } | null>(null);
  const debouncedPrefs = useDebounce(pendingPrefs, 800);

  useEffect(() => {
    if (debouncedPrefs) {
      mutate({
        signLanguage: debouncedPrefs.sign,
        spokenLanguage: debouncedPrefs.spoken,
      });
    }
  }, [debouncedPrefs, mutate]);

  const handlePreferenceChange = useCallback((sign: string, spoken: string) => {
    setSignLanguage(sign);
    setSpokenLanguage(spoken);
    setPendingPrefs({ sign, spoken });
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(13% 0.012 250)" }}
    >
      <div
        className="fixed inset-0 grid-glow pointer-events-none"
        aria-hidden="true"
      />

      <header
        className="sticky top-0 z-50 px-4 sm:px-6 py-4"
        style={{
          background: "oklch(13% 0.012 250 / 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(22% 0.022 248)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center teal-glow"
              style={{
                background: "oklch(72% 0.19 186 / 0.15)",
                border: "1px solid oklch(72% 0.19 186 / 0.4)",
              }}
            >
              <Hand
                className="w-5 h-5"
                style={{ color: "oklch(72% 0.19 186)" }}
              />
            </div>
            <div>
              <h1
                className="text-xl font-display font-bold tracking-tight leading-none"
                style={{ color: "oklch(96% 0.005 250)" }}
              >
                Sign<span style={{ color: "oklch(72% 0.19 186)" }}>Bridge</span>
              </h1>
              <p className="text-xs" style={{ color: "oklch(45% 0.03 248)" }}>
                Sign Language Translator
              </p>
            </div>
          </div>

          <div
            className="flex items-center rounded-xl p-1 gap-1"
            style={{
              background: "oklch(17% 0.018 248)",
              border: "1px solid oklch(24% 0.022 248)",
            }}
            data-ocid="mode.toggle"
          >
            <button
              type="button"
              onClick={() => setMode("sign_to_lang")}
              className="relative px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              style={{
                background:
                  mode === "sign_to_lang"
                    ? "oklch(72% 0.19 186 / 0.15)"
                    : "transparent",
                color:
                  mode === "sign_to_lang"
                    ? "oklch(72% 0.19 186)"
                    : "oklch(50% 0.03 248)",
                border:
                  mode === "sign_to_lang"
                    ? "1px solid oklch(72% 0.19 186 / 0.3)"
                    : "1px solid transparent",
              }}
            >
              <span className="flex items-center gap-1.5">
                <Hand className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign → Language</span>
                <span className="sm:hidden">→</span>
              </span>
            </button>

            <div style={{ color: "oklch(35% 0.025 248)" }}>
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>

            <button
              type="button"
              onClick={() => setMode("lang_to_sign")}
              className="relative px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              style={{
                background:
                  mode === "lang_to_sign"
                    ? "oklch(78% 0.17 74 / 0.12)"
                    : "transparent",
                color:
                  mode === "lang_to_sign"
                    ? "oklch(78% 0.17 74)"
                    : "oklch(50% 0.03 248)",
                border:
                  mode === "lang_to_sign"
                    ? "1px solid oklch(78% 0.17 74 / 0.3)"
                    : "1px solid transparent",
              }}
            >
              <span className="flex items-center gap-1.5">
                <span className="hidden sm:inline">Language → Sign</span>
                <span className="sm:hidden">←</span>
                <Hand className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <HistoryPanel />
          </div>
        </div>
      </header>

      <div
        className="px-4 sm:px-6 py-2.5"
        style={{
          background: "oklch(78% 0.17 74 / 0.06)",
          borderBottom: "1px solid oklch(78% 0.17 74 / 0.12)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-2.5">
          <ShieldCheck
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "oklch(78% 0.17 74)" }}
          />
          <p className="text-xs" style={{ color: "oklch(65% 0.1 74)" }}>
            <span
              className="font-semibold"
              style={{ color: "oklch(78% 0.17 74)" }}
            >
              Simulation Mode
            </span>
            {" — "}
            This app demonstrates a realistic AI sign language translation
            interface. All processing is simulated with placeholder hooks for
            future ML model integration.
          </p>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <Badge
                    className="text-xs px-2.5 py-1"
                    style={{
                      background:
                        mode === "sign_to_lang"
                          ? "oklch(72% 0.19 186 / 0.12)"
                          : "oklch(78% 0.17 74 / 0.12)",
                      color:
                        mode === "sign_to_lang"
                          ? "oklch(72% 0.19 186)"
                          : "oklch(78% 0.17 74)",
                      border:
                        mode === "sign_to_lang"
                          ? "1px solid oklch(72% 0.19 186 / 0.25)"
                          : "1px solid oklch(78% 0.17 74 / 0.25)",
                    }}
                  >
                    {mode === "sign_to_lang" ? "Mode 1" : "Mode 2"}
                  </Badge>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-display font-bold"
                  style={{ color: "oklch(96% 0.005 250)" }}
                >
                  {mode === "sign_to_lang" ? (
                    <>
                      Translate{" "}
                      <span style={{ color: "oklch(72% 0.19 186)" }}>
                        Sign Language
                      </span>{" "}
                      to Text
                    </>
                  ) : (
                    <>
                      Convert Text to{" "}
                      <span style={{ color: "oklch(78% 0.17 74)" }}>
                        Sign Language
                      </span>
                    </>
                  )}
                </h2>
                <p
                  className="text-sm mt-1.5"
                  style={{ color: "oklch(50% 0.03 248)" }}
                >
                  {mode === "sign_to_lang"
                    ? "Use your camera or upload a video to recognize and translate sign language gestures into any spoken language."
                    : "Enter text in any language and watch an animated avatar sign it back to you in your chosen sign language."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "sign_to_lang" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "sign_to_lang" ? 20 : -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {mode === "sign_to_lang" ? (
                <SignToLanguage
                  defaultSignLanguage={signLanguage}
                  defaultSpokenLanguage={spokenLanguage}
                  onPreferenceChange={handlePreferenceChange}
                />
              ) : (
                <LanguageToSign
                  defaultSignLanguage={signLanguage}
                  defaultSpokenLanguage={spokenLanguage}
                  onPreferenceChange={handlePreferenceChange}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer
        className="px-4 sm:px-6 py-5 mt-4"
        style={{ borderTop: "1px solid oklch(20% 0.02 248)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "oklch(72% 0.19 186 / 0.1)" }}
            >
              <Hand
                className="w-3 h-3"
                style={{ color: "oklch(72% 0.19 186)" }}
              />
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(45% 0.03 248)" }}
            >
              SignBridge
            </span>
          </div>
          <p className="text-xs" style={{ color: "oklch(35% 0.025 248)" }}>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: "oklch(50% 0.04 248)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(17% 0.018 248)",
            border: "1px solid oklch(24% 0.022 248)",
            color: "oklch(92% 0.006 250)",
          },
        }}
      />
    </div>
  );
}
