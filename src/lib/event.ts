// Everything about the party lives here. Edit this file to update the site.

export const EVENT = {
  title: "Friendsgiving",
  // Saturday Nov 21 2026, 6:00 PM Pacific
  startsAt: "2026-11-22T02:00:00.000Z",
  timeZone: "America/Los_Angeles",
  dateLabel: "Saturday, November 21",
  timeLabel: "6:00 PM",
  place: "The Penthouse",
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
  // Shows a "which one?" picker when someone grabs it.
  options?: string[];
};

export const CATEGORIES = [
  { key: "mains", label: "Mains" },
  { key: "sides", label: "Sides" },
  { key: "dessert", label: "Dessert" },
  { key: "drinks", label: "Drinks" },
  { key: "supplies", label: "Supplies" },
] as const;

export const SEED_ITEMS: SeedItem[] = [
  { slug: "turkey", category: "mains", label: "Turkey", hint: "or any roast", need: 2 },
  { slug: "pizza", category: "mains", label: "Pizza", need: 1 },

  { slug: "mashed", category: "sides", label: "Mashed potatoes", need: 2 },
  { slug: "mac", category: "sides", label: "Mac & cheese", need: 2 },
  { slug: "stuffing", category: "sides", label: "Stuffing", need: 1 },
  { slug: "veg", category: "sides", label: "Greens or veggies", hint: "green beans, salad", need: 2 },
  { slug: "rolls", category: "sides", label: "Bread & rolls", need: 1 },
  { slug: "cranberry", category: "sides", label: "Cranberry sauce", need: 1 },

  { slug: "pie", category: "dessert", label: "Pie", hint: "pumpkin, apple, pecan", need: 2 },

  { slug: "alcohol", category: "drinks", label: "Alcohol", hint: "wine, beer, a bottle", need: 6,
    options: ["Wine", "Beer", "Seltzers", "Tequila", "Vodka", "Whiskey", "Rum", "Soju"] },
  { slug: "chasers", category: "drinks", label: "Chasers & mixers", need: 2,
    options: ["Coke", "Sprite", "Ginger beer", "Tonic", "Club soda", "Cranberry juice", "OJ", "Lime juice"] },
  { slug: "soft", category: "drinks", label: "Soda & sparkling water", need: 1,
    options: ["Coke", "Diet Coke", "Sprite", "Ginger ale", "LaCroix", "Topo Chico"] },

  { slug: "cups", category: "supplies", label: "Cups", need: 1 },
  { slug: "plates", category: "supplies", label: "Plates & napkins", need: 1 },
  { slug: "utensils", category: "supplies", label: "Utensils", need: 1 },
];
