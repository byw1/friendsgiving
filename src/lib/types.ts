export type Status = "going" | "maybe" | "cant";

export type Claim = {
  id: number;
  guestId: number;
  guestName: string;
  itemId: number | null;
  label: string | null;
  note: string | null;
};

export type Item = {
  id: number;
  category: string;
  label: string;
  hint: string | null;
  need: number;
  claims: Claim[];
};

export type Guest = {
  id: number;
  name: string;
  status: Status;
  plusOnes: number;
  bringing: string[];
};

export type Me = {
  id: number;
  name: string;
  email: string;
  status: Status;
  plusOnes: number;
  claims: Claim[];
};

export type State = {
  me: Me | null;
  items: Item[];
  extras: Claim[];
  guests: Guest[];
};
