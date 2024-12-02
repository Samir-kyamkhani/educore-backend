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

export const findUserById = async (id) => {
  const tables = ["admin", "student", "teacher", "parent"];

  for (const table of tables) {
    const query = `SELECT * FROM ?? WHERE id = ?`;
    const queryParams = [table, id];

    const [result] = await pool.query(query, queryParams);

    if (result.length > 0) {
      return { ...result[0], role: table };
    }
  }

  return null; // Return null if no user is found in any table
};

export const updateUser = async (id, updates, table) => {
  const allowedTables = ["admin", "student", "teacher", "parent"];
  if (!allowedTables.includes(table)) throw new ApiError("Invalid table name");

  const setClause = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];

  try {
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

export const findUsers = async (table) => {
  const allowedTables = ["admin", "student", "teacher", "parent"];

  // Validate the table name
  if (!allowedTables.includes(table)) {
    throw new ApiError("Invalid table name");
  }

  // Query to fetch all rows from the table
  const query = `SELECT * FROM ??`;
  const queryParams = [table];

  const [result] = await pool.query(query, queryParams);

  // Add role field to each user in the result
  return result.map((user) => ({ ...user, role: table }));
};

export const findUserByIdAndDelete = async (id) => {
  const tables = ["admin", "student", "teacher", "parent"];

  for (const table of tables) {
    const selectQuery = `SELECT * FROM ?? WHERE id = ?`;
    const queryParams = [table, id];
    const [result] = await pool.query(selectQuery, queryParams);

    if (result.length > 0) {
      const user = { ...result[0], role: table };

      // Query to delete the user
      const deleteQuery = `DELETE FROM ?? WHERE id = ?`;
      await pool.query(deleteQuery, queryParams);

      return user;
    }
  }

  return null; // Return null if no user is found in any table
};
