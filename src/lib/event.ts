// Everything about the party lives here. Edit this file to update the site.

export const EVENT = {
  title: "Friendsgiving",
  // Saturday Nov 21 2026, 6:00 PM Pacific
  startsAt: "2026-11-22T02:00:00.000Z",
  timeZone: "America/Los_Angeles",
  dateLabel: "Saturday, November 21",
  timeLabel: "6:00 PM",
  place: "The Penthouse",
  placeDetail: "William's office",
  partifulUrl: process.env.PARTIFUL_URL || "",
};

export type Host = {
  name: string;
  role: string;
  // Leave empty until the plan is locked in.
  plan: string;
};

export const HOSTS: Host[] = [
  { name: "William", role: "Host", plan: "" },
  { name: "Marko", role: "Host", plan: "" },
];

export type SeedItem = {
  slug: string;
  category: string;
  label: string;
  hint?: string;
  need: number;
};

export const CATEGORIES = [
  { key: "mains", label: "Mains" },
  { key: "sides", label: "Sides" },
  { key: "dessert", label: "Dessert" },
  { key: "drinks", label: "Drinks" },
  { key: "supplies", label: "Supplies" },
] as const;

export const SEED_ITEMS: SeedItem[] = [
  { slug: "turkey", category: "mains", label: "Turkey", hint: "or any roast", need: 1 },
  { slug: "protein", category: "mains", label: "Another protein", hint: "ham, chicken, wings", need: 2 },

  { slug: "mashed", category: "sides", label: "Mashed potatoes", need: 1 },
  { slug: "mac", category: "sides", label: "Mac & cheese", need: 1 },
  { slug: "stuffing", category: "sides", label: "Stuffing", need: 1 },
  { slug: "veg", category: "sides", label: "Greens or veggies", hint: "green beans, salad", need: 2 },
  { slug: "rolls", category: "sides", label: "Bread & rolls", need: 1 },
  { slug: "cranberry", category: "sides", label: "Cranberry sauce", need: 1 },

  { slug: "pie", category: "dessert", label: "Pie", hint: "pumpkin, apple, pecan", need: 2 },
  { slug: "sweets", category: "dessert", label: "Something sweet", hint: "cookies, brownies", need: 1 },

  { slug: "alcohol", category: "drinks", label: "Alcohol", hint: "wine, beer, a bottle", need: 4 },
  { slug: "chasers", category: "drinks", label: "Chasers & mixers", need: 2 },
  { slug: "soft", category: "drinks", label: "Soda & sparkling water", need: 1 },
  { slug: "ice", category: "drinks", label: "Ice", need: 1 },

  { slug: "cups", category: "supplies", label: "Cups", need: 1 },
  { slug: "plates", category: "supplies", label: "Plates & napkins", need: 1 },
  { slug: "utensils", category: "supplies", label: "Utensils", need: 1 },
];
