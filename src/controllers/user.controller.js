import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createAdmin,
  createParent,
  createStudent,
  createTeacher,
  findUser,
  findUserByIdAndDelete,
  findUserByIdAndSchool,
  findUserInSchool,
  findUsers,
  updateUser,
} from "../queries/user.queries.js";
import {
  comparePassword,
  generateAccessToken,
  hashPassword,
  validateDate,
} from "../utils/utils.js";
import { fileURLToPath } from "url";
import path from "path";
import { findSingleRecordByIdAndSchool } from "../queries/other.queries.js";

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
    ].some(
      (field) => !field || typeof field !== "string" || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All required fields must be provided and valid");
  }

  if (typeof agreementToTerms !== "boolean") {
    agreementToTerms =
      agreementToTerms === "true"
        ? true
        : agreementToTerms === "false"
          ? false
          : undefined;

    if (agreementToTerms === undefined) {
      throw new ApiError(400, "'agreementToTerms' must be a boolean value");
    }
  }

  const newSchoolEstablished = validateDate(schoolEstablished);
  if (!newSchoolEstablished) {
    throw new ApiError(400, "Invalid 'schoolEstablished' date format");
  }

  const avatarLocalPath = req.files?.profilePicture?.[0]?.path;
  const schoolLogo = req.files?.schoolLogo?.[0]?.path;
  if (!avatarLocalPath || !schoolLogo) {
    throw new ApiError(400, "Please upload both avatar and school logo");
  }

  const avatarPublicPath = path.join(
    __dirname,
    "public",
    "profilePicture",
    path.basename(avatarLocalPath),
  );
  const schoolLogoPublicPath = path.join(
    __dirname,
    "public",
    "schoolLogo",
    path.basename(schoolLogo),
  );

  const existUser = await findUserInSchool(username, email, null, "admin");
  if (existUser) {
    throw new ApiError(400, "Username or email already exists");
  }

  const adminData = await createAdmin({
    username: username.trim(),
    password: password.trim(),
    email: email.toLowerCase().trim(),
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
    profilePicture: avatarPublicPath,
    schoolLogo: schoolLogoPublicPath,
  });

  if (!adminData) {
    throw new ApiError(500, "Error while creating admin");
  }

  const newUser = await findUserInSchool(username, email, null, "admin");
  if (!newUser) {
    throw new ApiError(404, "User creation successful but user not found");
  }

  const { password: _, ...user } = newUser;
  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.school_id,
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Admin Created Successfully", { user, accessToken }),
    );
});

const adminUpdate = asyncHandler(async (req, res) => {
  const {
    username,
    oldPassword,
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

  const { role, school_id } = req.user;

  if (!school_id) {
    throw new ApiError(403, "School ID is missing");
  }

  if (role !== "admin" && role !== "superadmin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const updates = {};

  if (username?.trim()) updates.username = username.trim();
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

  if (password?.trim() && !oldPassword?.trim()) {
    throw new ApiError(
      401,
      "Please provide the old password to change the password",
    );
  }

  if (oldPassword?.trim() && password?.trim()) {
    const existUser = await findUserByIdAndSchool(
      req.user.id,
      "admin",
      school_id,
    );

    if (!existUser) {
      throw new ApiError(401, "User not found with the given ID");
    }

    const isPasswordMatch = await comparePassword(
      oldPassword,
      existUser.password,
    );
    if (!isPasswordMatch) {
      throw new ApiError(401, "Old password does not match");
    }

    updates.password = await hashPassword(password);
  }

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

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  if (updates.username || updates.email) {
    const existingUser = await findUserInSchool(
      updates.username || username,
      updates.email || email,
      school_id,
      "admin",
    );
    if (existingUser && existingUser.id !== req.user.id) {
      throw new ApiError(
        400,
        "Username or email already exists within the school",
      );
    }
  }

  const updatedAdmin = await updateUser(
    req.user.id,
    updates,
    "admin",
    school_id,
  );

  if (!updatedAdmin) {
    throw new ApiError(500, "Error while updating admin profile");
  }

  const updatedUser = await findUserInSchool(
    updates.username || username,
    updates.email || email,
    school_id,
    "admin",
  );

  if (!updatedUser) {
    throw new ApiError(404, "Update successful, but user not found");
  }

  const { password: _, ...user } = updatedUser;

  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.school_id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Admin updated successfully", { user, accessToken }),
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

  const userRole = req.user.role;
  const school_id = req.user.school_id;

  if (userRole !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

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
    ].some(
      (field) => !field || typeof field !== "string" || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const validBirthday = validateDate(birthday);

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload an avatar");
  }

  const avatarPublicPath = path.join(
    __dirname,
    "public",
    "profile",
    path.basename(avatarLocalPath),
  );

  const existUser = await findUserInSchool(
    username,
    email,
    school_id,
    "teacher",
  );
  if (existUser) {
    throw new ApiError(400, "Username or email already exists");
  }

  const teacherData = await createTeacher({
    username: username.trim(),
    password: password.trim(),
    email: email.toLowerCase().trim(),
    name,
    surname,
    phone,
    address,
    bloodType,
    sex: sex.toLowerCase().trim(),
    birthday: validBirthday,
    profile: avatarPublicPath,
    school_id,
  });

  if (!teacherData) {
    throw new ApiError(500, "Error while creating teacher");
  }

  const newUser = await findUserInSchool(username, email, school_id, "teacher");

  if (!newUser) {
    throw new ApiError(404, "User creation successful but user not found");
  }

  const { password: _, ...user } = newUser;
  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.school_id,
  );

  return res.status(201).json(
    new ApiResponse(201, "Teacher Created Successfully", {
      user,
      accessToken,
    }),
  );
});

const teacherUpdate = asyncHandler(async (req, res) => {
  const teacherId = req.params.id;
  const { school_id, role } = req.user;

  const {
    username,
    oldPassword,
    password,
    email,
    name,
    surname,
    phone,
    address,
    bloodType,
    sex,
    birthday,
  } = req.body;

  if (role !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!teacherId) {
    throw new ApiError(400, "Teacher ID is required");
  }

  const teacher = await findUserByIdAndSchool(teacherId, "teacher", school_id);
  if (!teacher) {
    throw new ApiError(
      404,
      "Teacher not found or does not belong to your school",
    );
  }

  const updates = {};

  if (username?.trim()) updates.username = username.trim();
  if (email?.trim()) updates.email = email.toLowerCase().trim();
  if (name?.trim()) updates.name = name.trim();
  if (surname?.trim()) updates.surname = surname.trim();
  if (phone?.trim()) updates.phone = phone.trim();
  if (address?.trim()) updates.address = address.trim();
  if (bloodType?.trim()) updates.bloodType = bloodType.trim();
  if (sex?.toLowerCase().trim()) updates.sex = sex.toLowerCase().trim();
  if (birthday) updates.birthday = validateDate(birthday);

  if (password?.trim()) {
    if (!oldPassword?.trim()) {
      throw new ApiError(
        401,
        "Please provide the old password to change the password",
      );
    }

    const isPasswordMatch = await comparePassword(
      oldPassword,
      teacher.password,
    );
    if (!isPasswordMatch) {
      throw new ApiError(401, "Old password does not match");
    }

    updates.password = await hashPassword(password);
  }

  const avatarLocalPath = req.file?.path;
  if (avatarLocalPath) {
    updates.profile = path.join(
      __dirname,
      "public",
      "profile",
      path.basename(avatarLocalPath),
    );
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  if (updates.username || updates.email) {
    const existingUser = await findUserInSchool(
      updates.username || username,
      updates.email || email,
      school_id,
      "teacher",
    );
    if (existingUser && existingUser.id !== teacherId) {
      throw new ApiError(
        400,
        "Username or email already exists within the school",
      );
    }
  }

  const updatedTeacher = await updateUser(
    teacherId,
    updates,
    "teacher",
    school_id,
  );
  if (!updatedTeacher) {
    throw new ApiError(500, "Error while updating teacher profile");
  }

  const updatedUser = await findUserByIdAndSchool(
    teacherId,
    "teacher",
    school_id,
  );
  if (!updatedUser) {
    throw new ApiError(404, "Update successful but user not found");
  }

  const { password: _, ...user } = updatedUser;

  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.school_id,
  );

  return res.status(200).json(
    new ApiResponse(200, "Teacher updated successfully", {
      user,
      accessToken,
    }),
  );
});

const parentSignup = asyncHandler(async (req, res) => {
  const { username, password, name, surname, email, phone, address } = req.body;
  const userRole = req.user.role;
  const school_id = req.user.school_id;

  if (userRole !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (
    [username, password, name, surname, email, phone, address].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existUser = await findUserInSchool(
    username,
    email,
    school_id,
    "parent",
  );
  if (existUser) {
    throw new ApiError(400, "Username or email already exists");
  }

  const parentData = await createParent({
    username: username.trim(),
    password: password.trim(),
    email: email.toLowerCase().trim(),
    name,
    surname,
    phone,
    address,
    school_id,
  });

  if (!parentData) {
    throw new ApiError(500, "Error while creating parent");
  }

  const newUser = await findUserInSchool(username, email, school_id, "parent");
  if (!newUser) {
    throw new ApiError(
      404,
      "User creation successful but not found in any table",
    );
  }

  const { password: _, ...user } = newUser;
  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.school_id,
  );

  return res.status(201).json(
    new ApiResponse(201, "Parent Created Successfully", {
      user,
      accessToken,
    }),
  );
});

const parentUpdate = asyncHandler(async (req, res) => {
  const parentId = req.params.id;
  const { school_id, role } = req.user;

  const {
    username,
    oldPassword,
    password,
    email,
    name,
    surname,
    phone,
    address,
  } = req.body;

  if (role !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!parentId) {
    throw new ApiError(400, "Parent ID is required");
  }

  const parent = await findUserByIdAndSchool(parentId, "parent", school_id);
  if (!parent) {
    throw new ApiError(
      404,
      "Parent not found or does not belong to your school",
    );
  }

  const updates = {};

  if (username?.trim()) updates.username = username.trim();
  if (email?.trim()) updates.email = email.toLowerCase().trim();
  if (name?.trim()) updates.name = name.trim();
  if (surname?.trim()) updates.surname = surname.trim();
  if (phone?.trim()) updates.phone = phone.trim();
  if (address?.trim()) updates.address = address.trim();

  if (password?.trim()) {
    if (!oldPassword?.trim()) {
      throw new ApiError(
        401,
        "Please provide the old password when updating the password",
      );
    }

    const isPasswordMatch = await comparePassword(oldPassword, parent.password);
    if (!isPasswordMatch) {
      throw new ApiError(401, "Old password does not match");
    }

    updates.password = await hashPassword(password);
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  if (updates.username || updates.email) {
    const existingUser = await findUserInSchool(
      updates.username || username,
      updates.email || email,
      school_id,
      "parent",
    );
    if (existingUser && existingUser.id !== parentId) {
      throw new ApiError(
        400,
        "Username or email already exists within the school",
      );
    }
  }

  const updatedParent = await updateUser(
    parentId,
    updates,
    "parent",
    school_id,
  );
  if (!updatedParent) {
    throw new ApiError(500, "Error while updating parent profile");
  }

  const updatedUser = await findUserByIdAndSchool(
    parentId,
    "parent",
    school_id,
  );
  if (!updatedUser) {
    throw new ApiError(404, "Update successful but user not found");
  }

  const { password: _, ...user } = updatedUser;
  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.school_id,
  );

  return res.status(200).json(
    new ApiResponse(200, "Parent updated successfully", {
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
    parentUsername,
    classId,
    gradeId,
  } = req.body;

  const userRole = req.user.role;
  const school_id = req.user.school_id;

  if (userRole !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

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

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload an avatar");
  }

  const avatarPublicPath = path.join(
    __dirname,
    "public",
    "profile",
    path.basename(avatarLocalPath),
  );

  const existUser = await findUserInSchool(
    username,
    email,
    school_id,
    "student",
  );
  if (existUser) {
    throw new ApiError(400, "Username or email already exists");
  }

  let parentId = null;
  if (parentUsername) {
    const parent = await findUserInSchool(
      parentUsername,
      email,
      school_id,
      "parent",
    );
    if (!parent) {
      throw new ApiError(404, "Parent not found");
    }
    parentId = parent.id;
  } else if (req.body.parentId) {
    parentId = req.body.parentId;
  }

  let addClassId = null;
  if (classId) {
    const newClass = await findSingleRecordByIdAndSchool(
      "class",
      classId,
      school_id,
    );
    if (!newClass) {
      throw new ApiError(404, "Class not found");
    }
    addClassId = newClass.id;
  }

  let addGradeId = null;
  if (gradeId) {
    const newGrade = await findSingleRecordByIdAndSchool(
      "grade",
      gradeId,
      school_id,
    );
    if (!newGrade) {
      throw new ApiError(404, "Grade not found");
    }
    addGradeId = newGrade.id;
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
    profile: avatarPublicPath,
    parentId,
    classId: addClassId,
    gradeId: addGradeId,
    school_id,
  });

  if (!studentData) {
    throw new ApiError(500, "Error while creating student");
  }

  const newUser = await findUserInSchool(username, email, school_id, "student");
  if (!newUser) {
    throw new ApiError(404, "User creation successful but user not found");
  }

  const { password: _, ...user } = newUser;
  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.school_id,
  );

  return res.status(201).json(
    new ApiResponse(201, "Student Created Successfully", {
      user,
      accessToken,
    }),
  );
});

const studentUpdate = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  const { school_id, role } = req.user;

  const {
    username,
    oldPassword,
    password,
    name,
    surname,
    email,
    phone,
    address,
    bloodType,
    sex,
    birthday,
    classId,
    gradeId,
  } = req.body;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (role !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!studentId) {
    throw new ApiError(400, "Student ID is required");
  }

  const student = await findUserByIdAndSchool(studentId, "student", school_id);
  if (!student) {
    throw new ApiError(
      404,
      "Student not found or does not belong to your school",
    );
  }

  const updates = {};

  if (username?.trim()) updates.username = username.trim();
  if (email?.trim()) updates.email = email.toLowerCase().trim();
  if (name?.trim()) updates.name = name.trim();
  if (surname?.trim()) updates.surname = surname.trim();
  if (phone?.trim()) updates.phone = phone.trim();
  if (address?.trim()) updates.address = address.trim();
  if (bloodType?.trim()) updates.bloodType = bloodType.trim();
  if (sex?.toLowerCase().trim()) updates.sex = sex.toLowerCase().trim();
  if (birthday) updates.birthday = validateDate(birthday);

  if (password?.trim()) {
    if (!oldPassword?.trim()) {
      throw new ApiError(401, "Please also provide the old password");
    }

    const isPasswordMatch = await comparePassword(
      oldPassword,
      student.password,
    );
    if (!isPasswordMatch) {
      throw new ApiError(401, "Old password does not match");
    }

    updates.password = await hashPassword(password);
  }

  const avatarLocalPath = req.file?.path;
  if (avatarLocalPath) {
    updates.profile = path.join(
      __dirname,
      "public",
      "profile",
      path.basename(avatarLocalPath),
    );
  }

  if (classId) {
    const newClass = await findSingleRecordByIdAndSchool(
      "class",
      classId,
      school_id,
    );
    if (!newClass) {
      throw new ApiError(404, "Class not found");
    }
    updates.classId = newClass.id;
  }

  if (gradeId) {
    const newGrade = await findSingleRecordByIdAndSchool(
      "grade",
      gradeId,
      school_id,
    );
    if (!newGrade) {
      throw new ApiError(404, "Grade not found");
    }
    updates.gradeId = newGrade.id;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided to update");
  }

  if (updates.username || updates.email) {
    const existingUser = await findUserInSchool(
      updates.username || username,
      updates.email || email,
      school_id,
      "student",
    );
    if (existingUser && existingUser.id !== studentId) {
      throw new ApiError(
        400,
        "Username or email already exists within the school",
      );
    }
  }

  const updatedStudent = await updateUser(
    studentId,
    updates,
    "student",
    school_id,
  );
  if (!updatedStudent) {
    throw new ApiError(500, "Error while updating student profile");
  }

  const updatedUser = await findUserByIdAndSchool(
    studentId,
    "student",
    school_id,
  );
  if (!updatedUser) {
    throw new ApiError(404, "Update successful but user not found");
  }

  const { password: _, ...user } = updatedUser;

  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.school_id,
  );

  return res.status(200).json(
    new ApiResponse(200, "Student updated successfully", {
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

  const allowedRoles = ["admin", "teacher", "parent", "student"];

  let existUser = null;

  for (const role of allowedRoles) {
    existUser = await findUser(username, email, role);
    if (existUser) break;
  }

  if (!existUser) {
    throw new ApiError("Invalid credentials. User not found.", 401);
  }

  const isPasswordMatch = await comparePassword(password, existUser.password);
  if (!isPasswordMatch) {
    throw new ApiError("Invalid username, email, or password.", 401);
  }

  const { password: _, ...user } = existUser;

  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.school_id,
  );

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
  const school_id = req.user?.school_id;

  if (!userID) {
    throw new ApiError("User not logged in", 401);
  }

  const userData = await findUserByIdAndSchool(userID, null, school_id);

  if (!userData) {
    throw new ApiError("User not found", 404);
  }

  const { password, ...user } = userData;

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", user));
});

const getAllAdmins = asyncHandler(async (req, res) => {
  const userRole = req.user.role;

  if (userRole !== "superadmin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const admins = await findUsers("admin");

  if (!admins.length) {
    return res.status(404).json(new ApiResponse(404, "No admin users found"));
  }

  const sanitizedAdmins = admins.map(({ password, ...admin }) => admin);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "All admins fetched successfully", sanitizedAdmins),
    );
});

const getAllTeachers = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const school_id = req.user.school_id;

  if (userRole !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  const teachers = await findUsers("teacher", { school_id });

  if (!teachers.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No teacher users found for this school"));
  }

  const sanitizedTeachers = teachers.map(({ password, ...teacher }) => teacher);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "All teachers fetched successfully",
        sanitizedTeachers,
      ),
    );
});

const getAllParents = asyncHandler(async (req, res) => {
  const { role: userRole, school_id } = req.user;

  if (userRole !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const parents = await findUsers("parent", { school_id });

  if (!parents.length) {
    return res.status(404).json(new ApiResponse(404, "No parent users found"));
  }

  const sanitizedParents = parents.map(({ password, ...parent }) => parent);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "All parents fetched successfully",
        sanitizedParents,
      ),
    );
});

const getAllStudents = asyncHandler(async (req, res) => {
  const { role: userRole, school_id } = req.user;

  if (userRole !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const students = await findUsers("student", { school_id });

  if (!students.length) {
    return res.status(404).json(new ApiResponse(404, "No student users found"));
  }

  const sanitizedStudents = students.map(({ password, ...student }) => student);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "All students fetched successfully",
        sanitizedStudents,
      ),
    );
});

const getSingleUser = asyncHandler(async (req, res) => {
  const { role: userRole, school_id } = req.user;
  const userId = req.params.id;

  if (userRole !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await findUserByIdAndSchool(userId, null, school_id);

  if (!user || user.school_id !== school_id) {
    throw new ApiError(404, "User not found or does not belong to this school");
  }

  const { password, ...sanitizedUser } = user;

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", sanitizedUser));
});

const deleteSingleUser = asyncHandler(async (req, res) => {
  const { role: userRole, school_id } = req.user;
  const userId = req.params.id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (userRole !== "admin" && userRole !== "superadmin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const user = await findUserByIdAndSchool(userId, school_id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (userRole === "admin" && user.school_id !== school_id) {
    throw new ApiError(403, "You cannot delete users from another school");
  }

  const deletedUser = await findUserByIdAndDelete(userId);

  if (!deletedUser) {
    throw new ApiError(500, "Failed to delete user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User deleted successfully", { id: userId }));
});

export {
  adminSignup,
  adminUpdate,
  teacherSignup,
  teacherUpdate,
  parentSignup,
  parentUpdate,
  studentSignup,
  studentUpdate,
  userLogin,
  userLogout,
  authenticateUserController,
  getCurrentUser,
  getAllAdmins,
  getAllTeachers,
  getAllParents,
  getAllStudents,
  getSingleUser,
  deleteSingleUser,
};
