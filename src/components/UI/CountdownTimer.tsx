import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface CountdownTimerProps {
  expiresAt: Timestamp;
  onExpire?: () => void;
}

export const CountdownTimer = ({ expiresAt, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const expiryTime = expiresAt.toMillis();
      const difference = expiryTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        if (onExpire) {
          onExpire();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (isExpired) {
    return (
      <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg">
        <Clock className="w-4 h-4 mr-2" />
        <span className="font-medium">Poll has expired</span>
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  const formatTimeUnit = (value: number, unit: string) => {
    if (value === 0) return null;
    return `${value} ${unit}${value !== 1 ? 's' : ''}`;
  };

  const timeUnits = [
    formatTimeUnit(timeLeft.days, 'day'),
    formatTimeUnit(timeLeft.hours, 'hour'),
    formatTimeUnit(timeLeft.minutes, 'minute'),
    formatTimeUnit(timeLeft.seconds, 'second')
  ].filter(Boolean);

  const displayTime = timeUnits.slice(0, 2).join(', ');

  return (
    <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
      <Clock className="w-4 h-4 mr-2" />
      <span className="font-medium">
        {timeLeft.days > 0 || timeLeft.hours > 0 
          ? `Expires in ${displayTime}`
          : `Expires in ${timeLeft.minutes}m ${timeLeft.seconds}s`
        }
      </span>
    </div>
  );
};