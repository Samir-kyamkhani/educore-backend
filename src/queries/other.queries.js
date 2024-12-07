import { pool } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";

export const createGrade = async ({ level }) => {
  try {
    const existingGradeQuery = "SELECT * FROM grade WHERE level = ?";
    const [existingGrade] = await pool.query(existingGradeQuery, [level]);

    if (existingGrade.length > 0) {
      throw new ApiError(400, "Grade level already exists");
    }

    const insertQuery = `
      INSERT INTO grade (level, createdAt)
      VALUES (?, NOW())`;

    const [insertResult] = await pool.query(insertQuery, [level]);

    const gradeId = insertResult.insertId;
    const [newGrade] = await pool.query("SELECT * FROM grade WHERE id = ?", [
      gradeId,
    ]);

    return newGrade[0];
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createClass = async ({
  name,
  capacity,
  supervisorId,
  gradeId,
}) => {
  try {
    const existingClassQuery = "SELECT * FROM class WHERE name = ?";
    const [existingClass] = await pool.query(existingClassQuery, [name]);

    if (existingClass.length > 0) {
      throw new ApiError(400, "Class name already exists");
    }

    const insertQuery = `
      INSERT INTO class (name, capacity, supervisorId, gradeId, createdAt)
      VALUES (?, ?, ?, ?, NOW())`;

    const params = [name, capacity, supervisorId, gradeId];
    const [insertResult] = await pool.query(insertQuery, params);

    const classId = insertResult.insertId;
    const [newClass] = await pool.query("SELECT * FROM class WHERE id = ?", [
      classId,
    ]);

    return newClass[0];
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createSubject = async ({ name }) => {
  try {
    const existingSubjectQuery = "SELECT * FROM subject WHERE name = ?";
    const [existingSubject] = await pool.query(existingSubjectQuery, [name]);

    if (existingSubject.length > 0) {
      throw new ApiError(400, "Subject name already exists");
    }

    const insertQuery = `
      INSERT INTO subject (name, createdAt)
      VALUES (?, NOW())`;

    const [insertResult] = await pool.query(insertQuery, [name]);

    const subjectId = insertResult.insertId;
    const [newSubject] = await pool.query(
      "SELECT * FROM subject WHERE id = ?",
      [subjectId],
    );

    return newSubject[0];
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createLesson = async ({
  name,
  day,
  startTime,
  endTime,
  subjectId,
  classId,
  teacherId,
}) => {
  try {
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    if (!validDays.includes(day)) {
      throw new ApiError(
        400,
        `Invalid day. Allowed values: ${validDays.join(", ")}`,
      );
    }

    if (
      new Date(`1970-01-01T${startTime}:00Z`) >=
      new Date(`1970-01-01T${endTime}:00Z`)
    ) {
      throw new ApiError(400, "Start time must be earlier than end time");
    }

    const startTimeFormatted = new Date(`1970-01-01T${startTime}:00Z`)
      .toISOString()
      .substr(11, 8);
    const endTimeFormatted = new Date(`1970-01-01T${endTime}:00Z`)
      .toISOString()
      .substr(11, 8);

    const subjectQuery = "SELECT * FROM subject WHERE id = ?";
    const [subject] = await pool.query(subjectQuery, [subjectId]);
    if (subject.length === 0) {
      throw new ApiError(404, "Subject not found");
    }

    const classQuery = "SELECT * FROM class WHERE id = ?";
    const [classExists] = await pool.query(classQuery, [classId]);
    if (classExists.length === 0) {
      throw new ApiError(404, "Class not found");
    }

    const teacherQuery = "SELECT * FROM teacher WHERE id = ?";
    const [teacher] = await pool.query(teacherQuery, [teacherId]);
    if (teacher.length === 0) {
      throw new ApiError(404, "Teacher not found");
    }

    const query = `
        INSERT INTO lesson (name, day, startTime, endTime, subjectId, classId, teacherId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
    const params = [
      name,
      day,
      startTimeFormatted,
      endTimeFormatted,
      subjectId,
      classId,
      teacherId,
    ];

    const [insertResult] = await pool.query(query, params);

    const selectQuery = "SELECT * FROM lesson WHERE id = ?";
    const [lessonData] = await pool.query(selectQuery, [insertResult.insertId]);

    return lessonData;
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createExam = async ({ title, startTime, endTime, lessonId }) => {
  try {
    if (new Date(startTime) >= new Date(endTime)) {
      throw new ApiError(400, "Start time must be earlier than end time");
    }

    const lessonQuery = "SELECT * FROM lesson WHERE id = ?";
    const [lesson] = await pool.query(lessonQuery, [lessonId]);
    if (lesson.length === 0) {
      throw new ApiError(404, "Lesson not found");
    }

    const query = `
      INSERT INTO exam (title, startTime, endTime, lessonId, createdAt)
      VALUES (?, ?, ?, ?, NOW())`;

    const params = [title, startTime, endTime, lessonId];
    const [result] = await pool.query(query, params);

    return { id: result.insertId, title, startTime, endTime, lessonId };
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createAssignment = async ({
  title,
  startDate,
  dueDate,
  lessonId,
}) => {
  try {
    if (new Date(startDate) >= new Date(dueDate)) {
      throw new ApiError(400, "Start date must be earlier than due date");
    }

    const lessonQuery = "SELECT * FROM lesson WHERE id = ?";
    const [lesson] = await pool.query(lessonQuery, [lessonId]);
    if (lesson.length === 0) {
      throw new ApiError(404, "Lesson not found");
    }

    const query = `
      INSERT INTO assignment (title, startDate, dueDate, lessonId, createdAt)
      VALUES (?, ?, ?, ?, NOW())`;

    const params = [title, startDate, dueDate, lessonId];
    const [result] = await pool.query(query, params);

    return { id: result.insertId, title, startDate, dueDate, lessonId };
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createResult = async ({
  score,
  examId,
  assignmentId,
  studentId,
}) => {
  try {
    if (!examId && !assignmentId) {
      throw new ApiError(400, "Either examId or assignmentId is required");
    }

    if (examId && assignmentId) {
      throw new ApiError(
        400,
        "Both examId and assignmentId cannot be provided",
      );
    }

    if (examId) {
      const examQuery = "SELECT * FROM exam WHERE id = ?";
      const [exam] = await pool.query(examQuery, [examId]);
      if (exam.length === 0) {
        throw new ApiError(404, "Exam not found");
      }
    }

    if (assignmentId) {
      const assignmentQuery = "SELECT * FROM assignment WHERE id = ?";
      const [assignment] = await pool.query(assignmentQuery, [assignmentId]);
      if (assignment.length === 0) {
        throw new ApiError(404, "Assignment not found");
      }
    }

    const studentQuery = "SELECT * FROM student WHERE id = ?";
    const [student] = await pool.query(studentQuery, [studentId]);
    if (student.length === 0) {
      throw new ApiError(404, "Student not found");
    }

    const query = `
      INSERT INTO result (score, examId, assignmentId, studentId, createdAt)
      VALUES (?, ?, ?, ?, NOW())`;

    const params = [score, examId || null, assignmentId || null, studentId];
    const [result] = await pool.query(query, params);

    return { id: result.insertId, score, examId, assignmentId, studentId };
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createAttendance = async ({
  date,
  present,
  studentId,
  lessonId,
}) => {
  try {
    const lessonQuery = "SELECT * FROM lesson WHERE id = ?";
    const [lesson] = await pool.query(lessonQuery, [lessonId]);
    if (lesson.length === 0) {
      throw new ApiError(404, "Lesson not found");
    }

    const studentQuery = "SELECT * FROM student WHERE id = ?";
    const [student] = await pool.query(studentQuery, [studentId]);
    if (student.length === 0) {
      throw new ApiError(404, "Student not found");
    }

    const query = `
      INSERT INTO attendance (date, present, studentId, lessonId, createdAt)
      VALUES (?, ?, ?, ?, NOW())`;

    const params = [date, present, studentId, lessonId];
    const [result] = await pool.query(query, params);

    return { id: result.insertId, date, present, studentId, lessonId };
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createEvent = async ({
  title,
  description,
  startDate,
  endDate,
  classId,
}) => {
  try {
    if (classId) {
      const classQuery = "SELECT * FROM class WHERE id = ?";
      const [classExists] = await pool.query(classQuery, [classId]);
      if (classExists.length === 0) {
        throw new ApiError(404, "Class not found");
      }
    }

    const query = `
      INSERT INTO event (title, description, startDate, endDate, classId, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())`;

    const params = [title, description, startDate, endDate, classId];
    const [result] = await pool.query(query, params);

    return {
      id: result.insertId,
      title,
      description,
      startDate,
      endDate,
      classId,
    };
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createAnnouncement = async ({
  title,
  description,
  date,
  classId,
}) => {
  try {
    if (classId) {
      const classQuery = "SELECT * FROM class WHERE id = ?";
      const [classExists] = await pool.query(classQuery, [classId]);
      if (classExists.length === 0) {
        throw new ApiError(404, "Class not found");
      }
    }

    const query = `
      INSERT INTO announcement (title, description, date, classId, createdAt)
      VALUES (?, ?, ?, ?, NOW())`;

    const params = [title, description, date, classId];
    const [result] = await pool.query(query, params);

    return { id: result.insertId, title, description, date, classId };
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const findById = async (id, table) => {
  const tables = [
    "announcement",
    "assignment",
    "attendance",
    "class",
    "event",
    "exam",
    "grade",
    "lesson",
    "result",
    "subject",
  ];

  if (!tables.includes(table)) {
    return null;
  }

  const query = `SELECT * FROM \`${table}\` WHERE id = ?`;
  const [result] = await pool.query(query, [id]);

  if (result && result.length > 0) {
    return { ...result[0], role: table };
  }

  return null;
};

export const fetchUpdatedDataById = async (id, table) => {
  const data = await findById(id, table);
  if (data) {
    const { role, ...details } = data;
    return details;
  }
  return null;
};

export const updateClassDetails = async (
  id,
  name,
  capacity,
  supervisorId,
  gradeId,
) => {
  const query = `
    UPDATE class
    SET name = ?, capacity = ?, supervisorId = ?, gradeId = ?
    WHERE id = ?`;
  await pool.query(query, [name, capacity, supervisorId, gradeId, id]);
};

export const updateSubjectDetails = async (id, name) => {
  const query = `
    UPDATE subject
    SET name = ?
    WHERE id = ?`;
  await pool.query(query, [name, id]);
};

export const updateLessonDetails = async (
  id,
  name,
  day,
  startTime,
  endTime,
  subjectId,
  classId,
  teacherId,
) => {
  const query = `
    UPDATE lesson
    SET name = ?, day = ?, startTime = ?, endTime = ?, subjectId = ?, classId = ?, teacherId = ?
    WHERE id = ?`;
  await pool.query(query, [
    name,
    day,
    startTime,
    endTime,
    subjectId,
    classId,
    teacherId,
    id,
  ]);
};

export const updateExamDetails = async (
  id,
  title,
  startTime,
  endTime,
  lessonId,
) => {
  const query = `
    UPDATE exam
    SET title = ?, startTime = ?, endTime = ?, lessonId = ?
    WHERE id = ?`;
  await pool.query(query, [title, startTime, endTime, lessonId, id]);
};

export const updateAssignmentDetails = async (
  id,
  title,
  startDate,
  dueDate,
  lessonId,
) => {
  const query = `
    UPDATE assignment
    SET title = ?, startDate = ?, dueDate = ?, lessonId = ?
    WHERE id = ?`;
  await pool.query(query, [title, startDate, dueDate, lessonId, id]);
};

export const updateAttendanceDetails = async (
  id,
  date,
  present,
  studentId,
  lessonId,
) => {
  const query = `
    UPDATE attendance
    SET date = ?, present = ?, studentId = ?, lessonId = ?
    WHERE id = ?`;
  await pool.query(query, [date, present, studentId, lessonId, id]);
};

export const updateAnnouncementDetails = async (
  id,
  title,
  description,
  date,
  classId,
) => {
  const query = `
    UPDATE announcement
    SET title = ?, description = ?, date = ?, classId = ?
    WHERE id = ?`;
  await pool.query(query, [title, description, date, classId, id]);
};

export const updateGradeDetails = async (id, level) => {
  const query = `
    UPDATE grade
    SET level = ?
    WHERE id = ?`;
  await pool.query(query, [level, id]);
};

export const updateResultDetails = async (
  id,
  score,
  examId,
  assignmentId,
  studentId,
) => {
  const query = `
    UPDATE result
    SET score = ?, examId = ?, assignmentId = ?, studentId = ?
    WHERE id = ?`;
  await pool.query(query, [score, examId, assignmentId, studentId, id]);
};

export const updateEventDetails = async (
  id,
  title,
  description,
  startDate,
  endDate,
  classId,
) => {
  const query = `
    UPDATE event
    SET title = ?, description = ?, startDate = ?, endDate = ?, classId = ?
    WHERE id = ?`;
  await pool.query(query, [
    title,
    description,
    startDate,
    endDate,
    classId,
    id,
  ]);
};

export const findRecords = async (table) => {
  const allowedTables = [
    "announcement",
    "assignment",
    "attendance",
    "class",
    "event",
    "exam",
    "grade",
    "lesson",
    "result",
    "subject",
  ];

  if (!allowedTables.includes(table)) {
    throw new ApiError("Invalid table name");
  }

  const query = `SELECT * FROM ??`;
  const queryParams = [table];

  try {
    const [result] = await pool.query(query, queryParams);

    return result;
  } catch (error) {
    throw new ApiError(`Database query failed: ${error.message}`);
  }
};

export const findSingleRecordById = async (table, id) => {
  const allowedTables = [
    "announcement",
    "assignment",
    "attendance",
    "class",
    "event",
    "exam",
    "grade",
    "lesson",
    "result",
    "subject",
  ];

  if (!allowedTables.includes(table)) {
    throw new ApiError(400, "Invalid table name");
  }

  try {
    const query = `SELECT * FROM ?? WHERE id = ? LIMIT 1`;
    const queryParams = [table, id];

    const [rows] = await pool.query(query, queryParams);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new ApiError(500, `Database query failed: ${error.message}`);
  }
};
