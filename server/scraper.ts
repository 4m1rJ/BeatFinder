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

/**
 * Scrapes event data from 19hz.info
 */
async function scrapeEvents(url: string = 'https://19hz.info/eventlisting_BayArea.php'): Promise<Event[]> {
  try {
    log(`Scraping events from ${url}`, 'scraper');
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const events: Event[] = [];
    let eventId = 1;
    let venueId = 1;
    
    // Get current date for filtering future events
    const currentDate = new Date();
    
    // The structure has been identified - main events are in the first table
    const eventRows = $('table').first().find('tr:not(:first-child)');
    log(`Found ${eventRows.length} total event rows`, 'scraper');
    
    eventRows.each((index, element) => {
      const $element = $(element);
      
      // Extract data from table cells
      const cells = $element.find('td');
      
      if (cells.length >= 6) {
        const dateText = $(cells[0]).text().trim();
        const venueText = $(cells[1]).text().trim();
        const titleText = $(cells[2]).text().trim();
        const ageText = $(cells[3]).text().trim();
        const priceText = $(cells[4]).text().trim();
        const linksHtml = $(cells[5]).html() || '';
        
        // Parse venue information
        // Format is usually "Venue Name (City)"
        let venueName = venueText;
        let city = "Unknown";
        const venueMatch = venueText.match(/(.*) \((.*)\)/);
        
        if (venueMatch) {
          venueName = venueMatch[1].trim();
          city = venueMatch[2].trim();
        }
        
        // Parse date and time
        // Format is usually "Day MM/DD/YYYY @ HH:MM PM"
        let date = dateText;
        let time = "";
        const dateMatch = dateText.match(/(.*) @ (.*)/);
        
        if (dateMatch) {
          date = dateMatch[1].trim();
          time = dateMatch[2].trim();
        }
        
        // Extract links
        const links: Record<string, string> = {};
        const $linksContainer = cheerio.load(linksHtml);
        $linksContainer('a').each((i, link) => {
          const href = $linksContainer(link).attr('href') || '';
          const text = $linksContainer(link).text().trim();
          
          if (href && text) {
            links[text] = href;
          }
        });
        
        // Extract tags and organizers from title
        // Organizers are usually in brackets, tags are often hashtags or in parentheses
        const tags: string[] = [];
        const organizers: string[] = [];
        
        // Look for hashtags
        const hashtagMatches = titleText.match(/#(\w+)/g);
        if (hashtagMatches) {
          hashtagMatches.forEach(tag => {
            tags.push(tag.substring(1)); // Remove the # symbol
          });
        }
        
        // Look for content in parentheses as potential tags
        const parensMatches = titleText.match(/\((.*?)\)/g);
        if (parensMatches) {
          parensMatches.forEach(match => {
            const content = match.substring(1, match.length - 1).trim();
            if (content && !tags.includes(content)) {
              tags.push(content);
            }
          });
        }
        
        // Look for content in brackets as potential organizers
        const bracketMatches = titleText.match(/\[(.*?)\]/g);
        if (bracketMatches) {
          bracketMatches.forEach(match => {
            const content = match.substring(1, match.length - 1).trim();
            if (content) {
              organizers.push(content);
            }
          });
        }
        
        // Clean up the title (remove hashtags, brackets, parentheses)
        let cleanTitle = titleText
          .replace(/#\w+/g, '')
          .replace(/\[.*?\]/g, '')
          .replace(/\(.*?\)/g, '')
          .trim();
        
        // Get the eventUrl from the links
        let eventUrl = '';
        if (links['Event Link']) {
          eventUrl = links['Event Link'];
        } else if (links['Facebook Page']) {
          eventUrl = links['Facebook Page'];
        } else if (Object.keys(links).length > 0) {
          // Take the first available link
          eventUrl = Object.values(links)[0];
        }
        
        // Try to determine the event date for filtering
        let eventDate: Date | null = null;
        
        // Common date formats in 19hz: "Fri 04/12/2025", "Sat: May 3", etc.
        // Extract month and day using regex
        const monthDayYearMatch = date.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/);
        if (monthDayYearMatch) {
          const month = parseInt(monthDayYearMatch[1]) - 1; // JS months are 0-indexed
          const day = parseInt(monthDayYearMatch[2]);
          const year = monthDayYearMatch[3] ? parseInt(monthDayYearMatch[3]) : currentDate.getFullYear();
          eventDate = new Date(year, month, day);
          
          // If the date is already past for this year, it might be for next year
          if (eventDate < currentDate && !monthDayYearMatch[3]) {
            eventDate = new Date(year + 1, month, day);
          }
        }
        
        // Only include event if it's in the future or if we couldn't parse the date
        if (!eventDate || eventDate >= currentDate) {
          // Create the event object
          const event: Event = {
            id: eventId++,
            title: cleanTitle,
            date,
            time,
            price: priceText || undefined,
            age_restriction: ageText || undefined,
            venue: {
              id: venueId++,
              name: venueName,
              city,
              region: 'Bay Area' // Default region for the Bay Area URL
            },
            tags,
            organizers,
            links,
            eventUrl: eventUrl || undefined
          };
          
          events.push(event);
        }
      }
    });
    
    log(`Scraped ${events.length} events successfully`, 'scraper');
    return events;
  } catch (error) {
    log(`Error scraping events: ${error}`, 'scraper');
    return [];
  }
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
  const events = await scrapeEvents();
  saveEventsToFile(events);
  return events;
}

/**
 * Schedule the scraper to run periodically (e.g., once every 12 hours)
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