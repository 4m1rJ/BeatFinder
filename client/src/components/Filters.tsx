import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EventFilters } from '../types';

interface FiltersProps {
  onFilterChange: (filters: EventFilters) => void;
}

export const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [location, setLocation] = useState<string>('all_locations');
  const [date, setDate] = useState<string>('any_date');
  const [genre, setGenre] = useState<string>('');
  const [price, setPrice] = useState<string>('any_price');
  const [age, setAge] = useState<string>('any_age');
  
  const handleApplyFilters = () => {
    const filters: EventFilters = {};
    
    if (location && location !== 'all_locations') {
      filters.city = location;
    }
    
    if (date && date !== 'any_date') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };
      
      switch(date) {
        case 'today':
          filters.date_from = formatDate(today);
          filters.date_to = formatDate(today);
          break;
        case 'tomorrow':
          filters.date_from = formatDate(tomorrow);
          filters.date_to = formatDate(tomorrow);
          break;
        case 'this_week':
          filters.date_from = formatDate(today);
          filters.date_to = formatDate(nextWeek);
          break;
        case 'this_month':
          filters.date_from = formatDate(today);
          filters.date_to = formatDate(nextMonth);
          break;
      }
    }
    
    if (genre) filters.tag = genre;
    
    if (price && price !== 'any_price') {
      switch(price) {
        case 'free':
          filters.min_price = 0;
          filters.max_price = 0;
          break;
        case 'under_20':
          filters.min_price = 0;
          filters.max_price = 20;
          break;
        case '20_50':
          filters.min_price = 20;
          filters.max_price = 50;
          break;
        case '50_100':
          filters.min_price = 50;
          filters.max_price = 100;
          break;
        case 'over_100':
          filters.min_price = 100;
          break;
      }
    }
    
    if (age && age !== 'any_age') {
      filters.age_restriction = age;
    }
    
    onFilterChange(filters);
  };
  
  const handleClearFilters = () => {
    setLocation('all_locations');
    setDate('any_date');
    setGenre('');
    setPrice('any_price');
    setAge('any_age');
    onFilterChange({});
  };
  
  const genres = ['House', 'Techno', 'Drum & Bass', 'Trance', 'Dubstep'];
  
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm mb-6">
      <div className="p-5">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Filters</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location" className="mt-1.5 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_locations">All Locations</SelectItem>
                <SelectItem value="San Francisco">San Francisco</SelectItem>
                <SelectItem value="Oakland">Oakland</SelectItem>
                <SelectItem value="San Jose">San Jose</SelectItem>
                <SelectItem value="Sacramento">Sacramento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date" className="text-gray-700 dark:text-gray-300">Date</Label>
            <Select value={date} onValueChange={setDate}>
              <SelectTrigger id="date" className="mt-1.5 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Any Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any_date">Any Date</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Music Genre</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {genres.map((g) => (
                <Button
                  key={g}
                  type="button"
                  variant={genre === g ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGenre(genre === g ? '' : g)}
                  className={genre === g ? 
                    "text-xs brand-gradient-bg text-white border-none hover:opacity-90" : 
                    "text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800"}
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="price" className="text-gray-700 dark:text-gray-300">Price</Label>
            <Select value={price} onValueChange={setPrice}>
              <SelectTrigger id="price" className="mt-1.5 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any_price">Any Price</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="under_20">Under $20</SelectItem>
                <SelectItem value="20_50">$20 - $50</SelectItem>
                <SelectItem value="50_100">$50 - $100</SelectItem>
                <SelectItem value="over_100">Over $100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">Age Restriction</Label>
            <Select value={age} onValueChange={setAge}>
              <SelectTrigger id="age" className="mt-1.5 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Any Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any_age">Any Age</SelectItem>
                <SelectItem value="All Ages">All Ages</SelectItem>
                <SelectItem value="18+">18+</SelectItem>
                <SelectItem value="21+">21+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-3 mt-2">
            <Button type="button" onClick={handleApplyFilters} className="flex-1 brand-gradient-bg hover:opacity-90">
              Apply Filters
            </Button>
            <Button type="button" variant="outline" onClick={handleClearFilters} className="flex-1 border-gray-200 dark:border-gray-700">
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
