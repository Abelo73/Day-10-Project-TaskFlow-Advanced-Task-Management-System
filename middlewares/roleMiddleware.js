const TaskUser = require("../models/User");

// const checkRole = (requiredRoles) => async (req, res, next) => {
//   try {
//     const user = await TaskUser.findById(req.user._id);
//     console.log("User from checkRole middleware: ", user);
//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         status: false,
//       });
//     }
//     if (!requiredRoles.includes(user.role.role)) {
//       return res.status(403).json({
//         message: "You don't have permission to access this route",
//         status: false,
//       });
//     }
//     next();
//   } catch (error) {
//     res.status(500).json({
//       message: `Error while checking required roles in the roleMiddlewares: ${error.message}`,
//     });
//   }
// };

// module.exports = checkRole;

const checkRole = (requiredPermissions) => async (req, res, next) => {
  try {
    const user = req.user; // user is already populated in the authenticateUser middleware
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    // Check if the user has the required permission
    const hasPermission = requiredPermissions.some((permission) =>
      user.role.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: "You don't have permission to access this route",
        status: false,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: `Error while checking required roles in the roleMiddlewares: ${error.message}`,
    });
  }
};

module.exports = checkRole;
