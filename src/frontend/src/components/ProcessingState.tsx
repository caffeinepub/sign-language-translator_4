import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface ProcessingStateProps {
  steps: string[];
  "data-ocid"?: string;
}

export function ProcessingState({
  steps,
  "data-ocid": dataOcid,
}: ProcessingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setCurrentStep(0);
    setProgress(0);

    const stepDuration = 1800;
    const totalDuration = steps.length * stepDuration;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / totalDuration) * 100, 95);
      setProgress(pct);
    }, 50);

    const stepTimeouts = steps.map((_, i) =>
      setTimeout(() => setCurrentStep(i), i * stepDuration),
    );

    return () => {
      clearInterval(progressInterval);
      for (const t of stepTimeouts) clearTimeout(t);
    };
  }, [steps]);

  return (
    <div
      data-ocid={dataOcid}
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: "oklch(17% 0.018 248)",
        border: "1px solid oklch(72% 0.19 186 / 0.2)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "oklch(72% 0.19 186 / 0.15)" }}
        >
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ background: "oklch(72% 0.19 186)" }}
          />
        </div>
        <div>
          <div
            className="text-sm font-semibold"
            style={{ color: "oklch(90% 0.12 186)" }}
          >
            AI Processing
          </div>
          <div className="text-xs" style={{ color: "oklch(58% 0.04 248)" }}>
            SignBridge Neural Engine
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Progress
          value={progress}
          className="h-1.5"
          style={{ background: "oklch(22% 0.025 248)" }}
        />
        <div
          className="text-xs text-right"
          style={{ color: "oklch(58% 0.04 248)" }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
              style={{
                background:
                  i < currentStep
                    ? "oklch(72% 0.19 186 / 0.2)"
                    : i === currentStep
                      ? "oklch(72% 0.19 186 / 0.1)"
                      : "oklch(20% 0.02 248)",
                border:
                  i < currentStep
                    ? "1px solid oklch(72% 0.19 186 / 0.6)"
                    : i === currentStep
                      ? "1px solid oklch(72% 0.19 186 / 0.4)"
                      : "1px solid oklch(28% 0.025 248)",
              }}
            >
              {i < currentStep ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 5L4.5 7.5L8 2.5"
                    stroke="oklch(72% 0.19 186)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : i === currentStep ? (
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "oklch(72% 0.19 186)" }}
                />
              ) : (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(35% 0.03 248)" }}
                />
              )}
            </div>
            <span
              className="text-sm transition-all duration-500"
              style={{
                color:
                  i < currentStep
                    ? "oklch(72% 0.15 186)"
                    : i === currentStep
                      ? "oklch(90% 0.12 186)"
                      : "oklch(45% 0.03 248)",
                fontWeight: i === currentStep ? 600 : 400,
              }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
