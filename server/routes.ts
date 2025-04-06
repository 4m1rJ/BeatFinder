import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from 'path';
import fs from 'fs';
import { runScraper, scheduleScraper } from './new-scraper';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the Event interface
interface Event {
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

// Store events in memory for faster access
let cachedEvents: Event[] = [];

export async function registerRoutes(app: Express): Promise<Server> {
  // Healthcheck endpoint
  app.get("/api/healthcheck", async (_req: Request, res: Response) => {
    return res.json({ ok: true });
  });

  // Get all events
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      // Always read fresh events from file, don't rely on cache
      const dataPath = path.join(__dirname, '..', 'data', 'events.json');
      
      // Check if events file exists
      if (fs.existsSync(dataPath)) {
        const eventsData = fs.readFileSync(dataPath, 'utf8');
        cachedEvents = JSON.parse(eventsData);
      } else {
        // If no file exists, run the scraper
        cachedEvents = await runScraper();
      }

      // Apply filters if provided
      let filteredEvents = [...cachedEvents];
      
      // Filtering logic
      const { 
        region, city, venue, tag, organizer, 
        min_price, max_price, date_from, date_to, age_restriction 
      } = req.query;

      if (region) {
        filteredEvents = filteredEvents.filter(event => 
          event.venue.region.toLowerCase() === (region as string).toLowerCase()
        );
      }

      if (city) {
        filteredEvents = filteredEvents.filter(event => 
          event.venue.city.toLowerCase() === (city as string).toLowerCase()
        );
      }

      if (venue) {
        filteredEvents = filteredEvents.filter(event => 
          event.venue.name.toLowerCase().includes((venue as string).toLowerCase())
        );
      }

      if (tag) {
        filteredEvents = filteredEvents.filter(event => 
          event.tags.some((t: string) => t.toLowerCase().includes((tag as string).toLowerCase()))
        );
      }

      if (organizer) {
        filteredEvents = filteredEvents.filter(event => 
          event.organizers.some((o: string) => o.toLowerCase().includes((organizer as string).toLowerCase()))
        );
      }

      // Price filtering (assuming price is a string that can be parsed)
      if (min_price) {
        filteredEvents = filteredEvents.filter(event => {
          if (!event.price) return false;
          // Extract numeric part of price for comparison
          const priceNum = parseFloat(event.price.replace(/[^0-9.]/g, ''));
          return !isNaN(priceNum) && priceNum >= parseFloat(min_price as string);
        });
      }

      if (max_price) {
        filteredEvents = filteredEvents.filter(event => {
          if (!event.price) return true; // No price could mean free
          // Extract numeric part of price for comparison
          const priceNum = parseFloat(event.price.replace(/[^0-9.]/g, ''));
          return isNaN(priceNum) || priceNum <= parseFloat(max_price as string);
        });
      }

      // Date filtering
      if (date_from) {
        const fromDate = new Date(date_from as string);
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= fromDate;
        });
      }

      if (date_to) {
        const toDate = new Date(date_to as string);
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate <= toDate;
        });
      }

      // Age restriction filtering
      if (age_restriction) {
        filteredEvents = filteredEvents.filter(event => 
          event.age_restriction === age_restriction
        );
      }

      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.page_size as string) || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

      return res.json({
        events: paginatedEvents,
        total: filteredEvents.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredEvents.length / pageSize)
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // Get event by ID
  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Always read fresh events from file
      const dataPath = path.join(__dirname, '..', 'data', 'events.json');
      
      if (fs.existsSync(dataPath)) {
        const eventsData = fs.readFileSync(dataPath, 'utf8');
        cachedEvents = JSON.parse(eventsData);
      } else {
        cachedEvents = await runScraper();
      }
      
      const event = cachedEvents.find(e => e.id === eventId);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      return res.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      return res.status(500).json({ error: 'Failed to fetch event' });
    }
  });

  // Get unique values for filters
  app.get("/api/filters", async (_req: Request, res: Response) => {
    try {
      // Always read fresh events from file
      const dataPath = path.join(__dirname, '..', 'data', 'events.json');
      
      if (fs.existsSync(dataPath)) {
        const eventsData = fs.readFileSync(dataPath, 'utf8');
        cachedEvents = JSON.parse(eventsData);
      } else {
        cachedEvents = await runScraper();
      }
      
      // Extract unique values for filters
      const regions = new Set<string>();
      const cities = new Set<string>();
      const venues = new Set<string>();
      const tags = new Set<string>();
      const organizers = new Set<string>();
      const ageRestrictions = new Set<string>();
      
      cachedEvents.forEach(event => {
        if (event.venue.region) regions.add(event.venue.region);
        if (event.venue.city) cities.add(event.venue.city);
        if (event.venue.name) venues.add(event.venue.name);
        event.tags.forEach((tag: string) => tags.add(tag));
        event.organizers.forEach((org: string) => organizers.add(org));
        if (event.age_restriction) ageRestrictions.add(event.age_restriction);
      });
      
      return res.json({
        regions: Array.from(regions).sort(),
        cities: Array.from(cities).sort(),
        venues: Array.from(venues).sort(),
        tags: Array.from(tags).sort(),
        organizers: Array.from(organizers).sort(),
        ageRestrictions: Array.from(ageRestrictions).sort()
      });
    } catch (error) {
      console.error('Error fetching filters:', error);
      return res.status(500).json({ error: 'Failed to fetch filters' });
    }
  });

  // Manually trigger scraper refresh
  app.post("/api/refresh-events", async (_req: Request, res: Response) => {
    try {
      cachedEvents = await runScraper();
      return res.json({ success: true, eventCount: cachedEvents.length });
    } catch (error) {
      console.error('Error refreshing events:', error);
      return res.status(500).json({ error: 'Failed to refresh events' });
    }
  });

  // Schedule the scraper to run periodically
  scheduleScraper();

  const httpServer = createServer(app);
  return httpServer;
}
