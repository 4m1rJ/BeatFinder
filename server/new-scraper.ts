import axios from 'axios';
import * as cheerio from 'cheerio';
import * as cron from 'node-cron';
import { log } from './vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the event interface to match our application's event structure
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

const BASE_URL = 'https://19hz.info';

/**
 * Scrapes event data from the new 19hz.info website
 */
async function scrapeEvents(region: string = 'sf'): Promise<Event[]> {
  try {
    const url = `${BASE_URL}/${region}/`;
    log(`Scraping events from ${url}`, 'scraper');
    
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const events: Event[] = [];
    
    // Counter for generating unique IDs
    let eventId = 1;
    let venueId = 1;
    
    // Get current date for filtering future events
    const currentDate = new Date();
    
    $('table tr').each((i, element) => {
      if (i === 0) return; // Skip header row
      
      const cols = $(element).find('td');
      if (cols.length < 4) return;
      
      const dateText = $(cols[0]).text().trim();
      const title = $(cols[1]).text().trim();
      const venueInfo = $(cols[2]).text().trim().split(',');
      const infoText = $(cols[3]).text().trim();
      
      // Parse date/time
      const dateParts = dateText.split(' ');
      const date = dateParts[0] || '';
      const time = dateParts.slice(1).join(' ') || '';
      
      // Parse venue information
      const venueName = venueInfo[0]?.trim() || 'Unknown Venue';
      const city = venueInfo[1]?.trim() || 'Unknown City';
      
      // Parse price and age restriction
      const priceMatch = infoText.match(/\$[\d.-]+(?:-\$[\d.-]+)?/);
      const price = priceMatch ? priceMatch[0] : undefined;
      
      const ageMatch = infoText.match(/\d+\+/);
      const ageRestriction = ageMatch ? ageMatch[0] : undefined;
      
      // Extract genres as tags
      const genreMatches = title.toLowerCase().match(/\b(house|techno|trance|dubstep|dnb|drum and bass|bass|electronic|edm|hip-hop|disco|funk)\b/g) || [];
      const tagsSet = new Set<string>();
      genreMatches.forEach(genre => tagsSet.add(genre));
      const tags = Array.from(tagsSet);
      
      // Extract ticket links
      const links: Record<string, string> = {};
      $(cols[3]).find('a').each((_, link) => {
        const name = $(link).text().trim();
        const url = $(link).attr('href') || '';
        if (url) links[name] = url;
      });
      
      // Get the eventUrl from the links
      let eventUrl = '';
      if (Object.keys(links).length > 0) {
        // Use the first link as eventUrl
        eventUrl = Object.values(links)[0];
      }
      
      // Try to determine the event date for filtering
      let eventDate: Date | null = null;
      
      // For the new format, we'll need to parse date differently
      // Assuming formats like "Apr 12" or "April 12"
      try {
        // First try to parse the date using JavaScript's Date
        const dateParsed = new Date(date + " " + new Date().getFullYear());
        if (!isNaN(dateParsed.getTime())) {
          eventDate = dateParsed;
          
          // If the date is already past for this year, it might be for next year
          if (eventDate < currentDate) {
            eventDate.setFullYear(eventDate.getFullYear() + 1);
          }
        }
      } catch (e) {
        // If parsing fails, we'll leave eventDate as null
        console.error(`Error parsing date: ${date}`, e);
      }
      
      // If we still don't have a valid date, try to extract month/day from the format
      if (!eventDate) {
        const monthMatch = date.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i);
        const dayMatch = date.match(/\b(\d{1,2})\b/);
        
        if (monthMatch && dayMatch) {
          const month = monthMatch[1].toLowerCase();
          const day = parseInt(dayMatch[1]);
          
          // Map month abbreviation to month number
          const monthMap: Record<string, number> = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
          };
          
          const monthNum = monthMap[month.substring(0, 3)];
          if (monthNum !== undefined) {
            const year = currentDate.getFullYear();
            eventDate = new Date(year, monthNum, day);
            
            // If the date is already past for this year, it might be for next year
            if (eventDate < currentDate) {
              eventDate.setFullYear(year + 1);
            }
          }
        }
      }
      
      // Only include event if it's in the future or if we couldn't parse the date
      if (!eventDate || eventDate >= currentDate) {
        // Create the event object
        const event: Event = {
          id: eventId++,
          title,
          date,
          time,
          price,
          age_restriction: ageRestriction,
          venue: {
            id: venueId++,
            name: venueName,
            city,
            region: region === 'sf' ? 'Bay Area' : region.toUpperCase()
          },
          tags,
          organizers: [],
          links,
          eventUrl: eventUrl || undefined
        };
        
        events.push(event);
      }
    });
    
    log(`Scraped ${events.length} events successfully from ${region}`, 'scraper');
    return events;
  } catch (error) {
    log(`Error scraping events from ${region}: ${error}`, 'scraper');
    return [];
  }
}

/**
 * Scrape events from multiple regions
 */
async function scrapeAllRegions(): Promise<Event[]> {
  const regions = ['sf', 'la', 'sd', 'seattle'];
  let allEvents: Event[] = [];
  
  for (const region of regions) {
    const events = await scrapeEvents(region);
    allEvents = [...allEvents, ...events];
  }
  
  return allEvents;
}

/**
 * Saves scraped events to a JSON file
 */
function saveEventsToFile(events: Event[]): void {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'events.json');
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    log(`Saved ${events.length} events to ${filePath}`, 'scraper');
  } catch (error) {
    log(`Error saving events to file: ${error}`, 'scraper');
  }
}

/**
 * Main function to run the scraper
 */
export async function runScraper(): Promise<Event[]> {
  const events = await scrapeAllRegions();
  saveEventsToFile(events);
  return events;
}

/**
 * Schedule the scraper to run periodically
 */
export function scheduleScraper(): void {
  // Schedule the scraper to run every 12 hours (at 12:00 and 00:00)
  cron.schedule('0 */12 * * *', async () => {
    log('Running scheduled event scraper', 'scraper');
    await runScraper();
  });
  
  // Run it once immediately on server start
  runScraper();
}