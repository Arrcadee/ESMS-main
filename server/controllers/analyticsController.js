const { pool } = require('../config/db');
const eventModel = require('../models/eventModel');
const venueModel = require('../models/venueModel');
const userModel = require('../models/userModel');

// Get analytics dashboard data
const getAnalytics = async (req, res, next) => {
  try {
    // Get all events
    const events = await eventModel.getAllEvents();

    // Count by status
    const countByStatus = await eventModel.countEventsByStatus();

    // Total events
    const totalEvents = events.length;
    const approvedEvents = countByStatus.approved;
    const pendingEvents = countByStatus.pending;
    const rejectedEvents = countByStatus.rejected;
    const completedEvents = countByStatus.completed;

    // Total attendees
    const totalAttendees = await eventModel.getTotalAttendees();

    // Approval rate = (approved + completed) / (total - pending) * 100
    const approvalRateDenominator = totalEvents - pendingEvents;
    const approvalRate = approvalRateDenominator > 0
      ? Math.round(((approvedEvents + completedEvents) / approvalRateDenominator) * 100)
      : 0;

    // By category
    const categoryRows = await eventModel.getEventCountByCategory();
    const byCategory = categoryRows.map(row => ({
      category: row.category,
      count: parseInt(row.count, 10),
    }));

    // By month - all 12 months
    const monthRows = await eventModel.getEventCountByMonth();
    const monthMap = {};
    monthRows.forEach(row => {
      monthMap[parseInt(row.month_num, 10)] = parseInt(row.count, 10);
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const byMonth = months.map((month, index) => ({
      month,
      count: monthMap[index + 1] || 0,
    }));

    // Venue usage
    const venuesWithCount = await venueModel.getVenuesWithEventCount();
    const venueUsage = venuesWithCount.map(venue => ({
      id: venue.id,
      name: venue.name,
      location: venue.location,
      building: venue.building,
      capacity: venue.capacity,
      eventCount: venue.eventCount,
    }));

    // Organizer leaderboard (top users by event count)
    const organizerRows = await pool.query(
      `SELECT u.id, u.name, u.avatar, u.department, u.role, COUNT(e.id) as event_count
       FROM users u
       LEFT JOIN events e ON u.id = e.organizer_id
       WHERE u.role IN ('organizer', 'user')
       GROUP BY u.id, u.name, u.avatar, u.department, u.role
       ORDER BY event_count DESC`
    );
    const organizerLeaderboard = organizerRows.rows.map(row => ({
      id: row.id,
      name: row.name,
      avatar: row.avatar,
      department: row.department,
      role: row.role,
      eventCount: parseInt(row.event_count, 10),
    }));

    // Total counts
    const totalVenues = venueUsage.length;
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsersCount = parseInt(totalUsers.rows[0].count, 10);

    const analyticsData = {
      totalEvents,
      approvedEvents,
      pendingEvents,
      rejectedEvents,
      completedEvents,
      totalAttendees,
      approvalRate,
      totalVenues,
      totalUsers: totalUsersCount,
      byCategory,
      byMonth,
      venueUsage,
      organizerLeaderboard,
    };

    return res.status(200).json({
      success: true,
      data: analyticsData,
      message: 'Analytics fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics };
