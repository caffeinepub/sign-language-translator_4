import { useCamera } from "@/camera/useCamera";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Copy,
  Save,
  Upload,
  Video,
  Volume2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAddTranslationRecord } from "../hooks/useQueries";
import {
  SIGN_LANGUAGES,
  SPOKEN_LANGUAGES,
  getConfidenceLevel,
  getSimulatedTranslation,
  sanitizeInput,
} from "../lib/constants";
import { ProcessingState } from "./ProcessingState";

interface SignToLanguageProps {
  defaultSignLanguage: string;
  defaultSpokenLanguage: string;
  onPreferenceChange: (sign: string, spoken: string) => void;
}

export function SignToLanguage({
  defaultSignLanguage,
  defaultSpokenLanguage,
  onPreferenceChange,
}: SignToLanguageProps) {
  const [inputTab, setInputTab] = useState<"camera" | "upload">("camera");
  const [signLanguage, setSignLanguage] = useState(defaultSignLanguage);
  const [spokenLanguage, setSpokenLanguage] = useState(defaultSpokenLanguage);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    text: string;
    confidence: "high" | "medium" | "low";
  } | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addRecord = useAddTranslationRecord();

  const {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    isActive,
    isLoading,
    error,
    isSupported,
  } = useCamera({ facingMode: "user" });

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleSignLanguageChange = useCallback(
    (val: string) => {
      setSignLanguage(val);
      onPreferenceChange(val, spokenLanguage);
    },
    [spokenLanguage, onPreferenceChange],
  );

  const handleSpokenLanguageChange = useCallback(
    (val: string) => {
      setSpokenLanguage(val);
      onPreferenceChange(signLanguage, val);
    },
    [signLanguage, onPreferenceChange],
  );

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setUploadedFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("video/")) {
      handleFileChange(file);
    } else {
      toast.error("Please drop a valid video file");
    }
  };

  const handleTranslate = async () => {
    if (inputTab === "camera" && !isActive) {
      toast.error("Please start the camera before translating");
      return;
    }
    if (inputTab === "upload" && !uploadedFile) {
      toast.error("Please upload a video file before translating");
      return;
    }

    setIsProcessing(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 5400));
    const translatedText = getSimulatedTranslation(signLanguage);
    const confidence = getConfidenceLevel();
    setResult({ text: sanitizeInput(translatedText), confidence });
    setIsProcessing(false);
    setRateLimited(true);
    setTimeout(() => setRateLimited(false), 2000);
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.text);
    toast.success("Copied to clipboard");
  };

  const handleTTS = () => {
    if (!result) return;
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported in your browser");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.text);
    const lang =
      spokenLanguage === "Spanish"
        ? "es-ES"
        : spokenLanguage === "French"
          ? "fr-FR"
          : spokenLanguage === "German"
            ? "de-DE"
            : "en-US";
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
    toast.success("Playing audio...");
  };

  const handleSave = async () => {
    if (!result) return;
    const inputContent =
      inputTab === "upload" && uploadedFile
        ? `[Video: ${uploadedFile.name}]`
        : "[Live Camera Feed]";
    await addRecord.mutateAsync({
      mode: "sign_to_language",
      inputContent,
      outputContent: result.text,
      signLanguage,
      spokenLanguage,
    });
  };

  const confidenceConfig = {
    high: {
      label: "High Confidence",
      icon: CheckCircle,
      style: {
        color: "oklch(68% 0.2 155)",
        background: "oklch(68% 0.2 155 / 0.1)",
        border: "1px solid oklch(68% 0.2 155 / 0.3)",
      },
    },
    medium: {
      label: "Medium Confidence",
      icon: AlertTriangle,
      style: {
        color: "oklch(78% 0.17 74)",
        background: "oklch(78% 0.17 74 / 0.1)",
        border: "1px solid oklch(78% 0.17 74 / 0.3)",
      },
    },
    low: {
      label: "Low Confidence",
      icon: XCircle,
      style: {
        color: "oklch(55% 0.2 25)",
        background: "oklch(55% 0.2 25 / 0.1)",
        border: "1px solid oklch(55% 0.2 25 / 0.3)",
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="space-y-4">
        <Tabs
          value={inputTab}
          onValueChange={(v) => setInputTab(v as "camera" | "upload")}
        >
          <TabsList
            className="w-full"
            style={{
              background: "oklch(17% 0.018 248)",
              border: "1px solid oklch(24% 0.022 248)",
            }}
          >
            <TabsTrigger
              value="camera"
              className="flex-1 gap-2"
              data-ocid="sign_to_lang.camera_tab"
            >
              <Camera className="w-4 h-4" />
              Live Camera
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="flex-1 gap-2"
              data-ocid="sign_to_lang.upload_tab"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="mt-4 space-y-3">
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                aspectRatio: "16/9",
                background: "oklch(15% 0.015 250)",
                border: "1px solid oklch(24% 0.022 248)",
                minHeight: 200,
              }}
            >
              {isSupported === false ? (
                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                  <div>
                    <Camera
                      className="w-10 h-10 mx-auto mb-3"
                      style={{ color: "oklch(55% 0.2 25)" }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: "oklch(58% 0.04 248)" }}
                    >
                      Camera not supported in your browser
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    style={{ display: isActive ? "block" : "none" }}
                    aria-label="Camera preview"
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  {!isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                          background: "oklch(72% 0.19 186 / 0.1)",
                          border: "1px solid oklch(72% 0.19 186 / 0.3)",
                        }}
                      >
                        <Camera
                          className="w-7 h-7"
                          style={{ color: "oklch(72% 0.19 186)" }}
                        />
                      </div>
                      <p
                        className="text-sm"
                        style={{ color: "oklch(58% 0.04 248)" }}
                      >
                        Camera preview will appear here
                      </p>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-3 left-3">
                      <Badge
                        className="gap-1.5 text-xs"
                        style={{
                          background: "oklch(55% 0.2 25 / 0.9)",
                          color: "white",
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        RECORDING
                      </Badge>
                    </div>
                  )}
                </>
              )}
              {error && (
                <div
                  className="absolute bottom-0 left-0 right-0 p-3 text-xs"
                  style={{
                    background: "oklch(55% 0.2 25 / 0.15)",
                    color: "oklch(55% 0.2 25)",
                  }}
                >
                  {error.message}
                </div>
              )}
            </div>

            <Button
              onClick={isActive ? stopCamera : startCamera}
              disabled={isLoading || isSupported === false}
              className="w-full gap-2"
              data-ocid="sign_to_lang.camera_button"
              style={{
                background: isActive
                  ? "oklch(55% 0.2 25 / 0.2)"
                  : "oklch(72% 0.19 186 / 0.15)",
                border: isActive
                  ? "1px solid oklch(55% 0.2 25 / 0.4)"
                  : "1px solid oklch(72% 0.19 186 / 0.4)",
                color: isActive ? "oklch(55% 0.2 25)" : "oklch(72% 0.19 186)",
              }}
              variant="outline"
            >
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : isActive ? (
                <Video className="w-4 h-4" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {isLoading
                ? "Initializing..."
                : isActive
                  ? "Stop Camera"
                  : "Start Camera"}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="mt-4 space-y-3">
            <label
              htmlFor="video-file-input"
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className="rounded-xl cursor-pointer transition-all duration-200 block"
              data-ocid="sign_to_lang.dropzone"
              style={{
                minHeight: 200,
                border: isDragging
                  ? "2px dashed oklch(72% 0.19 186 / 0.8)"
                  : "2px dashed oklch(24% 0.022 248)",
                background: isDragging
                  ? "oklch(72% 0.19 186 / 0.06)"
                  : "oklch(17% 0.018 248)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 24,
              }}
            >
              {videoPreviewUrl ? (
                // biome-ignore lint/a11y/useMediaCaption: preview only, no captions needed
                <video
                  src={videoPreviewUrl}
                  className="w-full rounded-lg"
                  style={{ maxHeight: 160, objectFit: "cover" }}
                  controls
                />
              ) : (
                <>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{
                      background: "oklch(72% 0.19 186 / 0.1)",
                      border: "1px solid oklch(72% 0.19 186 / 0.2)",
                    }}
                  >
                    <Upload
                      className="w-6 h-6"
                      style={{ color: "oklch(72% 0.19 186)" }}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "oklch(80% 0.01 250)" }}
                    >
                      Drop video here or click to browse
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(58% 0.04 248)" }}
                    >
                      MP4, MOV, WebM up to 500MB
                    </p>
                  </div>
                </>
              )}
            </label>
            {uploadedFile && (
              <div
                className="px-3 py-2 rounded-lg text-xs flex items-center gap-2"
                style={{
                  background: "oklch(72% 0.19 186 / 0.08)",
                  border: "1px solid oklch(72% 0.19 186 / 0.15)",
                }}
              >
                <Video
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(72% 0.19 186)" }}
                />
                <span
                  style={{ color: "oklch(80% 0.01 250)" }}
                  className="truncate"
                >
                  {uploadedFile.name}
                </span>
                <span
                  style={{ color: "oklch(58% 0.04 248)" }}
                  className="ml-auto flex-shrink-0"
                >
                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="video-file-input"
              type="file"
              accept="video/*"
              className="hidden"
              data-ocid="sign_to_lang.upload_button"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="sign-language-select"
              className="text-xs font-medium"
              style={{ color: "oklch(58% 0.04 248)" }}
            >
              Sign Language
            </label>
            <Select
              value={signLanguage}
              onValueChange={handleSignLanguageChange}
            >
              <SelectTrigger
                id="sign-language-select"
                data-ocid="sign_to_lang.sign_language_select"
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
          <div className="space-y-1.5">
            <label
              htmlFor="output-language-select"
              className="text-xs font-medium"
              style={{ color: "oklch(58% 0.04 248)" }}
            >
              Output Language
            </label>
            <Select
              value={spokenLanguage}
              onValueChange={handleSpokenLanguageChange}
            >
              <SelectTrigger
                id="output-language-select"
                data-ocid="sign_to_lang.spoken_language_select"
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
        </div>

        <Button
          onClick={handleTranslate}
          disabled={isProcessing || rateLimited}
          className="w-full h-11 font-semibold gap-2"
          data-ocid="sign_to_lang.translate_button"
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
            "Translate Signs"
          )}
        </Button>
      </div>

      {/* Output Panel */}
      <div className="space-y-4">
        {isProcessing ? (
          <ProcessingState
            data-ocid="sign_to_lang.loading_state"
            steps={[
              "Analyzing gesture patterns...",
              "Identifying signs...",
              `Translating to ${spokenLanguage}...`,
            ]}
          />
        ) : result ? (
          <Card
            data-ocid="sign_to_lang.result_panel"
            className="border-0"
            style={{
              background: "oklch(17% 0.018 248)",
              border: "1px solid oklch(72% 0.19 186 / 0.2)",
            }}
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-medium"
                  style={{ color: "oklch(58% 0.04 248)" }}
                >
                  Translation Result
                </span>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={confidenceConfig[result.confidence].style}
                >
                  {(() => {
                    const Icon = confidenceConfig[result.confidence].icon;
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {confidenceConfig[result.confidence].label}
                </div>
              </div>

              <div
                className="rounded-xl p-4 text-base leading-relaxed"
                style={{
                  background: "oklch(14% 0.014 250)",
                  color: "oklch(92% 0.006 250)",
                  border: "1px solid oklch(24% 0.022 248)",
                }}
              >
                {result.text}
              </div>

              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    background: "oklch(22% 0.025 248)",
                    color: "oklch(72% 0.19 186)",
                  }}
                >
                  {signLanguage}
                </Badge>
                <span
                  style={{ color: "oklch(40% 0.03 248)" }}
                  className="text-xs self-center"
                >
                  →
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    background: "oklch(22% 0.025 248)",
                    color: "oklch(78% 0.17 74)",
                  }}
                >
                  {spokenLanguage}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5"
                  data-ocid="sign_to_lang.copy_button"
                  style={{
                    borderColor: "oklch(24% 0.022 248)",
                    color: "oklch(72% 0.15 186)",
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTTS}
                  className="gap-1.5"
                  data-ocid="sign_to_lang.tts_button"
                  style={{
                    borderColor: "oklch(24% 0.022 248)",
                    color: "oklch(72% 0.15 186)",
                  }}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Listen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={addRecord.isPending}
                  className="gap-1.5 ml-auto"
                  data-ocid="sign_to_lang.save_button"
                  style={{
                    borderColor: "oklch(24% 0.022 248)",
                    color: "oklch(78% 0.17 74)",
                  }}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </Button>
              </div>

              <div
                className="text-xs rounded-lg px-3 py-2"
                style={{
                  background: "oklch(78% 0.17 74 / 0.06)",
                  color: "oklch(65% 0.12 74)",
                  border: "1px solid oklch(78% 0.17 74 / 0.15)",
                }}
              >
                ⚠️ Results are simulated — ML model integration pending
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
              <Camera
                className="w-7 h-7"
                style={{ color: "oklch(72% 0.19 186 / 0.5)" }}
              />
            </div>
            <div>
              <p
                className="font-medium"
                style={{ color: "oklch(70% 0.01 250)" }}
              >
                Ready to translate
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "oklch(45% 0.03 248)" }}
              >
                Start camera or upload a video, then click Translate
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
