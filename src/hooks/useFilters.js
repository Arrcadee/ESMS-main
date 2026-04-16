import { useState, useMemo } from "react";
import { STATUSES, ROLES } from "../data/constants.js";

export default function useFilters(events, currentUser) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    venue: "",
    dateFrom: "",
    dateTo: "",
  });

  const visibleEvents = useMemo(() => {
    let ev = [...events];

    if (currentUser?.role === ROLES.USER)
      ev = ev.filter(
        (e) => e.status === STATUSES.APPROVED || e.organizerId === currentUser.id,
      );

    if (search)
      ev = ev.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase()),
      );

    if (filters.status) ev = ev.filter((e) => e.status === filters.status);
    if (filters.category) ev = ev.filter((e) => e.category === filters.category);
    if (filters.venue) ev = ev.filter((e) => e.venueId === parseInt(filters.venue));
    if (filters.dateFrom) ev = ev.filter((e) => e.date >= filters.dateFrom);
    if (filters.dateTo) ev = ev.filter((e) => e.date <= filters.dateTo);

    return ev.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, currentUser, search, filters]);

  return { search, setSearch, filters, setFilters, visibleEvents };
}
