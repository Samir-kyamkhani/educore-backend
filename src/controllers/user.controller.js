import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createAdmin,
  createParent,
  createStudent,
  createTeacher,
  findUserInTables,
} from "../quaries/user.js";
import { comparePassword, generateAccessToken } from "../utils/utils.js";
import { pool } from "../database/index.js";

// Cookies options for JWT
const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const adminSignup = asyncHandler(async (req, res) => {
  const {
    username,
    password,
    email,
    fullName,
    phoneNumber,
    schoolName,
    schoolAddress,
    schoolContactNumber,
    schoolEmail,
    schoolRegisterId,
    governmentId,
    agreementToTerms,
    schoolEstablished,
  } = req.body;

  if (
    [
      username,
      password,
      email,
      fullName,
      phoneNumber,
      schoolName,
      schoolAddress,
      schoolContactNumber,
      schoolEmail,
      schoolRegisterId,
      governmentId,
    ].some((field) => typeof field !== "string" || field.trim() === "") ||
    agreementToTerms === undefined ||
    schoolEstablished === undefined
  ) {
    throw new ApiError(400, "All required fields must be provided and valid");
  }

  if (typeof agreementToTerms !== "boolean") {
    throw new ApiError(400, "'agreementToTerms' must be a boolean value");
  }

  const tables = ["admin", "student", "teacher", "parent"];
  for (const table of tables) {
    const [result] = await pool.query(
      `SELECT 1 FROM ?? WHERE username = ? LIMIT 1`,
      [table, username],
    );
    if (result.length > 0) {
      throw new ApiError(400, "Username already exists");
    }
  }

  const adminData = await createAdmin({
    username: username?.trim(),
    password: password?.trim(),
    email: email?.toLowerCase() && email?.trim(),
    fullName,
    phoneNumber,
    schoolName,
    schoolAddress,
    schoolContactNumber,
    schoolEmail,
    schoolRegisterId,
    governmentId,
    agreementToTerms,
    schoolEstablished,
  });

  if (!adminData) {
    throw new ApiError(500, "Error while creating admin");
  }

  let role, id;
  for (const table of tables) {
    const [rows] = await pool.query(
      `SELECT id, role FROM ?? WHERE username = ? LIMIT 1`,
      [table, username],
    );
    if (rows.length > 0) {
      ({ id, role } = rows[0]);
      break;
    }
  }

  if (!id || !role) {
    throw new ApiError(
      404,
      "User creation successful but not found in any table",
    );
  }

  const accessToken = generateAccessToken(id, email);
  const admin = {
    id,
    role,
    username,
    email,
    fullName,
    phoneNumber,
    schoolName,
    schoolAddress,
    schoolContactNumber,
    schoolEmail,
    schoolRegisterId,
    governmentId,
    agreementToTerms,
    schoolEstablished,
    accessToken,
  };

  return res
    .status(201)
    .json(new ApiResponse(201, "Admin Created Successfully", admin));
});

const teacherSignup = asyncHandler(async (req, res) => {
  const {
    username,
    password,
    name,
    surname,
    email,
    phone,
    address,
    bloodType,
    sex,
    birthday,
  } = req.body;

  if (
    [
      username,
      password,
      name,
      surname,
      email,
      phone,
      address,
      bloodType,
      sex,
      birthday,
    ].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Ensure birthday is a valid date
  if (isNaN(new Date(birthday))) {
    throw new ApiError(400, "Invalid date format for 'birthday'");
  }

  // Check if username already exists across tables
  const tables = ["admin", "student", "teacher", "parent"];
  for (const table of tables) {
    const [result] = await pool.query(
      `SELECT 1 FROM ?? WHERE username = ? LIMIT 1`,
      [table, username],
    );
    if (result.length > 0) {
      throw new ApiError(400, "Username already exists");
    }
  }

  // Create the teacher record
  const teacherData = await createTeacher({
    username: username?.trim(),
    password: password?.trim(),
    email: email?.toLowerCase() && email?.trim(),
    name,
    surname,
    phone,
    address,
    bloodType,
    sex,
    birthday,
  });

  if (!teacherData) {
    throw new ApiError(500, "Error while creating teacher");
  }

  let role, id;
  for (const table of tables) {
    const [rows] = await pool.query(
      `SELECT id, role FROM ?? WHERE username = ? LIMIT 1`,
      [table, username],
    );
    if (rows.length > 0) {
      ({ id, role } = rows[0]);
      break;
    }
  }

  if (!id || !role) {
    throw new ApiError(
      404,
      "User creation successful but not found in any table",
    );
  }

  // Generate and respond with the teacher details
  const accessToken = generateAccessToken(id, email);
  const teacher = { id, role, username, accessToken };

  return res
    .status(201)
    .json(new ApiResponse(201, "Teacher Created Successfully", teacher));
});

const parentSignup = asyncHandler(async (req, res) => {
  const { username, password, name, surname, email, phone, address } = req.body;

  if (
    [username, password, name, surname, email, phone, address].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const tables = ["admin", "student", "teacher", "parent"];
  for (const table of tables) {
    const [result] = await pool.query(
      `SELECT 1 FROM ?? WHERE username = ? LIMIT 1`,
      [table, username],
    );
    if (result.length > 0) {
      throw new ApiError(400, "Username already exists");
    }
  }

  // Create the teacher record
  const ParentData = await createParent({
    username: username?.trim(),
    password: password?.trim(),
    email: email?.toLowerCase() && email?.trim(),
    name,
    surname,
    phone,
    address,
  });

  if (!ParentData) {
    throw new ApiError(500, "Error while creating parent");
  }

  let role, id;
  for (const table of tables) {
    const [rows] = await pool.query(
      `SELECT id, role FROM ?? WHERE username = ? LIMIT 1`,
      [table, username],
    );
    if (rows.length > 0) {
      ({ id, role } = rows[0]);
      break;
    }
  }

  if (!id || !role) {
    throw new ApiError(
      404,
      "User creation successful but not found in any table",
    );
  }

  // Generate and respond with the teacher details
  const accessToken = generateAccessToken(id, email);
  const parent = { id, role, username, accessToken };

  return res
    .status(201)
    .json(new ApiResponse(201, "Parent Created Successfully", parent));
});

const studentSignup = asyncHandler(async (req, res) => {
  const {
    username,
    password,
    name,
    surname,
    email,
    phone,
    address,
    bloodType,
    sex,
    birthday,
  } = req.body;

  if (
    [
      username,
      password,
      name,
      surname,
      email,
      phone,
      address,
      bloodType,
      sex,
      birthday,
    ].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const tables = ["admin", "student", "teacher", "parent"];
  for (const table of tables) {
    const [result] = await pool.query(
      `SELECT 1 FROM ?? WHERE username = ? LIMIT 1`,
      [table, username],
    );
    if (result.length > 0) {
      throw new ApiError(400, "Username already exists");
    }
  }

  // Create the teacher record
  const studentData = await createStudent({
    username: username?.trim(),
    password: password?.trim(),
    email: email?.toLowerCase() && email?.trim(),
    name,
    surname,
    phone,
    address,
    bloodType,
    sex,
    birthday,
  });

  if (!studentData) {
    throw new ApiError(500, "Error while creating student");
  }

  let role, id;
  for (const table of tables) {
    const [rows] = await pool.query(
      `SELECT id, role FROM ?? WHERE username = ? LIMIT 1`,
      [table, username],
    );
    if (rows.length > 0) {
      ({ id, role } = rows[0]);
      break;
    }
  }

  if (!id || !role) {
    throw new ApiError(
      404,
      "User creation successful but not found in any table",
    );
  }

  // Generate and respond with the teacher details
  const accessToken = generateAccessToken(id, email);
  const student = { id, role, username, accessToken };

  return res
    .status(201)
    .json(new ApiResponse(201, "Parent Created Successfully", student));
});

const userLogin = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!username && !email) {
    throw new ApiError("Please provide either a username or an email.", 400);
  }

  if (!password) {
    throw new ApiError("Password is required.", 400);
  }

  const user = await findUserInTables(username, email);

  if (!user) {
    throw new ApiError("Invalid credentials. User not found.", 401);
  }

  const isPasswordMatch = await comparePassword(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError("Invalid username, email, or password.", 401);
  }

  const { password: _, ...userWithoutPassword } = user;

  const accessToken = generateAccessToken(user.id, user.email);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, "Login successful", {
        user: userWithoutPassword,
        accessToken,
      }),
    );
});

const userLogout = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError("Unauthorized. User not logged in.", 401);
    }

    res.clearCookie("accessToken", cookieOptions);

    return res
      .status(200)
      .json(new ApiResponse(200, "User logged out successfully", {}));
  } catch (error) {
    throw error;
  }
});

const authenticateUserController = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Access granted!", { user: req.user }));
});

// const userLogout = asyncHandler(async (req, res) => {});

// const getCurrentUser = asyncHandler(async (req, res) => {});

// const updateUserAvatar = asyncHandler(async (req, res) => {});

// const updateUserDetails = asyncHandler(async (req, res) => {});

// const changeCurrentPassword = asyncHandler(async (req, res) => {});

// const refreshAccessToken = asyncHandler(async (req, res) => {});

export {
  adminSignup,
  teacherSignup,
  parentSignup,
  studentSignup,
  userLogin,
  userLogout,
  authenticateUserController,
};
