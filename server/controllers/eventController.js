const eventModel = require('../models/eventModel');
const { detectConflicts } = require('../utils/conflictDetector');

const validCategories = ['Academic', 'Cultural', 'Sports', 'Administrative', 'Workshop', 'Seminar', 'Conference', 'Social'];

// Get all events
const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventModel.getAllEvents();
    return res.status(200).json({
      success: true,
      data: events,
      message: 'Events fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Get event by ID
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventModel.getEventById(id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    return res.status(200).json({
      success: true,
      data: event,
      message: 'Event fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Create event
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, startTime, endTime, venueId, tags } = req.body;

    // Validation
    if (!title || !date || !startTime || !endTime) {
      res.status(400);
      throw new Error('Title, date, startTime, and endTime are required');
    }

    if (!validCategories.includes(category)) {
      res.status(400);
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Conflict detection (if venueId is provided)
    if (venueId) {
      const conflicts = await detectConflicts(
        { date, startTime, endTime, venueId },
        null
      );
      if (conflicts.length > 0) {
        res.status(400);
        throw new Error(`Venue conflict: "${conflicts[0].title}" already scheduled for this time slot.`);
      }
    }

    // Get organizer from JWT token
    const organizerId = req.user.id;

    // Create event
    const event = await eventModel.createEvent({
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venueId,
      organizerId,
      tags,
    });

    return res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Update event
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, date, startTime, endTime, venueId, tags } = req.body;

    // Get current event
    const currentEvent = await eventModel.getEventById(id);
    if (!currentEvent) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Check authorization (organizer or admin/super Admin)
    if (req.user.role !== 'admin' && req.user.role !== 'super Admin' && currentEvent.organizerId !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to update this event');
    }

    // Validate category if provided
    if (category && !validCategories.includes(category)) {
      res.status(400);
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Conflict detection (if venueId or date/times change)
    if (venueId && (date || startTime || endTime)) {
      const newDate = date || currentEvent.date;
      const newStartTime = startTime || currentEvent.startTime;
      const newEndTime = endTime || currentEvent.endTime;
      const conflicts = await detectConflicts(
        { date: newDate, startTime: newStartTime, endTime: newEndTime, venueId },
        id // Exclude current event from conflict check
      );
      if (conflicts.length > 0) {
        res.status(400);
        throw new Error(`Venue conflict: "${conflicts[0].title}" already scheduled for this time slot.`);
      }
    }

    // Update event
    const updatedEvent = await eventModel.updateEvent(id, {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venueId,
      tags,
    });

    return res.status(200).json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Delete event
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get current event
    const currentEvent = await eventModel.getEventById(id);
    if (!currentEvent) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Check authorization (organizer or admin/super Admin)
    if (req.user.role !== 'admin' && req.user.role !== 'super Admin' && currentEvent.organizerId !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to delete this event');
    }

    // Delete event
    const deleted = await eventModel.deleteEvent(id);
    if (!deleted) {
      res.status(500);
      throw new Error('Failed to delete event');
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Event deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
