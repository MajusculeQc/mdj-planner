import { useState, useMemo } from 'react';

export interface CalendarDay {
    day: number;
    currentMonth: boolean;
    date: string;
}

interface UseCalendarReturn {
    currentDate: Date;
    setCurrentDate: (d: Date) => void;
    calendarDays: CalendarDay[];
    currentMonthStr: string;
    goToPrevMonth: () => void;
    goToNextMonth: () => void;
}

export function useCalendar(initialDate?: Date): UseCalendarReturn {
    const [currentDate, setCurrentDate] = useState(initialDate ?? new Date());

    const calendarDays = useMemo((): CalendarDay[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let startOffset = firstDayOfMonth.getDay();
        startOffset = startOffset === 0 ? 6 : startOffset - 1;

        const days: CalendarDay[] = [];
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        for (let i = startOffset - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, currentMonth: false, date: '' });
        }
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ day: i, currentMonth: true, date: dateStr });
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, currentMonth: false, date: '' });
        }
        return days;
    }, [currentDate]);

    const currentMonthStr = useMemo(() => {
        return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    }, [currentDate]);

    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return {
        currentDate,
        setCurrentDate,
        calendarDays,
        currentMonthStr,
        goToPrevMonth,
        goToNextMonth,
    };
}
