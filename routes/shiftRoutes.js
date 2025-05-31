const express = require('express');
const { body } = require('express-validator');
const {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  assignStaff,
  removeStaff,
  getShiftsByDateRange,
  getStaffShifts,
  checkConflicts,
} = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Shift management endpoints
 */

/**
 * @swagger
 * /api/shifts:
 *   get:
 *     summary: Get all shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all shifts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shift'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Admin access required
 *
 *   post:
 *     summary: Create a new shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shift'
 *     responses:
 *       201:
 *         description: Shift created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/shifts/date-range:
 *   get:
 *     summary: Get shifts by filter (shiftType, department)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shiftType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Morning, Afternoon, Night]
 *         description: Type of shift
 *       - in: query
 *         name: department
 *         required: false
 *         schema:
 *           type: string
 *           enum: [General, Emergency, ICU, Surgery, Pediatrics, Maternity]
 *         description: Department filter
 *     responses:
 *       200:
 *         description: List of filtered shifts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shift'
 */

/**
 * @swagger
 * /api/shifts/conflicts:
 *   get:
 *     summary: Check for shift conflicts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID to check conflicts for
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *         description: Start time (HH:MM)
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *         description: End time (HH:MM)
 *     responses:
 *       200:
 *         description: Conflict check results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 hasConflicts:
 *                   type: boolean
 *                 conflicts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shift'
 */

/**
 * @swagger
 * /api/shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
 *
 *   put:
 *     summary: Update shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shift'
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *
 *   delete:
 *     summary: Delete shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift deleted successfully
 */

/**
 * @swagger
 * /api/shifts/{id}/assign:
 *   post:
 *     summary: Assign staff to shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffIds
 *             properties:
 *               staffIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                 description: Array of staff IDs to assign
 *     responses:
 *       200:
 *         description: Staff assigned successfully
 */

/**
 * @swagger
 * /api/shifts/{id}/remove-staff:
 *   put:
 *     summary: Remove staff from shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shift ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffIds
 *             properties:
 *               staffIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                 description: Array of staff IDs to remove
 *     responses:
 *       200:
 *         description: Staff removed successfully
 */

/**
 * @swagger
 * /api/shifts/staff/{staffId}:
 *   get:
 *     summary: Get shifts for a specific staff member
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: List of shifts for the staff member
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shift'
 */

// Validation rules for shift creation
const createShiftValidation = [
  body('shiftType')
    .isIn(['Morning', 'Afternoon', 'Night'])
    .withMessage('Shift type must be Morning, Afternoon, or Night'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format (24-hour)'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format (24-hour)'),
  body('requiredStaff')
    .isInt({ min: 1, max: 50 })
    .withMessage('Required staff must be between 1 and 50'),
  body('department')
    .isIn(['General', 'Emergency', 'ICU', 'Surgery', 'Pediatrics', 'Maternity'])
    .withMessage('Invalid department'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

// Validation rules for shift update
const updateShiftValidation = [
  body('shiftType')
    .optional()
    .isIn(['Morning', 'Afternoon', 'Night'])
    .withMessage('Shift type must be Morning, Afternoon, or Night'),
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format (24-hour)'),
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format (24-hour)'),
  body('requiredStaff')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Required staff must be between 1 and 50'),
  body('department')
    .optional()
    .isIn(['General', 'Emergency', 'ICU', 'Surgery', 'Pediatrics', 'Maternity'])
    .withMessage('Invalid department'),
  body('status')
    .optional()
    .isIn(['Open', 'Full', 'Closed'])
    .withMessage('Status must be Open, Full, or Closed'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

// Validation for staff assignment
const staffAssignmentValidation = [
  body('staffIds').isArray({ min: 1 }).withMessage('staffIds must be a non-empty array'),
  body('staffIds.*').isMongoId().withMessage('Each staff ID must be a valid MongoDB ObjectId'),
];

// Apply auth protection and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// GET routes
router.get('/', getAllShifts);
router.get('/date-range', getShiftsByDateRange);
router.get('/conflicts', checkConflicts);
router.get('/staff/:staffId', getStaffShifts);
router.get('/:id', getShiftById);

// POST routes
router.post('/', createShiftValidation, createShift);
router.post('/:id/assign', staffAssignmentValidation, assignStaff);

// PUT routes
router.put('/:id', updateShiftValidation, updateShift);
router.put('/:id/remove-staff', staffAssignmentValidation, removeStaff);

// DELETE routes
router.delete('/:id', deleteShift);

module.exports = router;
