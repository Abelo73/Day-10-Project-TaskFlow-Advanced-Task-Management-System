const AccessControl = require("../models/AccessControl");

// Create a new Role with permissions

exports.createRole = async (req, res) => {
  try {
    const { role, permissions } = req.body;

    if (!role || !permissions) {
      return res.status(404).json({
        message: "Role and permissions are required",
        status: false,
      });
    }

    const existingRole = await AccessControl.findOne({ role });
    if (existingRole) {
      return res.status(400).json({
        message: `Role ${role} already exists, try another role please.`,
        status: false,
      });
    }
    const newRole = new AccessControl({
      role,
      permissions,
    });
    await newRole.save();
    res.status(201).json({
      message: `Role ${role} created successfully.`,
      status: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all roles

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await AccessControl.find();
    if (!roles) {
      return res.status(404).json({
        message: "No roles found",
        status: false,
      });
    }
    res.status(200).json({
      message: "Roles retrieved successfully",
      status: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.updateRoles = async (req, res) => {
//   try {
//     const { permissions } = req.body;
//     const updateRole = await AccessControl.findByIdAndUpdate(
//       req.params.id,
//       { permissions },
//       { new: true }
//     );
//     if (!updateRole) {
//       return res.status(404).json({
//         message: "Role not found",
//         status: false,
//       });
//     }
//     res.status(200).json({
//       message: "Role updated successfully",
//       status: true,
//       data: updateRole,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Update roles (add/remove multiple permissions)
exports.updateRoles = async (req, res) => {
  try {
    const { action, permissions } = req.body; // action can be 'add' or 'remove'

    if (
      !action ||
      !permissions ||
      !Array.isArray(permissions) ||
      permissions.length === 0
    ) {
      return res.status(400).json({
        message:
          "Action (add/remove) and a non-empty array of permissions are required",
        status: false,
      });
    }

    // Find the role by ID
    const role = await AccessControl.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        message: "Role not found",
        status: false,
      });
    }

    // Add permissions
    if (action === "add") {
      const newPermissions = permissions.filter(
        (permission) => !role.permissions.includes(permission)
      );

      if (newPermissions.length > 0) {
        role.permissions.push(...newPermissions);
        await role.save();
        return res.status(200).json({
          message: `${newPermissions.length} permission(s) added to role ${role.role}.`,
          status: true,
          data: role,
        });
      } else {
        return res.status(400).json({
          message: "All provided permissions are already assigned to the role.",
          status: false,
        });
      }
    }
    // Remove permissions
    else if (action === "remove") {
      const permissionsToRemove = permissions.filter((permission) =>
        role.permissions.includes(permission)
      );

      if (permissionsToRemove.length > 0) {
        role.permissions = role.permissions.filter(
          (permission) => !permissionsToRemove.includes(permission)
        );
        await role.save();
        return res.status(200).json({
          message: `${permissionsToRemove.length} permission(s) removed from role ${role.role}.`,
          status: true,
          data: role,
        });
      } else {
        return res.status(404).json({
          message: "None of the provided permissions were found in the role.",
          status: false,
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid action. Use 'add' or 'remove'.",
        status: false,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRoles = async (req, res) => {
  try {
    const deletedRole = await AccessControl.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({
        message: "Role not found",
        status: false,
      });
    }

    res.status(200).json({
      message: "Role deleted successfully",
      status: true,
      data: deletedRole,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
