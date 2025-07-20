// wedding-config.ts
const CONFIG = {
  PAGE_TITLE: "Package Builder",

  EVENT_OPTIONS: [
    "Engagement",
    "Haldi (Bride Side)",
    "Haldi (Groom Side)",
    "Haldi (Combined)",
    "Mehndi (Bride)",
    "Mehndi (Groom)",
    "Mehndi (Combined)",
    "Sangeet/Cocktail",
    "Wedding",
    "Pre-Wedding",
    "Reception",
	"Others"
  ],

UNIQUE_EVENTS: ["Engagement",
    "Haldi (Bride Side)",
    "Haldi (Groom Side)",
    "Haldi (Combined)",
    "Mehndi (Bride)",
    "Mehndi (Groom)",
    "Mehndi (Combined)",
    "Wedding",
    "Pre-Wedding",
    "Reception"],

  GUEST_OPTIONS: [
    "Up to 50",
    "50–100",
    "100–350",
    "350–500",
    "500–1000"
  ],

  LOCATION_OPTIONS: ["Delhi/NCR", "Outside Delhi/NCR"],

  EXTRA_PHOTO_GUEST_RANGES: ["350–500", "500–1000"],

  SCALE_MAP: {
    "Engagement": "standard",
    "Sangeet/Cocktail": "standard",
    "Reception": "standard",
    "Wedding": "grand",
    "Pre-Wedding": "simple",
    "Haldi (Bride Side)": "simple",
    "Haldi (Groom Side)": "simple",
    "Haldi (Combined)": "standard",
    "Mehndi (Bride)": "simple",
    "Mehndi (Groom)": "simple",
    "Mehndi (Combined)": "standard",
	"Others": "simple"
  },

POST_PRODUCTION_CONFIG: {
  base: 20000,
  increment: 10000,
  stepDays: 2,
},

  TEAM_COMPOSITION: {
    simple: { candid: 1, traditional: 0, cinematic: 1, tradVideo: 0 },
    standard: { candid: 1, traditional: 1, cinematic: 1, tradVideo: 1 },
    grand: { candid: 2, traditional: 1, cinematic: 2, tradVideo: 1 }
  },

  TEAM_RATES: {
    candid: 10000,
    traditional: 20000,
    cinematic: 10000,
    tradVideo: 20000
  },

  EXTRA_ALBUM_RATE: 10000,

  INCLUSION_TITLE: "Deliverables Included",
  INCLUSIONS: [
    "2 Albums (40 Sheets Each)(200 Pictures per Album)(Glossy/Matte)",
    "3000+ AI Edited Pictures",
    "200 Pictures with Color Grading and Skin Retouching (Client's selection)",
    "Pictures Full Set (Without Editing)",
    "Wedding Film (1-2 Hours)",
    "Cinematic Trailer (3-5 min)",
    "2 Instagram Reels (1 Min Each)"
  ],

  PRESET_OPTIONS: {
    BUILD_YOUR_OWN: { label: "Build Your Own", events: [] },
    ALL: [
      {
        label: "2-Day Wedding (Delhi/NCR)",
		days: 2,
        events: [
		{ name: "Engagement", guests: "100–350", location: "Delhi/NCR", dateOffset: 0, timeSlot: "evening" },
		{ name: "Haldi (Combined)", guests: "100–350", location: "Delhi/NCR", dateOffset: 1, timeSlot: "day" },
        { name: "Wedding", guests: "350–500", location: "Delhi/NCR", dateOffset: 1, timeSlot: "evening" }
        ]
      },
      {
        label: "2-Day Wedding (Destination)",
		days: 2,
        events: [
		  { name: "Engagement", guests: "100–350", location: "Outside Delhi/NCR", dateOffset: 0, timeSlot: "evening" },
		  { name: "Haldi (Combined)", guests: "100–350", location: "Outside Delhi/NCR", dateOffset: 1, timeSlot: "day" },
          { name: "Wedding", guests: "350–500", location: "Outside Delhi/NCR", dateOffset: 1, timeSlot: "evening" }
        ]
      },
      {
        label: "3-Day Wedding (Delhi NCR)",
		days: 3,
        events: [
           
		  { name: "Engagement", guests: "100–350", location: "Delhi/NCR", dateOffset: 0, timeSlot: "evening" },
		  { name: "Mehndi (Combined)", guests: "100–350", location: "Delhi/NCR", dateOffset: 1, timeSlot: "day" },
          { name: "Sangeet/Cocktail", guests: "100–350", location: "Delhi / NCR", dateOffset: 1, timeSlot: "evening" },
		  { name: "Haldi (Combined)", guests: "100–350", location: "Delhi/NCR", dateOffset: 2, timeSlot: "day" },
          { name: "Wedding", guests: "350–500", location: "Delhi/NCR", dateOffset: 2, timeSlot: "evening" }
        ]
      },
      {
        label: "Build Your Own Package",
        events: []
      }
    ]
  }
};

export default CONFIG;
