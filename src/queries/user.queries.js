import { hashPassword } from "../utils/utils.js";
import { pool } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";

export const createAdmin = async ({
  username,
  password,
  fullName,
  email,
  phoneNumber,
  schoolName,
  schoolAddress,
  schoolContactNumber,
  schoolEmail,
  schoolRegisterId,
  governmentId,
  agreementToTerms,
  schoolEstablished,
  profilePicture,
  schoolLogo,
}) => {
  try {
    const hashedPassword = await hashPassword(password);

    const query = `
        INSERT INTO admin 
        (username, password, fullName, email, phoneNumber, schoolName, schoolAddress, schoolContactNumber, schoolEmail, schoolRegisterId, governmentId, agreementToTerms, schoolEstablished, profilePicture, schoolLogo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      username,
      hashedPassword,
      fullName,
      email,
      phoneNumber,
      schoolName,
      schoolAddress,
      schoolContactNumber,
      schoolEmail,
      schoolRegisterId,
      governmentId,
      agreementToTerms,
      schoolEstablished,
      profilePicture,
      schoolLogo,
    ];

    const data = await pool.query(query, params);
    return data;
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createTeacher = async ({
  username,
  password,
  name,
  surname,
  email,
  phone,
  address,
  bloodType,
  sex,
  profile,
  birthday,
}) => {
  try {
    const hashedPassword = await hashPassword(password);

    const query = `
       INSERT INTO teacher (username, password, name, surname, email, phone, address, bloodType, sex, birthday, profile, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    const params = [
      username,
      hashedPassword,
      name,
      surname,
      email,
      phone,
      address,
      bloodType,
      sex,
      birthday,
      profile,
    ];

    const data = await pool.query(query, params);
    return data;
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createParent = async ({
  username,
  password,
  name,
  surname,
  email,
  phone,
  address,
}) => {
  try {
    const hashedPassword = await hashPassword(password);

    const query = `
        INSERT INTO parent (username, password, name, surname, email, phone, address, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;

    const params = [
      username,
      hashedPassword,
      name,
      surname,
      email,
      phone,
      address,
    ];

    const data = await pool.query(query, params);
    return data;
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createStudent = async ({
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
  profile,
}) => {
  try {
    const hashedPassword = await hashPassword(password);

    const query = `INSERT INTO student (username, password, name, surname, email, phone, address, bloodType, sex, birthday, profile, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    const params = [
      username,
      hashedPassword,
      name,
      surname,
      email,
      phone,
      address,
      bloodType,
      sex,
      birthday,
      profile,
    ];

    const data = await pool.query(query, params);
    return data;
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const findUserInTables = async (username, email) => {
  const tables = ["admin", "student", "teacher", "parent"];

  for (const table of tables) {
    let query = `SELECT * FROM ?? WHERE`;
    const queryParams = [table];

    if (username) {
      query += ` username = ?`;
      queryParams.push(username);
    }

    if (email) {
      query += username ? ` OR email = ?` : ` email = ?`;
      queryParams.push(email);
    }

    const [result] = await pool.query(query, queryParams);

    if (result.length > 0) {
      return { ...result[0], role: table };
    }
  }

  return null;
};
