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
  school_id,
}) => {
  try {
    const hashedPassword = await hashPassword(password);

    const query = `
       INSERT INTO teacher (username, password, name, surname, email, phone, address, bloodType, sex, birthday, profile, school_id, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

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
      school_id,
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
  school_id,
}) => {
  try {
    const hashedPassword = await hashPassword(password);

    const query = `
        INSERT INTO parent (username, password, name, surname, email, phone, address, school_id, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    const params = [
      username,
      hashedPassword,
      name,
      surname,
      email,
      phone,
      address,
      school_id,
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
  parentId,
  classId,
  gradeId,
  school_id,
}) => {
  try {
    const hashedPassword = await hashPassword(password);

    const query = `INSERT INTO student (username, password, name, surname, email, phone, address, bloodType, sex, birthday, profile, parentId, classId, gradeId, school_id, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

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
      parentId,
      classId,
      gradeId,
      school_id,
    ];

    const data = await pool.query(query, params);
    return data;
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const findUserInSchool = async (
  username,
  email,
  school_id,
  table = "admin",
) => {
  const query = `
    SELECT * FROM ?? 
    WHERE (username = ? OR email = ?) AND school_id = ?
  `;
  const [results] = await pool.query(query, [
    table,
    username,
    email,
    school_id,
  ]);
  return results.length > 0 ? results[0] : null;
};

export const findUser = async (username, email, table) => {
  const allowedTables = ["admin", "teacher", "parent", "student"];

  if (!allowedTables.includes(table)) {
    throw new Error(`Invalid table name: ${table}`);
  }

  const query = `
    SELECT * FROM ${table}
    WHERE (username = ? OR email = ?)
  `;

  const [results] = await pool.query(query, [username, email]);
  return results.length > 0 ? results[0] : null;
};

export const findUserByIdAndSchool = async (id, table, school_id) => {
  const tables = ["admin", "student", "teacher", "parent"];

  for (table of tables) {
    const selectQuery = `SELECT * FROM ?? WHERE id = ? AND school_id = ?`;
    const queryParams = [table, id, school_id];

    try {
      const [result] = await pool.query(selectQuery, queryParams);

      if (result.length > 0) {
        const user = { ...result[0], role: table };
        return user;
      }
    } catch (error) {
      console.error("Error in SQL query:", error.message);
    }
  }

  return null;
};

export const updateUser = async (id, updates, table, school_id) => {
  const allowedTables = ["admin", "student", "teacher", "parent"];
  if (!allowedTables.includes(table)) throw new ApiError("Invalid table name");

  const setClause = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id, school_id];

  try {
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ? AND school_id = ?`;
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  } catch (error) {
    throw new ApiError(500, `Update failed: ${error.message}`);
  }
};

export const findUsers = async (table, filters = {}) => {
  const allowedTables = ["admin", "student", "teacher", "parent"];

  if (!allowedTables.includes(table)) {
    throw new ApiError(400, "Invalid table name");
  }

  let query = `SELECT * FROM ??`;
  const queryParams = [table];

  if (Object.keys(filters).length > 0) {
    const filterConditions = Object.keys(filters)
      .map((key) => `\`${key}\` = ?`)
      .join(" AND ");
    query += ` WHERE ${filterConditions}`;
    queryParams.push(...Object.values(filters));
  }

  const [result] = await pool.query(query, queryParams);

  return result.map((user) => ({ ...user, role: table }));
};

export const findUserByIdAndDelete = async (id) => {
  const tables = ["admin", "student", "teacher", "parent"];

  for (const table of tables) {
    const selectQuery = `SELECT * FROM ?? WHERE id = ?`;
    const selectParams = [table, id];
    const [result] = await pool.query(selectQuery, selectParams);

    if (result.length > 0) {
      const user = { ...result[0], role: table };

      const deleteQuery = `DELETE FROM ?? WHERE id = ?`;
      const deleteParams = [table, id];
      await pool.query(deleteQuery, deleteParams);

      return user;
    }
  }

  return null;
};
