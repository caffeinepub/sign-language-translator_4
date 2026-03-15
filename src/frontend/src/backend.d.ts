import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TranslationRecord {
    id: bigint;
    outputContent: string;
    spokenLanguage: string;
    mode: string;
    timestamp: bigint;
    inputContent: string;
    signLanguage: string;
}
export interface UserPreferences {
    preferredSpokenLanguage: string;
    preferredSignLanguage: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTranslationRecord(mode: string, inputContent: string, outputContent: string, signLanguage: string, spokenLanguage: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearTranslationHistory(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTranslationHistory(): Promise<Array<TranslationRecord>>;
    getUserPreferences(): Promise<UserPreferences>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUserPreferences(preferredSignLanguage: string, preferredSpokenLanguage: string): Promise<void>;
}
