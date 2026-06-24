'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface ActivityEvent {
  id: number;
  name: string;
  action: string;
  car: string;
  location: string;
  timeAgo: string;
}

const NAMES = [
  'Rahul S.', 'Priya M.', 'Amit K.', 'Sneha R.', 'Vikram P.',
  'Neha G.', 'Arjun D.', 'Kavita S.', 'Rohit T.', 'Anita B.',
  'Deepak N.', 'Pooja V.', 'Sanjay J.', 'Meera L.', 'Karan F.',
];

const CARS = [
  'Honda City', 'Hyundai Creta', 'Maruti Brezza', 'Toyota Fortuner',
  'BMW 3 Series', 'Kia Seltos', 'Tata Nexon', 'Mahindra XUV700',
  'Audi A4', 'Mercedes C-Class', 'Volkswagen Taigun', 'Skoda Kushaq',
];

const LOCATIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
];

const ACTIONS = ['just viewed', 'is interested in', 'saved', 'enquired about'];
const TIMES = ['just now', '2 min ago', '5 min ago', '10 min ago', '15 min ago'];

function generateEvent(id: number): ActivityEvent {
  return {
    id,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
    car: CARS[Math.floor(Math.random() * CARS.length)],
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    timeAgo: TIMES[Math.floor(Math.random() * TIMES.length)],
  };
}

export default function LiveActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const showNextEvent = useCallback(() => {
    if (dismissed) return;

    const event = generateEvent(Date.now());
    setEvents([event]);
    setVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed) return;

    // Show first event after 8 seconds
    const initialDelay = setTimeout(() => {
      showNextEvent();
    }, 8000);

    // Then show every 15-25 seconds
    const interval = setInterval(() => {
      showNextEvent();
    }, 15000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [dismissed, showNextEvent]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && events.length > 0 && (
        <motion.div
          initial={{ x: -100, opacity: 0, y: 20 }}
          animate={{ x: 0, opacity: 1, y: 0 }}
          exit={{ x: -100, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-24 left-4 z-30 max-w-[320px] sm:bottom-20 sm:left-8"
        >
          <div className="glass-card flex items-start gap-3 p-3.5 shadow-xl">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <span className="text-sm font-bold">{events[0].name.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-foreground">
                <span className="font-semibold">{events[0].name}</span>{' '}
                <span className="text-muted-foreground">{events[0].action}</span>{' '}
                <span className="font-semibold">{events[0].car}</span>
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" suppressHydrationWarning />
                {events[0].location} • {events[0].timeAgo}
              </div>
            </div>
            <button
              suppressHydrationWarning
              onClick={() => setDismissed(true)}
              className="shrink-0 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
