const approvalModel = require('../models/approvalModel');
const eventModel = require('../models/eventModel');
const notificationModel = require('../models/notificationModel');

// Get all approvals
const getAllApprovals = async (req, res, next) => {
  try {
    const approvals = await approvalModel.getAllApprovals();
    return res.status(200).json({
      success: true,
      data: approvals,
      message: 'Approvals fetched successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Create or update approval
const submitApproval = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status, note } = req.body;

    // Validation
    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Status must be "approved" or "rejected"');
    }

    // Get event
    const event = await eventModel.getEventById(eventId);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    const approverId = req.user.id;

    // Check if approval already exists
    const existingApproval = await approvalModel.getApprovalByEventId(eventId);

    let approval;
    if (existingApproval) {
      // Update existing approval
      approval = await approvalModel.updateApproval(eventId, approverId, status, note || '');
    } else {
      // Create new approval
      approval = await approvalModel.createApproval(eventId, approverId, status, note || '');
    }

    // Update event status
    const updatedEvent = await eventModel.updateEventStatus(
      eventId,
      status,
      approverId,
      note || ''
    );

    // Create notification for organizer
    const notificationType = status === 'approved' ? 'approval' : 'rejection';
    const notificationTitle = status === 'approved' ? 'Event Approved' : 'Event Rejected';
    const notificationMessage =
      status === 'approved'
        ? `"${event.title}" has been approved.`
        : `"${event.title}" was rejected: ${note || 'No reason provided.'}`;

    await notificationModel.createNotification(
      event.organizerId,
      notificationType,
      notificationTitle,
      notificationMessage,
      eventId
    );

    return res.status(200).json({
      success: true,
      data: updatedEvent,
      message: `Event ${status} successfully`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllApprovals, submitApproval };
