export interface Transaction {
  id: string;
  type: "receive" | "spend";
  amount: number;
  description: string;
  date: string;
  category: "shopping" | "dining" | "transport" | "housing" | "salary" | "investment" | "utilities" | "transfer" | "other";
  partnerBank?: string;
  partnerAccount?: string;
}

export interface SavingsJar {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: "car" | "home" | "education" | "travel" | "emergency" | "other";
  createdAt: string;
}

export interface CreditCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardType: "visa" | "mastercard";
  status: "active" | "locked";
  designStyle: "slate" | "neon" | "gold" | "cyberpunk";
  creditLimit: number;
  currentBalance: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface BankState {
  balance: number;
  savingsBalance: number;
  points: number;
  savingsJars: SavingsJar[];
  cards: CreditCard[];
  recentTransactions: Transaction[];
}
