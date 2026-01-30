const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { logAction } = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a visit request
// @route   POST /api/visitors
// @access  Private (Visitor)
exports.createVisitRequest = async (req, res, next) => {
    try {
        const { hostId, purpose, expectedEntryTime, expectedExitTime, additionalGuests } = req.body;

        const host = await User.findById(hostId);
        if (!host || host.role !== 'faculty') {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }

        const visit = await Visitor.create({
            user: req.user.id,
            host: hostId,
            purpose,
            expectedEntryTime,
            expectedExitTime,
            additionalGuests
        });

        await logAction(req.user.id, 'CREATE_VISIT_REQUEST', `Visit request created for host ${host.name}`, req);

        // Send Email to Host/Faculty
        try {
            await sendEmail({
                email: host.email,
                subject: `New Gate Pass Request from ${req.user.name}`,
                message: `Hello ${host.name},\n\nYou have a new gate pass request from ${req.user.name} for the purpose: ${purpose}.\nExpected Entry: ${new Date(expectedEntryTime).toLocaleString()}\n\nPlease login to your dashboard to approve or reject this request.\n\nRegards,\nSecure Gate`
            });
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
            // Don't fail the request if email fails, just log it
        }

        res.status(201).json({ success: true, data: visit });
    } catch (err) {
        next(err);
    }
};

// @desc    Get visits (based on role)
// @route   GET /api/visitors
// @access  Private
exports.getVisits = async (req, res, next) => {
    try {
        let query;

        // Role based filtering
        if (req.user.role === 'visitor' || req.user.role === 'student') {
            query = Visitor.find({ user: req.user.id });
        } else if (req.user.role === 'faculty') {
            query = Visitor.find({ host: req.user.id });
        } else {
            // Admin / Security see all
            query = Visitor.find();
        }

        const visits = await query.populate('user', 'name email phone').populate('host', 'name department');

        res.status(200).json({ success: true, count: visits.length, data: visits });
    } catch (err) {
        next(err);
    }
};

// @desc    Update visit status (Approve/Reject)
// @route   PUT /api/visitors/:id
// @access  Private (Host/Admin)
exports.updateVisitStatus = async (req, res, next) => {
    try {
        const { status, remarks } = req.body; // status: 'approved' | 'rejected'
        
        let visit = await Visitor.findById(req.params.id).populate('user');

        if (!visit) {
            return res.status(404).json({ success: false, message: 'Visit not found' });
        }

        // Permission Logic:
        // 1. Host/Faculty can update status of visits assigned to them
        // 2. Admin can update any
        // 3. User (Student/Visitor) can only set status to 'cancelled' for their own visits
        
        const isOwner = visit.user._id.toString() === req.user.id;
        const isAssignedHost = visit.host.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (isOwner) {
            if (status !== 'cancelled') {
                 return res.status(403).json({ success: false, message: 'You can only cancel your own request' });
            }
        } else if (!isAssignedHost && !isAdmin) {
             return res.status(403).json({ success: false, message: 'Not authorized to update this visit' });
        }

        visit.status = status;
        if(remarks) visit.remarks = remarks;

        await visit.save();

        // If approved, trigger Gate Pass generation (we will do this via a separate call or internal logic)
        // For simplicity, let's keep it decoupled: Frontend calls Generate Pass or Backend does it here.
        // Backend doing it here is better.

        if (status === 'approved') {
             // Send Email to Visitor/Student
             try {
                await sendEmail({
                    email: visit.user.email,
                    subject: 'Gate Pass Request Approved',
                    message: `Hello ${visit.user.name},\n\nYour gate pass request has been APPROVED by ${req.user.name}.\n\nYou can now generate your pass from your dashboard.\n\nRegards,\nSecure Gate`
                });
            } catch (emailErr) {
                console.error('Email sending failed:', emailErr);
            }
        }

        await logAction(req.user.id, 'UPDATE_VISIT_STATUS', `Visit ${visit._id} status updated to ${status}`, req);

        res.status(200).json({ success: true, data: visit });
    } catch (err) {
        next(err);
    }
};
