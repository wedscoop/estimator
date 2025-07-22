"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import CONFIG from "@/config/wedding-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { guestNeedsExtraPhotographer } from "@/lib/utils";
import { calculatePostProductionCharges } from "@/lib/utils";
import { EventName } from "@/lib/utils";
import EventPlanSummary from "@/components/EventPlanSummary";

export default function WeddingEstimator() {
  const [preset, setPreset] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);
  const [globalLocation, setGlobalLocation] = useState(CONFIG.LOCATION_OPTIONS[0]); // default location
  
const getDefaultGuests = (scale: "simple" | "standard" | "grand") => {
  return scale === "simple" ? "Up to 50" : "100–350";
};

const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

const toggleExpand = (index: number) => {
  setExpandedIndex((prev) => (prev === index ? null : index));
};

const [outsideLocation, setOutsideLocation] = useState("");


const [showSummaryModal, setShowSummaryModal] = useState(false);
const [clientName, setClientName] = useState("");

const [dialogStep, setDialogStep] = useState<1 | 2>(1);

 
const loadPreset = (label: string) => {
  setPreset(label);

  if (label === CONFIG.PRESET_OPTIONS.BUILD_YOUR_OWN.label) {
    setEvents([]);
    return;
  }

  const selected = CONFIG.PRESET_OPTIONS.ALL.find((p) => p.label === label);
  if (!selected) return;

  // If location is consistent across events, set it globally
  const uniqueLocations = [...new Set(selected.events.map((e) => e.location))];
  if (uniqueLocations.length === 1) {
    setGlobalLocation(uniqueLocations[0]);
  }

  const today = new Date();
  const spacedEvents = selected.events.map((e) => {
    const scale = CONFIG.SCALE_MAP[e.name as EventName];
    const defaultGuests = getDefaultGuests(scale);

    const dateOffset = e.dateOffset || 0;
    const timeSlot = e.timeSlot || "evening";

    return {
      ...e,
      guests: defaultGuests,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + dateOffset),
      timeSlot
    };
  });

  setEvents(spacedEvents);
};


const addEvent = () => {
  const newDate = events.length
    ? addDays(new Date(events[events.length - 1].date), 1)
    : new Date();

  const defaultName = CONFIG.EVENT_OPTIONS[11];
  const defaultScale = CONFIG.SCALE_MAP[defaultName  as EventName];
  const defaultGuests = getDefaultGuests(defaultScale);

  const newEvent = {
    name: defaultName,
    date: newDate,
    guests: defaultGuests,
    timeSlot: "evening",
  };

  const updatedEvents = [...events, newEvent];
  setEvents(updatedEvents);
  setExpandedIndex(updatedEvents.length - 1); // 👈 Expand the new event
};


const updateEvent = (index: number, key: string, value: any) => {
  const updated = [...events];
  updated[index] = { ...updated[index], [key]: value };

  // If name changed, update guest count to match scale
  if (key === "name") {
    const scale = CONFIG.SCALE_MAP[value as EventName];
    if (scale) {
      updated[index].guests = getDefaultGuests(scale);
    }
  }

  setEvents(updated);

  if (key === "date") setOpenPopoverIndex(null);
};



  const removeEvent = (index: number) => {
    const updated = [...events];
    updated.splice(index, 1);
    setEvents(updated);
  };

const confirmAndSendWhatsApp = () => {
  const hasWedding = events.some(e => e.name.toLowerCase() === "wedding");
  if (events.length === 0) {
    alert("Please add at least one event before sending a booking request.");
    return;
  }

  if (!hasWedding) {
    alert("Please include at least one Wedding event before sending a booking request.");
    return;
  }

  setShowSummaryModal(true);
};

const sendWhatsAppRequest = () => {
  const summaryLines = events.map(e => {
    const dateStr = e.date?.toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' });
    return `📸 ${e.name} — ${dateStr} (${e.timeSlot})\n📍 ${e.location || globalLocation} | 👥 ${e.guests}`;
  });

  const message = `Hello Wedscoop,\nI would like to book your wedding photography services.\n\nName: *${clientName}*\nLocation: *${globalLocation === "Outside Delhi/NCR" ? outsideLocation : globalLocation}*\n\n*Events:*\n${summaryLines.join('\n')}\n\nEstimated Cost: *₹${totalCost.toLocaleString("en-IN")}*\n🧾 *18% GST extra subject to billing*\n\nPlease let me know the next steps.`;

  const encodedMsg = encodeURIComponent(message);
  window.open(`https://wa.me/7982921411?text=${encodedMsg}`, "_blank");

  setShowSummaryModal(false); // close modal
};


  const groupedBySlot: Record<string, any[]> = {};
  events.forEach((event) => {
    if (!event.date || !event.timeSlot) return;
    const slotKey = `${format(new Date(event.date), "yyyy-MM-dd")}-${event.timeSlot}`;
    if (!groupedBySlot[slotKey]) groupedBySlot[slotKey] = [];
    groupedBySlot[slotKey].push(event);
  });

// 🧮 Corrected Cost Calculation: merge all slots per date before 1.5x logic
const debugCalculations: string[] = [];

// Step 1: Group all events by date & slot
const groupedByDateAndSlot: Record<string, Record<string, any[]>> = {};
events.forEach((event) => {
  if (!event.date || !event.timeSlot) return;

  const dateKey = format(new Date(event.date), "yyyy-MM-dd");
  const slotKey = event.timeSlot;

  if (!groupedByDateAndSlot[dateKey]) groupedByDateAndSlot[dateKey] = {};
  if (!groupedByDateAndSlot[dateKey][slotKey]) groupedByDateAndSlot[dateKey][slotKey] = [];

  groupedByDateAndSlot[dateKey][slotKey].push(event);
});

let postProductionCost = 0;
let numDays = 0;

if (Object.keys(groupedBySlot).length > 0) {
  const uniqueDates = new Set(
    Object.keys(groupedBySlot).map((k) => k.split("-").slice(0, 3).join("-"))
  );
  numDays = uniqueDates.size;
  postProductionCost = calculatePostProductionCharges(numDays);
}


const totalCost = Object.entries(groupedByDateAndSlot).reduce((total, [date, slotMap]) => {
  const isDestination = globalLocation === CONFIG.LOCATION_OPTIONS[1];
  const slotNames = Object.keys(slotMap);
  const hasMultipleSlots = slotNames.length > 1;

  let hasGrand = false;

  // Step 1: Collect per-slot team sizes
const perSlotTeams: {
  candid: number;
  traditional: number;
  cinematic: number;
  tradVideo: number;
}[] = [];

  slotNames.forEach((slot) => {
    const teamCounts = {
      candid: 0,
      traditional: 0,
      cinematic: 0,
      tradVideo: 0,
    };

    slotMap[slot].forEach((e) => {
      const scale = CONFIG.SCALE_MAP[e.name as EventName];
      if (!scale) return;

      hasGrand = hasGrand || scale === "grand";

      const team = isDestination
        ? CONFIG.TEAM_COMPOSITION.grand
        : CONFIG.TEAM_COMPOSITION[scale];
      if (!team) return;

      teamCounts.candid += team.candid;
      teamCounts.traditional += team.traditional;
      teamCounts.cinematic += team.cinematic;
      teamCounts.tradVideo += team.tradVideo;

      if (guestNeedsExtraPhotographer(e.guests)) {
        teamCounts.traditional += 1;
      }
    });

    perSlotTeams.push(teamCounts);
  });

  // Step 2: Merge roles into photographer and videographer buckets
  const mergedSlotTeams = perSlotTeams.map((t) => ({
    photographers: t.candid + t.traditional,
    videographers: t.cinematic + t.tradVideo,
  }));

  // Step 3: Take the max across all slots on the same day
  let maxPhotographers = 0;
  let maxVideographers = 0;

  mergedSlotTeams.forEach((t) => {
    maxPhotographers = Math.max(maxPhotographers, t.photographers);
    maxVideographers = Math.max(maxVideographers, t.videographers);
  });

  // Step 4: Use candid rate for photographers and cinematic rate for videographers
  const dayBase =
    maxPhotographers * CONFIG.TEAM_RATES.candid +
    maxVideographers * CONFIG.TEAM_RATES.cinematic;

  const multiplier = hasGrand || hasMultipleSlots || isDestination ? 1.5 : 1;
  const dayTotal = multiplier * dayBase;

  debugCalculations.push(
    `📅 ${date} | Slots: [${slotNames.join(", ")}] | 📸 Photographers: ${maxPhotographers}, 🎥 Videographers: ${maxVideographers} | Base: ₹${dayBase} | Multiplier: ${multiplier}x | Total: ₹${dayTotal}`
  );
  
  return total + dayTotal;
}, 0)+ postProductionCost;
debugCalculations.push("――――――――――――――――――――――――――");
debugCalculations.push(`🎬 Post-production charges for ${numDays} day(s): ₹${postProductionCost}`);



  return (

<div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
  
<div className="flex justify-center mb-2">
    <img src="/logo.png" alt="Company Logo" className="h-6 object-contain" />
	
  </div>
  <h1 className="text-2xl font-bold mb-4"><br></br>{CONFIG.PAGE_TITLE}</h1>

      {!preset && (
        <div className="space-y-2">
          <h2 className="font-semibold">Choose a Starting Point:</h2>
          {CONFIG.PRESET_OPTIONS.ALL.map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <input type="radio" id={p.label} name="preset" value={p.label} onChange={() => loadPreset(p.label)} />
              <label htmlFor={p.label}>{p.label}</label>
            </div>
          ))}
        </div>
      )}

{preset && (
  <div className="flex justify-end mb-4">
    <button
      onClick={() => {
        setPreset(null);
        setEvents([]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="text-sm text-grey-600 hover:underline"
    >
      ← Back
    </button>
  </div>
)}

{/* Global Location Selection */}
{preset && (
<Card>
  <CardContent className="space-y-2 mt-0">
    <div className="text-med font-medium">📍 Location:</div>
    <div className="flex flex-wrap gap-3 text-med">
      {CONFIG.LOCATION_OPTIONS.map((opt) => (
        <label key={opt} className="flex items-center gap-1 whitespace-nowrap">
          <input
            type="radio"
            name="location"
            value={opt}
            checked={globalLocation === opt}
            onChange={() => setGlobalLocation(opt)}
            className="accent-green-500 h-4 w-4"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  </CardContent>
</Card>

)}

      {preset && (
        <Card>
          <CardContent className="space-y-2 mt-0">
		  <div className="text-med font-medium">Events:</div>
            {/* Event Blocks */}
{events.map((e, idx) => {
  const isExpanded = expandedIndex === idx;

  return (
    <div key={idx} className="border rounded-xl bg-muted/20 overflow-hidden mb-4">
      <div
        onClick={() => toggleExpand(idx)}
        className="cursor-pointer flex justify-between items-center px-4 py-3 border-b bg-muted hover:bg-muted/40"
      >
        <span className="font-medium">
          Event {idx + 1}: {e.name || "Unnamed Event"}
        </span>
        <span className="text-grey-600 text-xl">
          {isExpanded ? "˄" : "›"}
        </span>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <label className="w-24 font-medium">Event {idx + 1}:</label>
            <Select
              value={e.name}
              onValueChange={(val) => updateEvent(idx, "name", val)}
            >
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
  {CONFIG.EVENT_OPTIONS.map((opt) => {
    const isUsed = events.some((ev, i) => ev.name === opt && i !== idx);
    const isUnique = CONFIG.UNIQUE_EVENTS.includes(opt);
    const isDisabled = isUnique && isUsed;

    return (
      <SelectItem key={opt} value={opt} disabled={isDisabled}>
        {opt}
        {isDisabled && " (Already selected)"}
      </SelectItem>
    );
  })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label className="w-24 font-medium">Date:</label>
            <Popover open={openPopoverIndex === idx} onOpenChange={(open) => setOpenPopoverIndex(open ? idx : null)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full sm:w-72 justify-start text-left font-normal", !e.date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {e.date ? format(e.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={e.date}
                  onSelect={(val) => updateEvent(idx, "date", val)}
                  initialFocus
				  defaultMonth={e.date}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label className="w-24 font-medium">Time Slot:</label>
            <div className="flex gap-4">
              {["day", "evening"].map((slot) => (
                <label key={slot} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={`timeSlot-${idx}`}
                    value={slot}
                    checked={e.timeSlot === slot}
                    onChange={() => updateEvent(idx, "timeSlot", slot)}
                  />
                  {slot.charAt(0).toUpperCase() + slot.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label className="w-24 font-medium">Guests:</label>
            <Select
              value={e.guests}
              onValueChange={(val) => updateEvent(idx, "guests", val)}
            >
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Guest Count" />
              </SelectTrigger>
              <SelectContent>
                {CONFIG.GUEST_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <button
              className="text-sm text-red-500 underline"
              onClick={() => removeEvent(idx)}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
})}



            <Button onClick={addEvent}>+ Add Event</Button>
<div className="mt-6">
              <h2 className="font-semibold text-lg">Event Plan Summary</h2>
              <div className="space-y-4 mt-2 text-sm">
			  </div>
			  </div>
<EventPlanSummary
  groupedBySlot={groupedBySlot}
  globalLocation={globalLocation}
/>

            <div className="mt-6">
              <h2 className="font-semibold">{CONFIG.INCLUSION_TITLE}</h2>
              <ul className="list-disc list-inside text-sm">
                {CONFIG.INCLUSIONS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

          </CardContent>
        </Card>
      )}

<div className="fixed bottom-0 left-0 right-0 bg-rose-50 text-rose-800 border-t shadow z-50 py-3 px-6 text-lg font-semibold">
  <div className="flex justify-between items-center flex-wrap gap-2">
    {/* Left column: cost + tax */}
    <div className="text-base">
      <div>Estimated Total: ₹{totalCost}</div>
      <div className="text-xs font-normal text-rose-700">18% GST extra subject to billing</div>
    </div>

    {/* Right column: button */}
    <div>
      <Button
        size="lg"
        className="px-3 text-base font-semibold"
        onClick={confirmAndSendWhatsApp}
      >
        Request to Book
      </Button>
    </div>
  </div>
</div>


<Dialog open={showSummaryModal} onOpenChange={(open) => {
  setShowSummaryModal(open);
  setDialogStep(1); // Reset on close
}}>
  <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[95vh] overflow-y-auto p-6 sm:p-8 flex flex-col">
  <div className="bg-muted/100 rounded-lg p-5">
    <DialogHeader>
      <DialogTitle className="text-lg sm:text-xl">
        {dialogStep === 1 ? "Review Your Event Plan" : "Confirm Your Details"}
      </DialogTitle>
    </DialogHeader>
<div className="space-y-2 text-sm">
  
</div>
    <div className="flex-1 mt-4 space-y-4 text-sm">
      {dialogStep === 1 && (
        <>
		<div>
    <span className="font-medium">📍 Location:</span>{" "}
    <span>{globalLocation}</span>
  </div>
          <EventPlanSummary
            groupedBySlot={groupedBySlot}
            globalLocation={globalLocation}
			compact={true}
          />
          <div className="mt-4 font-medium text-base">
            💰 Estimated Cost: ₹{totalCost.toLocaleString("en-IN")}
          </div>
		  <div className="text-sm text-muted-foreground">
      🧾 18% GST extra subject to billing
    </div>
        </>
      )}

      {dialogStep === 2 && (
        <div className="space-y-4 text-sm">
  <div>
    <label className="block font-medium mb-1">Your Name:</label>
    <input
      type="text"
      value={clientName}
      onChange={(e) => setClientName(e.target.value)}
      className="w-full border rounded p-2"
      placeholder="Enter your full name"
    />
  </div>

  {globalLocation === "Outside Delhi/NCR" && (
    <div>
      <label className="block font-medium mb-1">Exact Event Location:</label>
      <input
        type="text"
        value={outsideLocation}
        onChange={(e) => setOutsideLocation(e.target.value)}
        className="w-full border rounded p-2"
        placeholder="e.g. Jaipur, Udaipur, Goa..."
      />
    </div>
  )}
</div>
      )}
    </div>

    <DialogFooter className="mt-6 flex justify-between">
      <Button variant="ghost" onClick={() => setShowSummaryModal(false)}>Cancel</Button>
      
      {dialogStep === 1 ? (
        <Button onClick={() => setDialogStep(2)}>Next</Button>
      ) : (
<Button
  disabled={
    !clientName.trim() ||
    (globalLocation === "Outside Delhi/NCR" && !outsideLocation.trim())
  }
  onClick={sendWhatsAppRequest}
>
  Confirm & Send
</Button>
      )}
    </DialogFooter>
	</div>
  </DialogContent>
</Dialog>




    </div>
  );
}
