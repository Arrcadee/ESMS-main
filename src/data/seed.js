// ─── SEED DATA ────────────────────────────────────────────────────────────────

import { ROLES, STATUSES } from './constants.js';

const today = new Date();
const fmtDate = (d) => d.toISOString().split("T")[0];
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const initialUsers = [
  { id: 1, name: "Dr. Adaeze Okafor", email: "admin@esms.edu", password: "admin123", role: ROLES.SUPER_ADMIN, avatar: "AO", department: "Administration", createdAt: "2024-01-01" },
  { id: 2, name: "Prof. Emmanuel Nwachukwu", email: "e.nwachukwu@esms.edu", password: "pass123", role: ROLES.ADMIN, avatar: "EN", department: "Academic Affairs", createdAt: "2024-01-05" },
  { id: 3, name: "Chisom Eze", email: "c.eze@esms.edu", password: "pass123", role: ROLES.ORGANIZER, avatar: "CE", department: "Student Affairs", createdAt: "2024-01-10" },
  { id: 4, name: "Tobenna Obi", email: "t.obi@esms.edu", password: "pass123", role: ROLES.ORGANIZER, avatar: "TO", department: "Sports & Recreation", createdAt: "2024-01-12" },
  { id: 5, name: "Ngozi Amadi", email: "n.amadi@esms.edu", password: "pass123", role: ROLES.USER, avatar: "NA", department: "Engineering", createdAt: "2024-02-01" },
  { id: 6, name: "Ikenna Chukwu", email: "i.chukwu@esms.edu", password: "pass123", role: ROLES.USER, avatar: "IC", department: "Sciences", createdAt: "2024-02-05" },
];

export const initialVenues = [
  { id: 1, name: "Main Auditorium", capacity: 800, building: "Main Block", facilities: ["Projector", "AC", "Sound System", "Stage"] },
  { id: 2, name: "Conference Hall A", capacity: 150, building: "Admin Block", facilities: ["Projector", "AC", "Whiteboard"] },
  { id: 3, name: "Lecture Hall 101", capacity: 200, building: "Academic Block 1", facilities: ["Projector", "AC"] },
  { id: 4, name: "Sports Complex", capacity: 1200, building: "Sports Ground", facilities: ["Floodlights", "Sound System", "Bleachers"] },
  { id: 5, name: "ICT Lab", capacity: 60, building: "Science Block", facilities: ["Computers", "Projector", "AC"] },
  { id: 6, name: "Seminar Room B2", capacity: 80, building: "Admin Block", facilities: ["Projector", "Whiteboard"] },
];

export const initialEvents = [
  {
    id: 1, title: "Annual Science Exhibition",
    description: "Showcase of student research projects and innovations from all departments.",
    category: "Academic", date: fmtDate(addDays(today, 5)),
    startTime: "09:00", endTime: "17:00", venueId: 1, organizerId: 3,
    status: STATUSES.APPROVED, createdAt: fmtDate(addDays(today, -10)),
    approvedBy: 2, approvalNote: "Approved. Ensure safety protocols.", attendees: 342, tags: ["research", "innovation"],
  },
  {
    id: 2, title: "Inter-Department Football Championship",
    description: "Annual football competition between departments. Finals day event.",
    category: "Sports", date: fmtDate(addDays(today, 12)),
    startTime: "10:00", endTime: "18:00", venueId: 4, organizerId: 4,
    status: STATUSES.APPROVED, createdAt: fmtDate(addDays(today, -5)),
    approvedBy: 2, approvalNote: "", attendees: 520, tags: ["sports", "competition"],
  },
  {
    id: 3, title: "Leadership & Governance Workshop",
    description: "Interactive workshop on leadership skills for student union executives.",
    category: "Workshop", date: fmtDate(addDays(today, 3)),
    startTime: "13:00", endTime: "17:00", venueId: 2, organizerId: 3,
    status: STATUSES.PENDING, createdAt: fmtDate(addDays(today, -2)),
    approvedBy: null, approvalNote: "", attendees: 0, tags: ["leadership"],
  },
  {
    id: 4, title: "Alumni Homecoming Gala",
    description: "Annual reunion and networking event for alumni of all graduating classes.",
    category: "Social", date: fmtDate(addDays(today, 20)),
    startTime: "18:00", endTime: "22:00", venueId: 1, organizerId: 3,
    status: STATUSES.PENDING, createdAt: fmtDate(today),
    approvedBy: null, approvalNote: "", attendees: 0, tags: ["alumni", "networking"],
  },
  {
    id: 5, title: "Python Programming Bootcamp",
    description: "3-day intensive bootcamp covering Python fundamentals to advanced topics.",
    category: "Workshop", date: fmtDate(addDays(today, -3)),
    startTime: "08:00", endTime: "16:00", venueId: 5, organizerId: 4,
    status: STATUSES.COMPLETED, createdAt: fmtDate(addDays(today, -15)),
    approvedBy: 2, approvalNote: "Approved.", attendees: 58, tags: ["programming", "python"],
  },
  {
    id: 6, title: "Cultural Heritage Day",
    description: "Celebration of diverse cultures with performances, food, and exhibitions.",
    category: "Cultural", date: fmtDate(addDays(today, -8)),
    startTime: "10:00", endTime: "20:00", venueId: 1, organizerId: 3,
    status: STATUSES.COMPLETED, createdAt: fmtDate(addDays(today, -20)),
    approvedBy: 1, approvalNote: "Approved — great initiative.", attendees: 650, tags: ["culture", "diversity"],
  },
  {
    id: 7, title: "Research Methodology Seminar",
    description: "Seminar for postgraduate students on quantitative and qualitative research methods.",
    category: "Seminar", date: fmtDate(addDays(today, 8)),
    startTime: "10:00", endTime: "13:00", venueId: 3, organizerId: 3,
    status: STATUSES.REJECTED, createdAt: fmtDate(addDays(today, -3)),
    approvedBy: 2, approvalNote: "Venue unavailable. Please reschedule.", attendees: 0, tags: ["research", "postgrad"],
  },
  {
    id: 8, title: "International Conference on AI",
    description: "Two-day international conference featuring keynote speakers and paper presentations.",
    category: "Conference", date: fmtDate(addDays(today, 30)),
    startTime: "08:00", endTime: "18:00", venueId: 1, organizerId: 4,
    status: STATUSES.PENDING, createdAt: fmtDate(today),
    approvedBy: null, approvalNote: "", attendees: 0, tags: ["AI", "technology", "international"],
  },
];

export const initialNotifications = [
  { id: 1, userId: 3, type: "approval", title: "Event Approved", message: "Annual Science Exhibition has been approved.", eventId: 1, read: false, createdAt: fmtDate(addDays(today, -4)) },
  { id: 2, userId: 3, type: "rejection", title: "Event Requires Changes", message: "Research Methodology Seminar was rejected: Venue unavailable.", eventId: 7, read: false, createdAt: fmtDate(addDays(today, -1)) },
  { id: 3, userId: 2, type: "submission", title: "New Event Submitted", message: "Leadership & Governance Workshop is awaiting your approval.", eventId: 3, read: false, createdAt: fmtDate(addDays(today, -2)) },
  { id: 4, userId: 1, type: "submission", title: "New Event Submitted", message: "Alumni Homecoming Gala submitted for approval.", eventId: 4, read: true, createdAt: fmtDate(today) },
  { id: 5, userId: 4, type: "reminder", title: "Event Reminder", message: "Inter-Department Football Championship is in 12 days.", eventId: 2, read: true, createdAt: fmtDate(today) },
];
