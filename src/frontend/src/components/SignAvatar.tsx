import { useCallback, useEffect, useRef, useState } from "react";

interface SignAvatarProps {
  isPlaying: boolean;
  words: { word: string; sign: string }[];
  onWordChange?: (index: number) => void;
}

interface Pose {
  lEx: number;
  lEy: number;
  lHx: number;
  lHy: number;
  rEx: number;
  rEy: number;
  rHx: number;
  rHy: number;
  label: string;
}

// Each pose defines shoulder->elbow->hand for left and right arm.
// Shoulders are at (50,75) left and (90,75) right.
const POSES: Pose[] = [
  // 0: IDLE - arms relaxed at sides
  {
    lEx: 38,
    lEy: 112,
    lHx: 28,
    lHy: 142,
    rEx: 102,
    rEy: 112,
    rHx: 112,
    rHy: 142,
    label: "idle",
  },
  // 1: Both arms raised high
  {
    lEx: 38,
    lEy: 52,
    lHx: 18,
    lHy: 28,
    rEx: 102,
    rEy: 52,
    rHx: 122,
    rHy: 28,
    label: "both-up",
  },
  // 2: Left arm up, right arm across chest
  {
    lEx: 33,
    lEy: 52,
    lHx: 15,
    lHy: 30,
    rEx: 55,
    rEy: 88,
    rHx: 38,
    rHy: 78,
    label: "l-up-r-chest",
  },
  // 3: Right arm up, left arm at side
  {
    lEx: 40,
    lEy: 112,
    lHx: 30,
    lHy: 142,
    rEx: 102,
    rEy: 50,
    rHx: 124,
    rHy: 26,
    label: "r-up",
  },
  // 4: Both hands at face/chin level
  {
    lEx: 46,
    lEy: 66,
    lHx: 54,
    lHy: 50,
    rEx: 94,
    rEy: 66,
    rHx: 86,
    rHy: 50,
    label: "chin",
  },
  // 5: Arms crossed
  {
    lEx: 58,
    lEy: 86,
    lHx: 90,
    lHy: 80,
    rEx: 82,
    rEy: 86,
    rHx: 50,
    rHy: 80,
    label: "crossed",
  },
  // 6: Left arm extended forward, right arm at side
  {
    lEx: 30,
    lEy: 76,
    lHx: 8,
    lHy: 74,
    rEx: 102,
    rEy: 110,
    rHx: 112,
    rHy: 134,
    label: "l-forward",
  },
  // 7: Right arm extended, left arm at side
  {
    lEx: 40,
    lEy: 110,
    lHx: 30,
    lHy: 134,
    rEx: 110,
    rEy: 76,
    rHx: 132,
    rHy: 74,
    label: "r-forward",
  },
  // 8: Both arms spread wide
  {
    lEx: 26,
    lEy: 80,
    lHx: 6,
    lHy: 78,
    rEx: 114,
    rEy: 80,
    rHx: 134,
    rHy: 78,
    label: "wide",
  },
  // 9: V-shape (victory) — both arms angled up-out
  {
    lEx: 43,
    lEy: 60,
    lHx: 28,
    lHy: 36,
    rEx: 97,
    rEy: 60,
    rHx: 112,
    rHy: 36,
    label: "v-up",
  },
];

const IDLE_POSE = POSES[0];

function getPoseForWord(sign: string, index: number): Pose {
  const hash = sign.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const poseIndex = ((index + hash) % (POSES.length - 1)) + 1;
  return POSES[poseIndex];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const TRANSITION_MS = 260;

export function SignAvatar({
  isPlaying,
  words,
  onWordChange,
}: SignAvatarProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayPose, setDisplayPose] = useState<Pose>(IDLE_POSE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const transitionStartRef = useRef<number>(0);
  const fromPoseRef = useRef<Pose>(IDLE_POSE);
  const targetPoseRef = useRef<Pose>(IDLE_POSE);
  const displayPoseRef = useRef<Pose>(IDLE_POSE);

  // Keep displayPoseRef in sync without triggering re-renders
  displayPoseRef.current = displayPose;

  const startTransition = useCallback((newTarget: Pose) => {
    targetPoseRef.current = newTarget;
    fromPoseRef.current = { ...displayPoseRef.current };
    transitionStartRef.current = performance.now();

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const animate = (now: number) => {
      const elapsed = now - transitionStartRef.current;
      const t = Math.min(elapsed / TRANSITION_MS, 1);
      const eased = 1 - (1 - t) ** 3;
      const from = fromPoseRef.current;
      const to = targetPoseRef.current;
      const next: Pose = {
        lEx: lerp(from.lEx, to.lEx, eased),
        lEy: lerp(from.lEy, to.lEy, eased),
        lHx: lerp(from.lHx, to.lHx, eased),
        lHy: lerp(from.lHy, to.lHy, eased),
        rEx: lerp(from.rEx, to.rEx, eased),
        rEy: lerp(from.rEy, to.rEy, eased),
        rHx: lerp(from.rHx, to.rHx, eased),
        rHy: lerp(from.rHy, to.rHy, eased),
        label: to.label,
      };
      setDisplayPose(next);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isPlaying && words.length > 0) {
      setCurrentWordIndex(0);
      startTransition(getPoseForWord(words[0].sign, 0));
      onWordChange?.(0);
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex((prev) => {
          const next = (prev + 1) % words.length;
          onWordChange?.(next);
          startTransition(getPoseForWord(words[next].sign, next));
          return next;
        });
      }, 1500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      startTransition(IDLE_POSE);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, words, onWordChange, startTransition]);

  const currentWord = words[currentWordIndex];
  const p = displayPose;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          width: "100%",
          maxWidth: 340,
          height: 280,
          background:
            "radial-gradient(ellipse at center, oklch(20% 0.04 186) 0%, oklch(13% 0.012 250) 70%)",
          border: "1px solid oklch(72% 0.19 186 / 0.2)",
        }}
      >
        <div
          className="absolute inset-0 grid-glow opacity-30"
          aria-hidden="true"
        />

        {isPlaying && (
          <>
            <div
              className="absolute rounded-full animate-pulse-ring"
              style={{
                width: 180,
                height: 180,
                border: "1px solid oklch(72% 0.19 186 / 0.3)",
              }}
            />
            <div
              className="absolute rounded-full animate-pulse-ring"
              style={{
                width: 240,
                height: 240,
                border: "1px solid oklch(72% 0.19 186 / 0.15)",
                animationDelay: "0.5s",
              }}
            />
          </>
        )}

        <svg
          width="140"
          height="220"
          viewBox="0 0 140 220"
          className="relative z-10"
          aria-label={
            isPlaying && currentWord
              ? `Signing: ${currentWord.sign}`
              : "Sign language avatar"
          }
          role="img"
          style={{
            filter: isPlaying
              ? "drop-shadow(0 0 12px oklch(72% 0.19 186 / 0.8))"
              : "drop-shadow(0 0 4px oklch(72% 0.19 186 / 0.3))",
          }}
        >
          <title>
            {isPlaying && currentWord
              ? `Signing: ${currentWord.sign}`
              : "Sign language avatar"}
          </title>

          {/* Head */}
          <circle
            cx="70"
            cy="30"
            r="22"
            fill="none"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2.5"
          />
          <circle cx="62" cy="27" r="3" fill="oklch(72% 0.19 186)" />
          <circle cx="78" cy="27" r="3" fill="oklch(72% 0.19 186)" />
          <path
            d="M 62 35 Q 70 42 78 35"
            fill="none"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Neck */}
          <line
            x1="70"
            y1="52"
            x2="70"
            y2="68"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2.5"
          />
          {/* Torso */}
          <line
            x1="70"
            y1="68"
            x2="70"
            y2="140"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2.5"
          />
          {/* Shoulders */}
          <line
            x1="50"
            y1="75"
            x2="90"
            y2="75"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Hips */}
          <line
            x1="50"
            y1="140"
            x2="90"
            y2="140"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2"
          />
          {/* Legs */}
          <line
            x1="50"
            y1="140"
            x2="40"
            y2="190"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2.5"
          />
          <line
            x1="40"
            y1="190"
            x2="35"
            y2="210"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2.5"
          />
          <line
            x1="90"
            y1="140"
            x2="100"
            y2="190"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2.5"
          />
          <line
            x1="100"
            y1="190"
            x2="105"
            y2="210"
            stroke="oklch(72% 0.19 186)"
            strokeWidth="2.5"
          />

          {/* Left arm: shoulder(50,75) -> elbow -> hand */}
          <line
            x1="50"
            y1="75"
            x2={p.lEx}
            y2={p.lEy}
            stroke="oklch(78% 0.17 74)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1={p.lEx}
            y1={p.lEy}
            x2={p.lHx}
            y2={p.lHy}
            stroke="oklch(78% 0.17 74)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={p.lHx}
            cy={p.lHy}
            r="6"
            fill="oklch(78% 0.17 74 / 0.25)"
            stroke="oklch(78% 0.17 74)"
            strokeWidth="2"
          />
          <line
            x1={p.lHx}
            y1={p.lHy}
            x2={p.lHx - 5}
            y2={p.lHy - 8}
            stroke="oklch(78% 0.17 74 / 0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1={p.lHx}
            y1={p.lHy}
            x2={p.lHx + 4}
            y2={p.lHy - 9}
            stroke="oklch(78% 0.17 74 / 0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Right arm: shoulder(90,75) -> elbow -> hand */}
          <line
            x1="90"
            y1="75"
            x2={p.rEx}
            y2={p.rEy}
            stroke="oklch(78% 0.17 74)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1={p.rEx}
            y1={p.rEy}
            x2={p.rHx}
            y2={p.rHy}
            stroke="oklch(78% 0.17 74)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={p.rHx}
            cy={p.rHy}
            r="6"
            fill="oklch(78% 0.17 74 / 0.25)"
            stroke="oklch(78% 0.17 74)"
            strokeWidth="2"
          />
          <line
            x1={p.rHx}
            y1={p.rHy}
            x2={p.rHx - 4}
            y2={p.rHy - 9}
            stroke="oklch(78% 0.17 74 / 0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1={p.rHx}
            y1={p.rHy}
            x2={p.rHx + 5}
            y2={p.rHy - 8}
            stroke="oklch(78% 0.17 74 / 0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {isPlaying && <div className="animate-scan" />}

        {isPlaying && currentWord && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-mono font-semibold"
            style={{
              background: "oklch(72% 0.19 186 / 0.15)",
              border: "1px solid oklch(72% 0.19 186 / 0.4)",
              color: "oklch(90% 0.12 186)",
            }}
          >
            {currentWord.sign}
          </div>
        )}

        {!isPlaying && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-mono"
            style={{
              background: "oklch(20% 0.02 248 / 0.8)",
              color: "oklch(58% 0.04 248)",
            }}
          >
            IDLE
          </div>
        )}
      </div>

      {isPlaying && currentWord && (
        <div className="text-center">
          <div className="text-sm" style={{ color: "oklch(58% 0.04 248)" }}>
            Signing
          </div>
          <div
            className="text-2xl font-display font-bold"
            style={{ color: "oklch(90% 0.12 186)" }}
          >
            &ldquo;{currentWord.word}&rdquo;
          </div>
          <div
            className="text-xs font-mono mt-1"
            style={{ color: "oklch(78% 0.17 74)" }}
          >
            → {currentWord.sign}
          </div>
        </div>
      )}
    </div>
  );
}
