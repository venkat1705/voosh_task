import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Token } from "../models/token.model.js";

export const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      status: 401,
      data: null,
      message: "Unauthorized Access",
      error: null,
    });
  }

  const Blacklisted_tokens = await Token.find();

  const filtered_blacklist = Blacklisted_tokens.filter(
    (item) => item?.token === token
  );

  if (filtered_blacklist?.length > 0) {
    return res.status(401).json({
      status: 401,
      data: null,
      message: "Invalid token",
      error: null,
    });
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
      if (err) {
        return res.status(401).json({
          status: 401,
          data: null,
          message: "Invalid or malformed token",
          error: null,
        });
      }

      const { id } = payload;

      User.findById(id).then((userdata) => {
        req.user = {
          email: userdata?.email,
          role: userdata?.role,
          _id: userdata?._id,
          token: token,
        };
        next();
      });
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

export const authorizeRoles = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      status: 403,
      data: null,
      message: "Forbidden Access.",
      error: null,
    });
  }
  next();
};
