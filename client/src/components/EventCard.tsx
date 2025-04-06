import React, { useRef, useCallback } from 'react';
import { Event } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Music, ExternalLink, Tag, Users } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Try to parse the date string
  let formattedDate = '';
  let isValidDate = false;
  
  try {
    const eventDate = new Date(event.date);
    // Check if date is valid (not Invalid Date)
    if (!isNaN(eventDate.getTime())) {
      formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      isValidDate = true;
    }
  } catch (e) {
    // If error in parsing, keep default empty string
  }
  
  // Check if event is today
  const isToday = () => {
    if (!isValidDate) return false;
    
    const today = new Date();
    const eventDate = new Date(event.date);
    return eventDate.getDate() === today.getDate() &&
           eventDate.getMonth() === today.getMonth() &&
           eventDate.getFullYear() === today.getFullYear();
  };
  
  // Extract venue information
  const venueInfo = event.venue?.name || 'Unknown Venue';
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700">
      <div className="relative">
        {/* Top Edge Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-pink-500" />
        
        {/* Date Badge (for today's events) */}
        {isToday() && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-600 text-white border-none">Today</Badge>
          </div>
        )}
        
        {/* Price/Age Badge */}
        <div className="absolute top-3 right-3 flex gap-2">
          {event.price && (
            <Badge variant="outline" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              {event.price === 'Free' ? 'Free' : event.price}
            </Badge>
          )}
          {event.age_restriction && (
            <Badge variant="outline" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              {event.age_restriction}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-5">
        {/* Event Title */}
        <h3 className="text-xl font-bold mb-2.5 text-gray-900 dark:text-white leading-7">
          {event.title}
        </h3>
        
        {/* Event Details */}
        <div className="space-y-2.5 mb-4">
          {/* Date Information */}
          {(isValidDate || event.date) && (
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium">{isValidDate ? formattedDate : event.date}</span>
            </div>
          )}
          
          {/* Time Information - separate from date */}
          {event.time && (
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>{event.time}</span>
            </div>
          )}
          
          {/* Venue Information */}
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span className="truncate">
              {venueInfo}
              {event.venue?.city && `, ${event.venue.city}`}
            </span>
          </div>
          
          {/* Organizers */}
          {event.organizers && event.organizers.length > 0 && (
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Users className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span className="truncate">{event.organizers.join(', ')}</span>
            </div>
          )}
        </div>
        
        {/* Event Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Tag className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs uppercase tracking-wide font-semibold text-gray-700 dark:text-gray-300">Genres</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.tags.slice(0, 4).map((tag, index) => (
                <Badge 
                  key={`${event.id}-tag-${index}`} 
                  variant="secondary" 
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 4 && (
                <Badge variant="outline" className="bg-white dark:bg-transparent text-gray-600 dark:text-gray-400">
                  +{event.tags.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-5">
          {event.links && event.links.tickets && (
            <Button className="flex-1 brand-gradient-bg hover:opacity-90 shadow-sm hover:shadow transition-all" asChild>
              <a 
                href={event.links.tickets} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {event.price === 'Free' ? 'RSVP' : 'Get Tickets'}
              </a>
            </Button>
          )}
          
          {event.eventUrl && (
            <Button variant="outline" size="icon" className="border-gray-200 dark:border-gray-800" asChild>
              <a 
                href={event.eventUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="View event details"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface EventListProps {
  filters: Record<string, any>;
}

export const EventList: React.FC<EventListProps> = ({ filters }) => {
  const { events, loading, error, hasMore, loadMore } = useEvents(filters);
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastEventElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);
  
  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-2">Error loading events</p>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }
  
  if (events.length === 0 && !loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No events found with the current filters</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <div 
            key={event.id} 
            ref={index === events.length - 1 ? lastEventElementRef : undefined}
            className="h-full"
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="text-center py-6">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Loading more events...</p>
        </div>
      )}
      
      {!hasMore && events.length > 0 && (
        <div className="text-center py-6 text-gray-600 dark:text-gray-400 font-medium">
          You've reached the end of the list
        </div>
      )}
    </div>
  );
};
