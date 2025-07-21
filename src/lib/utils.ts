import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import CONFIG from "@/config/wedding-config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function guestNeedsExtraPhotographer(guests: string): boolean {
  return CONFIG.EXTRA_PHOTO_GUEST_RANGES.includes(guests);
}

export function calculatePostProductionCharges(totalDays: number): number {
  const { base, increment, stepDays } = CONFIG.POST_PRODUCTION_CONFIG;
  if (totalDays <= stepDays) return base;
  const extraBlocks = Math.ceil((totalDays - stepDays) / stepDays);
  return base + extraBlocks * increment;
}

export type EventName =
  | "Engagement"
  | "Sangeet/Cocktail"
  | "Reception"
  | "Wedding"
  | "Pre-Wedding"
  | "Haldi (Bride Side)"
  | "Haldi (Groom Side)"
  | "Haldi (Combined)"
  | "Mehndi (Bride)"
  | "Mehndi (Groom)"
  | "Mehndi (Combined)"
  | "Others";