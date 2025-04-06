// Define the API base URL - this would be configured based on environment
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Event interface matching the data structure
export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  price?: string;
  age_restriction?: string;
  venue: {
    id: number;
    name: string;
    city: string;
    region: string;
  };
  tags: string[];
  organizers: string[];
  links: Record<string, string>;
  eventUrl?: string; // Direct URL to the event page
}

// Filter interface for event queries
export interface EventFilters {
  region?: string;
  city?: string;
  venue?: string;
  tag?: string;
  organizer?: string;
  min_price?: number;
  max_price?: number;
  date_from?: string;
  date_to?: string;
  age_restriction?: string;
}

// Pagination interface
export interface Pagination {
  page: number;
  page_size: number;
}
