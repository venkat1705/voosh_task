import { User } from "../models/user.model.js";
import { decryptData, encryptData } from "../utils/utils.js";

export const retrieveUsers = async (req, res) => {
  const { limit = 5, offset = 0, role } = req.query;

  if (isNaN(limit) || isNaN(offset)) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: "Bad request: 'limit' and 'offset' must be numbers.",
      error: null,
    });
  }
  try {
    const filter = { role: { $ne: "Admin" } };
    if (role) {
      filter.role = role === "Admin" ? "" : role;
    }
    const result = await User.find(filter).skip(offset).limit(limit);
    return res.status(200).json({
      status: 200,
      data: result,
      message: "Users retrieved successfully.",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      const missingField = !email ? "Email" : !password ? "Password" : "Role";
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request, Reason: Missing ${missingField}`,
        error: null,
      });
    }
    if (role === "Admin") {
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request, Reason: Role should be either Editor or Viewer`,
        error: null,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        data: null,
        message: "Email already exists.",
        error: null,
      });
    }

    const hashedPassword = encryptData(password, process.env.SECRET_KEY);

    await User.create({
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      status: 201,
      data: null,
      message: "User created successfully.",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request: Missing user_id",
        error: null,
      });
    }

    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    if (user.role === "Admin") {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Admin cannot be deleted.",
        error: null,
      });
    }

    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      status: 200,
      data: null,
      message: "User deleted successfully.",
      error: null,
    });
  } catch (error) {
    // console.error("Error deleting user:", error);
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error.",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      const missingField = !old_password ? "old_password" : "new_password";
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request, Reason: Missing ${missingField}`,
        error: null,
      });
    }

    const user = await User.findOne({ _id: req.user._id });

    if (!user) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const existing_old_password = decryptData(
      user?.password,
      process.env.SECRET_KEY
    );

    if (old_password !== existing_old_password) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Incorrect old password.",
        error: null,
      });
    }
    if (new_password === existing_old_password) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "New password cannot be the same as the old password.",
        error: null,
      });
    }

    const encrypted_new_password = encryptData(
      new_password,
      process.env.SECRET_KEY
    );

    await User.findByIdAndUpdate(
      { _id: user?._id },
      {
        $set: {
          password: encrypted_new_password,
        },
      },
      {
        $new: true,
      }
    );

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error.",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};
