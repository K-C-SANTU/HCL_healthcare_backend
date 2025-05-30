const { body } = require("express-validator");

const validateStaff = [
  body("employeeId")
    .notEmpty()
    .withMessage("Employee ID is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Employee ID must be between 3 and 20 characters"),

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("department")
    .notEmpty()
    .withMessage("Department is required")
    .isIn([
      "Emergency",
      "Cardiology",
      "Neurology",
      "Pediatrics",
      "Surgery",
      "Radiology",
      "Laboratory",
      "Pharmacy",
      "Administration",
      "Nursing",
    ])
    .withMessage("Please select a valid department"),

  body("position")
    .notEmpty()
    .withMessage("Position is required")
    .isIn([
      "Doctor",
      "Nurse",
      "Technician",
      "Administrator",
      "Pharmacist",
      "Radiologist",
      "Lab Technician",
      "Surgeon",
      "Specialist",
    ])
    .withMessage("Please select a valid position"),

  body("dateOfJoining")
    .isISO8601()
    .withMessage("Please provide a valid date of joining (YYYY-MM-DD format)")
    .toDate(),

  body("salary")
    .isNumeric()
    .withMessage("Salary must be a number")
    .isFloat({ min: 0 })
    .withMessage("Salary must be a positive number"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),

  body("address.street")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Street address must not exceed 100 characters"),

  body("address.city")
    .optional()
    .isLength({ max: 50 })
    .withMessage("City must not exceed 50 characters"),

  body("address.state")
    .optional()
    .isLength({ max: 50 })
    .withMessage("State must not exceed 50 characters"),

  body("address.zipCode")
    .optional()
    .matches(/^[0-9]{5,10}$/)
    .withMessage("Please provide a valid zip code"),

  body("address.country")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Country must not exceed 50 characters"),
];

const validateStaffUpdate = [
  body("employeeId")
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage("Employee ID must be between 3 and 20 characters"),

  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("department")
    .optional()
    .isIn([
      "Emergency",
      "Cardiology",
      "Neurology",
      "Pediatrics",
      "Surgery",
      "Radiology",
      "Laboratory",
      "Pharmacy",
      "Administration",
      "Nursing",
    ])
    .withMessage("Please select a valid department"),

  body("position")
    .optional()
    .isIn([
      "Doctor",
      "Nurse",
      "Technician",
      "Administrator",
      "Pharmacist",
      "Radiologist",
      "Lab Technician",
      "Surgeon",
      "Specialist",
    ])
    .withMessage("Please select a valid position"),

  body("dateOfJoining")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of joining (YYYY-MM-DD format)")
    .toDate(),

  body("salary")
    .optional()
    .isNumeric()
    .withMessage("Salary must be a number")
    .isFloat({ min: 0 })
    .withMessage("Salary must be a positive number"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),

  body("address.street")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Street address must not exceed 100 characters"),

  body("address.city")
    .optional()
    .isLength({ max: 50 })
    .withMessage("City must not exceed 50 characters"),

  body("address.state")
    .optional()
    .isLength({ max: 50 })
    .withMessage("State must not exceed 50 characters"),

  body("address.zipCode")
    .optional()
    .matches(/^[0-9]{5,10}$/)
    .withMessage("Please provide a valid zip code"),

  body("address.country")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Country must not exceed 50 characters"),
];

module.exports = {
  validateStaff,
  validateStaffUpdate,
};
