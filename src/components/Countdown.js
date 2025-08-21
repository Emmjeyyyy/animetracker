import React, { useEffect, useState } from 'react';

const Countdown = ({ airingDay, airingTime, timeZone = 'JST' }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const getTzOffsetHours = (tz) => {
      if (!tz) return 9; // default to JST
      const s = String(tz);
      if (s === 'JST' || s === 'Asia/Tokyo') return 9;
      const m = s.match(/^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/i);
      if (m) {
        const sign = m[1] === '-' ? -1 : 1;
        const hh = parseInt(m[2] || '0', 10);
        const mm = parseInt(m[3] || '0', 10);
        return sign * (hh + mm / 60);
      }
      return 9; // fallback JST
    };

    const getNextAiringDate = () => {
      if (!airingDay || !airingTime) return null;

      // Normalize day (Jikan may return "Sundays")
      const dayName = String(airingDay).trim();
      const normalizedDay = dayName.endsWith('s') ? dayName.slice(0, -1) : dayName;
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = weekdays.indexOf(normalizedDay);
      if (targetDay === -1) return null;

      // Clean time e.g., "00:30 (JST)" -> "00:30"
      const timeClean = String(airingTime).replace(/[^0-9:]/g, '');
      const [hStr, mStr] = timeClean.split(':');
      let hours = parseInt(hStr, 10);
      let minutes = parseInt(mStr, 10);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

      const tzOffsetHours = getTzOffsetHours(timeZone);
      const tzOffsetMin = tzOffsetHours * 60;
      const nowUtcMs = Date.now();
      const tzNowMs = nowUtcMs + tzOffsetMin * 60000; // wall-clock in source TZ (as UTC-based date)

      // Floor to start of day in source TZ using UTC setters to avoid local timezone interference
      const tzBase = new Date(tzNowMs);
      tzBase.setUTCHours(0, 0, 0, 0);

      // Handle times like 24:xx by rolling to next day
      let carryDays = 0;
      if (hours >= 24) {
        carryDays += Math.floor(hours / 24);
        hours = hours % 24;
      }

      // Search the next 7 days for the first matching weekday/time in source TZ that is in the future
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(tzBase.getTime());
        d.setUTCDate(d.getUTCDate() + i);
        if (d.getUTCDay() !== targetDay) continue;
        const candidateTz = new Date(d.getTime());
        candidateTz.setUTCHours(hours, minutes, 0, 0);
        if (carryDays) candidateTz.setUTCDate(candidateTz.getUTCDate() + carryDays);
        const candidateUtcMs = candidateTz.getTime() - tzOffsetMin * 60000;
        if (candidateUtcMs > now.getTime()) {
          return new Date(candidateUtcMs);
        }
      }

      // Fallback: push one week ahead from the next occurrence of the target day
      const d = new Date(tzBase.getTime());
      // move to next occurrence of targetDay
      let delta = (targetDay - d.getUTCDay() + 7) % 7;
      d.setUTCDate(d.getUTCDate() + delta + 7);
      d.setUTCHours(hours, minutes, 0, 0);
      if (carryDays) d.setUTCDate(d.getUTCDate() + carryDays);
      const candidateUtcMs = d.getTime() - tzOffsetMin * 60000;
      return new Date(candidateUtcMs);
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

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [airingDay, airingTime, timeZone]);

  if (!timeLeft) {
    return (
      <p className="text-gray-400 text-sm">No airing schedule available</p>
    );
  }

  return (
    <div className="text-green-400 text-sm">
      <p>Next episode in:</p>
      <div className="font-mono">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}h{' '}
        {String(timeLeft.minutes).padStart(2, '0')}m{' '}
        {String(timeLeft.seconds).padStart(2, '0')}s
      </div>
    </div>
  );
};

export default Countdown;
