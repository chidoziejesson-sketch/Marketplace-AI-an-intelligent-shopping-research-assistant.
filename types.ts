export interface Product {
  name: string;
  description: string;
  price: string;
  platform: string;
  imageUrl: string;
  productUrl: string;
}

export interface EcommerceSource {
  platform: string;
  url: string;
  region: string;
  specialties: string[];
}

export interface GeminiResponse {
  summary: string;
  products: Product[];
  sources: EcommerceSource[];
}

export interface UserPreferences {
  language: string;
  region: string;
  currency: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string | GeminiResponse;
  groundingSources?: GroundingSource[];
  isLoading?: boolean;
}

// This is no longer the primary return type, but kept for structure.
export interface FetchResult {
  data: GeminiResponse;
  groundingSources: GroundingSource[];
}