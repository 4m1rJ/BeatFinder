import React, { useState } from 'react';
import { Link } from 'wouter';
import { ThemeToggle } from './ThemeToggle';
import { useMonetization } from '../contexts/MonetizationContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { isPremium, togglePremium } = useMonetization();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
                BeatFinder
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/events" 
              className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Events
            </Link>
            <Link 
              href="/venues" 
              className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Venues
            </Link>
            <Link 
              href="/promoters" 
              className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Promoters
            </Link>
            <Link 
              href="/add-event" 
              className="btn-primary"
            >
              Add Event
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu}
              className="p-2 md:hidden rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col gap-2 bg-white dark:bg-slate-800 shadow-lg rounded-b-lg">
            <Link 
              href="/events" 
              className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-4"
            >
              Events
            </Link>
            <Link 
              href="/venues" 
              className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-4"
            >
              Venues
            </Link>
            <Link 
              href="/promoters" 
              className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-4"
            >
              Promoters
            </Link>
            <div className="p-4">
              <Link 
                href="/add-event" 
                className="btn-primary block text-center"
              >
                Add Event
              </Link>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {isPremium ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Premium Active
                </span>
              ) : (
                <button 
                  onClick={togglePremium}
                  className="btn-secondary w-full"
                >
                  Go Premium
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
