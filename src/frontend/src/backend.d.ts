import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Labour {
    id: string;
    principal: Principal;
    area: string;
    name: string;
    wage: bigint;
    createdTime: bigint;
    available: boolean;
    skill: string;
    rating: bigint;
    phone: string;
}
export interface User {
    id: string;
    principal: Principal;
    role: UserRole;
    createdTime: bigint;
}
export interface UserProfile {
    name?: string;
    role: UserRole;
    phone?: string;
}
export enum UserRole {
    customer = "customer",
    labour = "labour"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getLaboursBySkillAndArea(skill: string, area: string): Promise<Array<Labour>>;
    getMyLabourProfile(): Promise<Labour | null>;
    getUserInfo(user: Principal): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(role: UserRole): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setLabourAvailability(isAvailable: boolean): Promise<void>;
    updateLabourProfile(name: string, phone: string, skill: string, area: string, wage: bigint): Promise<void>;
}
