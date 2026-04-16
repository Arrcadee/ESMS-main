const venueModel = require('../models/venueModel');

// Get all venues
const getAllVenues = async (req, res, next) => {
  try {
    const venues = await venueModel.getAllVenues();
    return res.status(200).json({
      success: true,
      data: venues,
      message: 'Venues fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Get venue by ID
const getVenueById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const venue = await venueModel.getVenueById(id);
    if (!venue) {
      res.status(404);
      throw new Error('Venue not found');
    }
    return res.status(200).json({
      success: true,
      data: venue,
      message: 'Venue fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Create venue (admin only)
const createVenue = async (req, res, next) => {
  try {
    const { name, location, capacity, facilities } = req.body;

    // Validation
    if (!name || !location) {
      res.status(400);
      throw new Error('Name and location are required');
    }

    // Create venue
    const venue = await venueModel.createVenue(name, location, capacity, facilities);

    return res.status(201).json({
      success: true,
      data: venue,
      message: 'Venue created successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Update venue (admin only)
const updateVenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, capacity, facilities } = req.body;

    // Get current venue
    const currentVenue = await venueModel.getVenueById(id);
    if (!currentVenue) {
      res.status(404);
      throw new Error('Venue not found');
    }

    // Update venue
    const updatedVenue = await venueModel.updateVenue(id, name, location, capacity, facilities);

    return res.status(200).json({
      success: true,
      data: updatedVenue,
      message: 'Venue updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Delete venue (admin only)
const deleteVenue = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get current venue
    const currentVenue = await venueModel.getVenueById(id);
    if (!currentVenue) {
      res.status(404);
      throw new Error('Venue not found');
    }

    // Delete venue
    const deleted = await venueModel.deleteVenue(id);
    if (!deleted) {
      res.status(500);
      throw new Error('Failed to delete venue');
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Venue deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllVenues, getVenueById, createVenue, updateVenue, deleteVenue };
