import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

export const hashPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required for hashing.");
  }
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);

  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }

  return isMatch;
};

export const generateAccessToken = (id, email, role, school_id) => {
  return jwt.sign(
    {
      id,
      email,
      role,
      school_id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

const generateRefreshToken = (id, email) => {
  return jwt.sign(
    {
      id,
      email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export function validateDate(birthday) {
  const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  // Check if the date format is valid
  if (!dateFormatRegex.test(birthday)) {
    throw new Error("Invalid date format. Use DD/MM/YYYY.");
  }

  // Split the input into day, month, year
  const [day, month, year] = birthday.split("/").map(Number);

  // Ensure that day, month, and year are valid numbers
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error("Invalid date values.");
  }

  // Check if the month is within a valid range
  if (month < 1 || month > 12) {
    throw new Error("Invalid month.");
  }

  // Create a date object and check if it matches the input values
  const date = new Date(year, month - 1, day);

  // Ensure that the created date matches the input (handle edge cases like February 30th)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error("Invalid date.");
  }

  return date;
}
