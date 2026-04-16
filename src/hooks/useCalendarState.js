import { useState } from "react";

export default function useCalendarState() {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month");

  return {
    calendarDate,
    setCalendarDate,
    calendarView,
    setCalendarView,
  };
}
