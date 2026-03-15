import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TranslationRecord, UserPreferences } from "../backend.d";
import { useActor } from "./useActor";

export function useTranslationHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<TranslationRecord[]>({
    queryKey: ["translationHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTranslationHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserPreferences() {
  const { actor, isFetching } = useActor();
  return useQuery<UserPreferences>({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      if (!actor)
        return {
          preferredSignLanguage: "ASL",
          preferredSpokenLanguage: "English",
        };
      return actor.getUserPreferences();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTranslationRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      mode: string;
      inputContent: string;
      outputContent: string;
      signLanguage: string;
      spokenLanguage: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTranslationRecord(
        args.mode,
        args.inputContent,
        args.outputContent,
        args.signLanguage,
        args.spokenLanguage,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["translationHistory"] });
      toast.success("Translation saved to history");
    },
    onError: () => {
      toast.error("Failed to save translation");
    },
  });
}

export function useClearHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearTranslationHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["translationHistory"] });
      toast.success("History cleared");
    },
    onError: () => {
      toast.error("Failed to clear history");
    },
  });
}

export function useSetPreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      signLanguage: string;
      spokenLanguage: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setUserPreferences(args.signLanguage, args.spokenLanguage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
    },
  });
}
