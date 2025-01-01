import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { decryptData, encryptData } from "../utils/utils.js";
import { Token } from "../models/token.model.js";

export const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      const missingField = !email ? "Email" : "Password";
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request, Reason: Missing ${missingField}`,
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

    const isFirstUser = (await User.countDocuments()) === 0;
    const userRole = isFirstUser ? "Admin" : role || "Viewer";

    await User.create({
      email,
      password: hashedPassword,
      role: userRole,
    });

    return res.status(201).json({
      status: 201,
      data: null,
      message: "User created successfully.",
      error: null,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

// handle login user

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const missingField = !email ? "Email" : "Password";
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request, Reason: Missing ${missingField}`,
        error: null,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const decrypted_password = decryptData(
      user?.password,
      process.env.SECRET_KEY
    );

    if (password !== decrypted_password) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Invalid credentials",
        error: null,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      status: 200,
      data: {
        token: token,
      },
      message: "Login successful.",
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

export const logout = async (req, res) => {
  try {
    const token = req.user.token;

    await Token.create({
      token,
      invalidated: true,
    });

    return res.status(200).json({
      status: 200,
      data: null,
      message: "User logged out successfully.",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};
