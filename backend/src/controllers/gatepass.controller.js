const GatePass = require('../models/GatePass');

const Visitor = require('../models/Visitor');
const User = require('../models/User');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { logAction } = require('../utils/logger');

// @desc    Generate Gate Pass for Approved Visit
// @route   POST /api/gatepass/generate
// @access  Private (Visitor - after approval)
exports.generatePass = async (req, res, next) => {
    try {
        const { visitId } = req.body;

        const visit = await Visitor.findById(visitId);
        
        if (!visit) {
            return res.status(404).json({ success: false, message: 'Visit not found' });
        }

        if (visit.user.toString() !== req.user.id) {
             return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (visit.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Visit not approved yet' });
        }

        // Helper to generate 9-digit numeric code
        const generateCode = () => Math.floor(100000000 + Math.random() * 900000000).toString();

        // Check if pass exists
        let pass = await GatePass.findOne({ visitorRequest: visitId });
        let shortCode;

        if (pass) {
            // Check if we need to migrate old JSON code or mismatched format to new 9-digit numeric
            const isOldFormat = pass.passCode.startsWith('{') || pass.passCode.startsWith('GP-') || pass.passCode.length !== 9 || isNaN(pass.passCode);
            
            if (isOldFormat) {
                // Migrate to 9-digit numeric
                shortCode = generateCode();
                pass.passCode = shortCode;
                await pass.save();
            } else {
                shortCode = pass.passCode;
            }
        } else {
            // Create new
            shortCode = generateCode();
            
            // Ensure uniqueness (simple check, strictly should be loop but collision probability low for demo)
            // Store logic
            pass = await GatePass.create({
                visitorRequest: visit._id,
                passCode: shortCode, 
                validFrom: visit.expectedEntryTime,
                validUntil: visit.expectedExitTime,
                generatedBy: req.user.id
            });
            await logAction(req.user.id, 'GENERATE_PASS', `Gate pass generated for visit ${visit._id} (Code: ${shortCode})`, req);
        }

        // Generate QR Payload
        const payloadData = {
            id: shortCode, 
            uid: req.user.name,
            exp: pass.validUntil
        };

        // Create Digital Signature (HMAC)
        const signature = crypto.createHmac('sha256', process.env.JWT_SECRET).update(JSON.stringify(payloadData)).digest('hex');

        const finalPayload = { ...payloadData, sig: signature };
        const qrString = JSON.stringify(finalPayload);
        const qrCodeUrl = await QRCode.toDataURL(qrString);

        res.status(pass.isNew ? 201 : 200).json({ 
            success: true, 
            data: pass, 
            qrCode: qrCodeUrl, 
            uniqueCode: shortCode 
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify Pass (Security Scan)
// @route   POST /api/gatepass/verify
// @access  Private (Security)
exports.verifyPass = async (req, res, next) => {
    try {
        const { passCode } = req.body;

        // Find pass by the Exact Code string
        const pass = await GatePass.findOne({ passCode }).populate({
            path: 'visitorRequest',
            populate: { path: 'user host', select: 'name email department' }
        });

        if (!pass) {
            await logAction(req.user.id, 'VERIFY_FAIL', 'Invalid gate pass code', req);
            return res.status(404).json({ success: false, message: 'Invalid Gate Pass' });
        }

        // Optional: Verify Signature if provided in request (for strict security checks)
        if (req.body.signature && req.body.payloadData) {
             const expectedSig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(JSON.stringify(req.body.payloadData)).digest('hex');
             if (req.body.signature !== expectedSig) {
                 return res.status(400).json({ success: false, message: 'Digital Signature Mismatch - Possible Tampering' });
             }
        }

        const now = new Date();
        if (now > pass.validUntil || !pass.isActive) {
             return res.status(400).json({ success: false, message: 'Gate Pass Expired or Inactive', data: pass });
        }

        // Logic for Check-in/Check-out toggling?
        // Let's just return valid status for now.
        
        await logAction(req.user.id, 'VERIFY_SUCCESS', `Gate pass ${pass._id} verified successfully`, req);

        res.status(200).json({ success: true, message: 'Access Granted', data: pass });
    } catch (err) {
        next(err);
    }
};
