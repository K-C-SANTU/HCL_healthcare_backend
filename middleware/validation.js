const { body } = require('express-validator');

const validateUser = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('active')
    .optional()
    .isNumeric()
    .withMessage('Active must be a number (0 or 1)')
    .isIn([0, 1])
    .withMessage('Active must be 0 or 1'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'technician'])
    .withMessage('Please select a valid role'),

  body('createdBy')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date format')
    .toDate(),

  body('updatedBy')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date format')
    .toDate(),
];

const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('active')
    .optional()
    .isNumeric()
    .withMessage('Active must be a number (0 or 1)')
    .isIn([0, 1])
    .withMessage('Active must be 0 or 1'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'technician'])
    .withMessage('Please select a valid role'),

  body('createdBy')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date format')
    .toDate(),

  body('updatedBy')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date format')
    .toDate(),
];

// Validation for user login
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

// Validation for password update
const validatePasswordUpdate = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
];

module.exports = {
  validateUser,
  validateUserUpdate,
  validateLogin,
  validatePasswordUpdate,
};
