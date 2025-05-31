/**
 * Authentication and Authorization Middleware
 * @module middleware/auth
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes that require authentication
 * @async
 * @function protect
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Validate token presence
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    try {
      // Verify and decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Validate token expiration
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTimestamp) {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
        });
      }

      // Fetch user details
      const user = await User.findById(decoded.id)
        .select('+password')
        .lean()
        .exec();

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists.",
        });
      }

      // Validate user account status
      if (user.active === 0) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        });
      }

      // Check for password changes
      if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
        return res.status(401).json({
          success: false,
          message: "Password was recently changed. Please login again.",
        });
      }

      // Clean user object before attaching to request
      delete user.password;
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.name === 'JsonWebTokenError' 
          ? 'Invalid authentication token.' 
          : 'Authentication failed.',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize access based on user roles
 * @function authorize
 * @param {...string} roles - Allowed roles for the route
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
