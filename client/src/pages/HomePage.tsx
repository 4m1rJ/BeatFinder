import React, { useState, useEffect } from 'react';
import { EventFilters } from '../types';
import { Header } from '../components/Header';
import { Filters } from '../components/Filters';
import { EventList } from '../components/EventCard';
import { useMonetization } from '../contexts/MonetizationContext';
import { AdHeader } from '../components/AdHeader';
import { AdBanner } from '../components/AdBanner';
import { AdSidebar } from '../components/AdSidebar';
import { PremiumFeature } from '../components/PremiumFeature';
import { Button } from '@/components/ui/button';
import { 
  SlidersHorizontal, 
  Search, 
  Music, 
  Calendar, 
  MapPin,
  ArrowRight
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const HomePage: React.FC = () => {
  const [filters, setFilters] = useState<EventFilters>({});
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { showAds } = useMonetization();
  
  // Check if mobile on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Quick location filters
  const handleLocationQuickFilter = (city?: string) => {
    setFilters(prev => ({ ...prev, city }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      <Header />
      
      {/* Hero Section with Gradient Background */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-pink-500/20 dark:from-indigo-900/30 dark:to-pink-800/30"></div>
        <div className="container-custom relative z-10 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="brand-gradient-text text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover Electronic Music Events
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300">
              Find the best electronic music events, venues, and DJs all in one place.
              Never miss a beat with BeatFinder.
            </p>
            
            {/* Search Box */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="search" 
                  className="w-full py-3 pl-10 pr-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="Search events, artists, or venues..."
                />
              </div>
            </div>
            
            {/* Featured Cities */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {['San Francisco', 'Oakland', 'Los Angeles', 'San Diego', 'Seattle'].map((city) => (
                <Button 
                  key={city}
                  variant={filters.city === city ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLocationQuickFilter(city)}
                  className="text-sm rounded-full px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                >
                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  {city}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Ad Header (if not premium) */}
      {showAds && <AdHeader />}
      
      {/* Event Categories */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Popular Categories
            </h2>
            <Button variant="link" className="text-indigo-600 dark:text-indigo-400 font-medium">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'House', icon: <Music className="h-6 w-6" /> },
              { name: 'Techno', icon: <Music className="h-6 w-6" /> },
              { name: 'Bass', icon: <Music className="h-6 w-6" /> },
              { name: 'Trance', icon: <Music className="h-6 w-6" /> }
            ].map((category) => (
              <div 
                key={category.name} 
                className="card-hover bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, tag: category.name }))}
              >
                <div className="flex-center mb-3 mx-auto w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  {category.icon}
                </div>
                <h3 className="font-medium">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section id="events" className="py-12 bg-gray-50 dark:bg-slate-950">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar with filters - hidden on mobile by default */}
            <div className={`md:w-1/4 ${isMobile && !showMobileFilters ? 'hidden' : ''}`}>
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
                <h2 className="text-lg font-medium mb-4">Filter Events</h2>
                <Filters onFilterChange={setFilters} />
              </div>
              
              {showAds && <AdSidebar />}
              <PremiumFeature />
            </div>
            
            {/* Mobile filter toggle */}
            {isMobile && (
              <Button 
                className="mb-4 w-full"
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            )}
            
            {/* Main content */}
            <div className="md:w-3/4">
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-2xl font-bold mb-4 md:mb-0">
                    Upcoming Events
                    {filters.city && <span className="text-indigo-600 dark:text-indigo-400"> in {filters.city}</span>}
                  </h2>
                  
                  <div className="flex items-center">
                    <label htmlFor="sort" className="text-sm text-gray-600 dark:text-gray-400 mr-2">Sort by:</label>
                    <Select defaultValue="date_asc">
                      <SelectTrigger id="sort" className="w-[180px]">
                        <SelectValue placeholder="Date (Soonest)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date_asc">Date (Soonest)</SelectItem>
                        <SelectItem value="date_desc">Date (Latest)</SelectItem>
                        <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                        <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Event List with Infinite Scrolling */}
                <EventList filters={filters} />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 brand-gradient-bg text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover More with BeatFinder Premium</h2>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Get access to exclusive features, ad-free browsing, and personalized recommendations.
          </p>
          <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all">
            Try Premium Free
          </Button>
        </div>
      </section>
      
      {/* Bottom Ad Banner (if not premium) */}
      {showAds && (
        <div className="bg-gray-50 dark:bg-slate-900 py-8">
          <div className="container-custom">
            <AdBanner />
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
                  BeatFinder
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                Your ultimate source for electronic music events. Find the best parties, raves, and shows near you.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">About Us</a></li>
                <li><a href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a></li>
                <li><a href="/premium" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Premium</a></li>
                <li><a href="/help" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</a></li>
                <li><a href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 text-center">
            <p>&copy; {new Date().getFullYear()} BeatFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
