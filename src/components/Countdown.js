import React, { useEffect, useState } from 'react';

const Countdown = ({ airingDay, airingTime }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const getNextAiringDate = () => {
      if (!airingDay || !airingTime) return null;

      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = new Date();
      const targetDay = weekdays.indexOf(airingDay);
      const [hours, minutes] = airingTime.split(':').map(Number);

      // Clone today's date for calculation
      let nextDate = new Date(today);
      nextDate.setHours(hours, minutes, 0, 0);

      // Calculate days until next airing
      let daysUntil = targetDay - today.getDay();
      if (daysUntil < 0) daysUntil += 7; // Next week
      if (daysUntil === 0 && nextDate < today) daysUntil = 7; // Already aired today

      nextDate.setDate(nextDate.getDate() + daysUntil);
      return nextDate;
    };

    const calculateTimeLeft = () => {
      const nextAiring = getNextAiringDate();
      if (!nextAiring) return null;

      const now = new Date();
      const diff = nextAiring - now;

      if (diff <= 0) return null;

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update countdown every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [airingDay, airingTime]);

  if (!timeLeft) {
    return (
      <p className="text-gray-400 text-sm">
        No airing schedule available
      </p>
    );
  }

  return (
    <div className="text-green-400 text-sm">
      <p>Next episode in:</p>
      <div className="font-mono">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}h {' '}
        {String(timeLeft.minutes).padStart(2, '0')}m {' '}
        {String(timeLeft.seconds).padStart(2, '0')}s
      </div>
    </div>
  );
};

export default Countdown;
