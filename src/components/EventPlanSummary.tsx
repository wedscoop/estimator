import { format } from "date-fns";
import CONFIG from "@/config/wedding-config";
import { guestNeedsExtraPhotographer } from "@/lib/utils";
import { useState } from "react";
import { EventName } from "@/lib/utils";

export default function EventPlanSummary({
  groupedBySlot,
  globalLocation,
  compact = false,
}: {
  groupedBySlot: Record<string, any[]>;
  globalLocation: string;
  compact?: boolean;
}) {
  const [showTeam, setShowTeam] = useState(false); // Single toggle for all events

  
  const groupedByDate = Object.entries(groupedBySlot)
    .sort(([keyA], [keyB]) => {
      const dateA = keyA.slice(0, keyA.lastIndexOf("-"));
      const dateB = keyB.slice(0, keyB.lastIndexOf("-"));
      const slotA = keyA.slice(keyA.lastIndexOf("-") + 1);
      const slotB = keyB.slice(keyB.lastIndexOf("-") + 1);

      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      if (slotA === "day" && slotB === "evening") return -1;
      if (slotA === "evening" && slotB === "day") return 1;
      return 0;
    })
    .reduce((acc, [slotKey, slotEvents]) => {
      const dateStr = slotKey.slice(0, slotKey.lastIndexOf("-"));
      const slot = slotKey.slice(slotKey.lastIndexOf("-") + 1) as "day" | "evening";
      if (!acc[dateStr]) acc[dateStr] = { day: [], evening: [] };
      acc[dateStr][slot] = slotEvents;
      return acc;
    }, {} as Record<string, Record<"day" | "evening", any[]>>);

  return (
    <div className="space-y-4 text-sm">
      {Object.entries(groupedByDate).map(([dateStr, slots]) => {
        const dateFormatted = format(new Date(dateStr), "PPP");

        return (
          <div key={dateStr} className={compact ? "" : "p-4 bg-muted/10 rounded border"}>
            <div className="text-base font-semibold mb-1">📅 {dateFormatted}</div>

            {["day", "evening"].map((slot) =>
              slots[slot as "day" | "evening"] && slots[slot as "day" | "evening"].length > 0? (
                <div
                  key={slot}
                  className={compact ? "mb-2 ml-4" : "p-3 bg-muted/30 rounded border mb-3"}
                >
                  <div className="font-medium capitalize">🕒 {slot}</div>
                  <div className="ml-4 mt-1 space-y-1">
                    {slots[slot as "day" | "evening"].map((e, i) => {
                      const scale = CONFIG.SCALE_MAP[e.name as EventName];
                      if (!scale) return null;

                      const team =
                        globalLocation === CONFIG.LOCATION_OPTIONS[1]
                          ? CONFIG.TEAM_COMPOSITION.grand
                          : CONFIG.TEAM_COMPOSITION[scale];

                      const extra = guestNeedsExtraPhotographer(e.guests) ? 1 : 0;

                      if (compact) {
                        return (
                          <p key={i} className="text-muted-foreground leading-snug">
                            • {e.name} | {e.guests} guests
                          </p>
                        );
                      }

                      return (
                        <div key={i} className="border-l-2 pl-3 border-muted-foreground">
                          <div className="font-medium">🎉 {e.name}</div>
                          <div>👥 Guests: {e.guests}</div>

                          <div className="mt-2">
                            <button
                              onClick={() => setShowTeam((prev) => !prev)}
                              className="text-sm text-primary hover:underline"
                            >
                              👷 {showTeam ? "Hide Team ▴" : "Show Team ▾"}
                            </button>

                            {showTeam && (
                              <ul className="ml-4 mt-1 list-disc text-sm text-muted-foreground">
                                {team.candid > 0 && (
                                  <li>👤 {team.candid} Candid Photographer(s)</li>
                                )}
                                {team.traditional + extra > 0 && (
                                  <li>
                                    📸 {team.traditional + extra} Traditional Photographer(s)
                                  </li>
                                )}
                                {team.cinematic > 0 && (
                                  <li>🎥 {team.cinematic} Cinematic Videographer(s)</li>
                                )}
                                {team.tradVideo > 0 && (
                                  <li>📽️ {team.tradVideo} Traditional Videographer(s)</li>
                                )}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null
            )}
          </div>
        );
      })}
    </div>
  );
}
