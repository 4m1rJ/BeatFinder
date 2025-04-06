import { useState, useEffect, useCallback } from 'react';
import { Event, EventFilters } from '../types';
import axios from 'axios';

interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useEvents = (filters: EventFilters = {}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Convert filters object to query params
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      queryParams.append('page', page.toString());
      queryParams.append('page_size', '10');
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'city' && value === 'All Locations') {
            // Skip "All Locations" as it means no filter
            return;
          }
          
          if (key === 'tag' && value === 'All Genres') {
            // Skip "All Genres" as it means no filter
            return;
          }
          
          queryParams.append(key, value.toString());
        }
      });
      
      const url = `/api/events?${queryParams.toString()}`;
      const response = await axios.get<EventsResponse>(url);
      
      if (page === 1) {
        // Replace events if it's the first page
        setEvents(response.data.events);
      } else {
        // Append events for subsequent pages
        setEvents(prev => [...prev, ...response.data.events]);
      }
      
      setTotalPages(response.data.totalPages);
      setHasMore(page < response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);
  
  // Load events when page or filters change
  useEffect(() => {
    loadEvents();
  }, [loadEvents, page]);
  
  // Function to load more events (next page)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);
  
  // Function to manually refresh events
  const refreshEvents = useCallback(() => {
    setPage(1);
    loadEvents();
  }, [loadEvents]);
  
  return { 
    events, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refreshEvents, 
    page, 
    totalPages 
  };
};
