import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createAdmin,
  createParent,
  createStudent,
  createTeacher,
  findUserById,
  findUserInTables,
  updateAdmin,
} from "../queries/user.queries.js";
import {
  comparePassword,
  generateAccessToken,
  validateDate,
} from "../utils/utils.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const adminSignup = asyncHandler(async (req, res) => {
  let {
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
    if (agreementToTerms === "true") {
      agreementToTerms = true;
    } else if (agreementToTerms === "false") {
      agreementToTerms = false;
    } else {
      throw new ApiError(400, "'agreementToTerms' must be a boolean value");
    }
  }

  const newSchoolEstablished = validateDate(schoolEstablished);

  const avatarLocalPath = req.files?.profilePicture?.[0]?.path;
  let schoolLogo = req.files?.schoolLogo?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload avatar");
  }

  if (!schoolLogo) {
    throw new ApiError(400, "Please upload school logo.");
  }

  const avatarLocalPathPublic = path.join(
    __dirname,
    "public",
    "profilePicture",
    path.basename(avatarLocalPath),
  );
  const schoolLogoLocalPathPublic = schoolLogo
    ? path.join(__dirname, "public", "schoolLogo", path.basename(schoolLogo))
    : null;

  const existUser = await findUserInTables(username, email);
  if (existUser) {
    throw new ApiError(400, "Username already exists");
  }

  const adminData = await createAdmin({
    username: username?.trim(),
    password: password?.trim(),
    email: email?.toLowerCase().trim(),
    fullName,
    phoneNumber,
    schoolName,
    schoolAddress,
    schoolContactNumber,
    schoolEmail,
    schoolRegisterId,
    governmentId,
    agreementToTerms,
    schoolEstablished: newSchoolEstablished,
    profilePicture: avatarLocalPathPublic,
    schoolLogo: schoolLogoLocalPathPublic,
  });

  if (!adminData) {
    throw new ApiError(500, "Error while creating admin");
  }

  const newUser = await findUserInTables(username, email);

  if (!newUser) {
    throw new ApiError(
      404,
      "User creation successful but not found in any table",
    );
  }

  const { password: _, ...user } = newUser;

  const accessToken = generateAccessToken(user.id, user.email);

  return res.status(201).json(
    new ApiResponse(201, "Admin Created Successfully", {
      user,
      accessToken,
    }),
  );
});

const adminUpdate = asyncHandler(async (req, res) => {
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
    schoolEstablished,
  } = req.body;

  const updates = {};

  // Validate and update only provided fields
  if (username?.trim()) updates.username = username.trim();
  if (password?.trim()) updates.password = password.trim();
  if (email?.trim()) updates.email = email.toLowerCase().trim();
  if (fullName?.trim()) updates.fullName = fullName.trim();
  if (phoneNumber?.trim()) updates.phoneNumber = phoneNumber.trim();
  if (schoolName?.trim()) updates.schoolName = schoolName.trim();
  if (schoolAddress?.trim()) updates.schoolAddress = schoolAddress.trim();
  if (schoolContactNumber?.trim())
    updates.schoolContactNumber = schoolContactNumber.trim();
  if (schoolEmail?.trim())
    updates.schoolEmail = schoolEmail.toLowerCase().trim();
  if (schoolRegisterId?.trim())
    updates.schoolRegisterId = schoolRegisterId.trim();
  if (governmentId?.trim()) updates.governmentId = governmentId.trim();

  if (schoolEstablished) {
    updates.schoolEstablished = validateDate(schoolEstablished);
  }

  // Handle file uploads conditionally
  const avatarLocalPath = req.files?.profilePicture?.[0]?.path;
  const schoolLogo = req.files?.schoolLogo?.[0]?.path;

  if (avatarLocalPath) {
    updates.profilePicture = path.join(
      __dirname,
      "public",
      "profilePicture",
      path.basename(avatarLocalPath),
    );
  }

  if (schoolLogo) {
    updates.schoolLogo = path.join(
      __dirname,
      "public",
      "schoolLogo",
      path.basename(schoolLogo),
    );
  }

  // Check if there's anything to update
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  // Check if the username or email is already taken by another user
  if (updates.username || updates.email) {
    const existUser = await findUserInTables(
      updates.username || username,
      updates.email || email,
    );
    if (existUser && existUser.id !== req.user.id) {
      throw new ApiError(400, "Username or email already exists");
    }
  }

  // Perform the update
  const updatedAdmin = await updateAdmin(req.user.id, updates);

  if (!updatedAdmin) {
    throw new ApiError(500, "Error while updating admin profile");
  }

  // Fetch the updated user data
  const newUser = await findUserInTables(
    updates.username || username,
    updates.email || email,
  );

  if (!newUser) {
    throw new ApiError(404, "Update successful but user not found");
  }

  const { password: _, ...user } = newUser;

  const accessToken = generateAccessToken(user.id, user.email);

  return res.status(200).json(
    new ApiResponse(200, "Admin updated successfully", {
      user,
      accessToken,
    }),
  );
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

  const validBirthday = validateDate(birthday);

  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload an avatar");
  }

  const avatarLocalPathPublic = path.join(
    __dirname,
    "public",
    "profile",
    path.basename(avatarLocalPath),
  );

  const existUser = await findUserInTables(username, email);
  if (existUser) {
    throw new ApiError(400, "Username already exists");
  }

  const teacherData = await createTeacher({
    username: username?.trim(),
    password: password?.trim(),
    email: email?.toLowerCase().trim(),
    name,
    surname,
    phone,
    address,
    bloodType,
    sex: sex.toLowerCase().trim(),
    birthday: validBirthday,
    profile: avatarLocalPathPublic,
  });

  if (!teacherData) {
    throw new ApiError(500, "Error while creating teacher");
  }

  const newUser = await findUserInTables(username, email);

  if (!newUser) {
    throw new ApiError(
      404,
      "User creation successful but not found in any table",
    );
  }

  const { password: _, ...user } = newUser;

  const accessToken = generateAccessToken(user.id, user.email);

  return res.status(201).json(
    new ApiResponse(201, "Teacher Created Successfully", {
      user,
      accessToken,
    }),
  );
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

  const existUser = await findUserInTables(username, email);
  if (existUser) {
    throw new ApiError(400, "Username already exists");
  }

  const ParentData = await createParent({
    username: username?.trim(),
    password: password?.trim(),
    email: email?.toLowerCase().trim(),
    name,
    surname,
    phone,
    address,
  });

  if (!ParentData) {
    throw new ApiError(500, "Error while creating parent");
  }

  const newUser = await findUserInTables(username, email);

  if (!newUser) {
    throw new ApiError(
      404,
      "User creation successful but not found in any table",
    );
  }

  const { password: _, ...user } = newUser;

  const accessToken = generateAccessToken(user.id, user.email);

  return res.status(201).json(
    new ApiResponse(201, "Parent Created Successfully", {
      user,
      accessToken,
    }),
  );
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

  const validBirthday = validateDate(birthday);

  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload an avatar");
  }

  const avatarLocalPathPublic = path.join(
    __dirname,
    "public",
    "profile",
    path.basename(avatarLocalPath),
  );

  const existUser = await findUserInTables(username, email);
  if (existUser) {
    throw new ApiError(400, "Username already exists");
  }

  const studentData = await createStudent({
    username: username?.trim(),
    password: password?.trim(),
    email: email?.toLowerCase().trim(),
    name,
    surname,
    phone,
    address,
    bloodType,
    sex: sex.toLowerCase().trim(),
    birthday: validBirthday,
    profile: avatarLocalPathPublic,
  });

  if (!studentData) {
    throw new ApiError(500, "Error while creating student");
  }

  const newUser = await findUserInTables(username, email);

  if (!newUser) {
    throw new ApiError(
      404,
      "User creation successful but not found in any table",
    );
  }

  const { password: _, ...user } = newUser;

  const accessToken = generateAccessToken(user.id, user.email);

  return res.status(201).json(
    new ApiResponse(201, "Student Created Successfully", {
      user,
      accessToken,
    }),
  );
});

const userLogin = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!username && !email) {
    throw new ApiError("Please provide either a username or an email.", 400);
  }

  if (!password) {
    throw new ApiError("Password is required.", 400);
  }

  const existUser = await findUserInTables(username, email);

  if (!existUser) {
    throw new ApiError("Invalid credentials. User not found.", 401);
  }

  const isPasswordMatch = await comparePassword(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError("Invalid username, email, or password.", 401);
  }

  const { password: _, ...user } = existUser;

  const accessToken = generateAccessToken(user.id, user.email);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, "Login successful", {
        user,
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

const getCurrentUser = asyncHandler(async (req, res) => {
  const userID = req.user?.id;

  if (!userID) {
    throw new ApiError("User not logged in", 401);
  }

  const { password: _, ...user } = await findUserById(userID);

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", user));
});

// const updateUserAvatar = asyncHandler(async (req, res) => {});

// const updateUserDetails = asyncHandler(async (req, res) => {});

// const changeCurrentPassword = asyncHandler(async (req, res) => {});

// const refreshAccessToken = asyncHandler(async (req, res) => {});

export {
  adminSignup,
  adminUpdate,
  teacherSignup,
  parentSignup,
  studentSignup,
  userLogin,
  userLogout,
  authenticateUserController,
  getCurrentUser,
};
