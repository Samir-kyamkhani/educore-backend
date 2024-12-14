import { pool } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";

export const createGrade = async ({ level, school_id }) => {
  if (!level || !school_id) {
    throw new ApiError(400, "Level and school ID are required");
  }

  try {
    const existingGradeQuery =
      "SELECT * FROM grade WHERE level = ? AND school_id = ?";
    const [existingGrade] = await pool.query(existingGradeQuery, [
      level,
      school_id,
    ]);

    if (existingGrade.length > 0) {
      throw new ApiError(400, "Grade level already exists for this school");
    }

    const insertQuery = `
      INSERT INTO grade (level, school_id, createdAt)
      VALUES (?, ?, NOW())`;
    const [insertResult] = await pool.query(insertQuery, [level, school_id]);

    // Fetch and return the newly created grade
    const gradeId = insertResult.insertId;
    const [newGrade] = await pool.query("SELECT * FROM grade WHERE id = ?", [
      gradeId,
    ]);

    if (!newGrade || newGrade.length === 0) {
      throw new ApiError(500, "Failed to fetch the newly created grade");
    }

    return newGrade[0];
  } catch (error) {
    throw new ApiError(500, `Database operation failed: ${error.message}`);
  }
};

export const createClass = async ({
  name,
  capacity,
  supervisorId,
  gradeId,
  school_id,
}) => {
  try {
    const existingClassQuery =
      "SELECT * FROM class WHERE name = ? AND school_id = ?";
    const [existingClass] = await pool.query(existingClassQuery, [
      name,
      school_id,
    ]);

    if (existingClass.length > 0) {
      throw new ApiError(400, "Class name already exists in this school");
    }

    const insertQuery = `
      INSERT INTO class (name, capacity, supervisorId, gradeId, school_id, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())`;
    const params = [name, capacity, supervisorId, gradeId, school_id];
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

export const createSubject = async ({ name, school_id }) => {
  try {
    const existingSubjectQuery =
      "SELECT id FROM subject WHERE name = ? AND school_id = ?";
    const [existingSubject] = await pool.query(existingSubjectQuery, [
      name,
      school_id,
    ]);

    if (existingSubject.length > 0) {
      throw new ApiError(400, "Subject name already exists for this school");
    }

    const insertQuery = `
      INSERT INTO subject (name, school_id, createdAt)
      VALUES (?, ?, NOW())`;

    const [insertResult] = await pool.query(insertQuery, [name, school_id]);

    if (!insertResult.affectedRows) {
      throw new ApiError(500, "Failed to create subject");
    }

    const subjectId = insertResult.insertId;
    const [newSubject] = await pool.query(
      "SELECT * FROM subject WHERE id = ?",
      [subjectId],
    );

    return newSubject[0];
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(
        400,
        "Subject name already exists for this school (unique constraint violated)",
      );
    }

    throw new ApiError(500, `Database operation failed: ${error.message}`);
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
  school_id,
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

    if (
      !validDays.includes(
        day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
      )
    ) {
      throw new ApiError(
        400,
        `Invalid day. Allowed values: ${validDays.join(", ")}`,
      );
    }

    const startTimeDate = new Date(`1970-01-01T${startTime}:00Z`);
    const endTimeDate = new Date(`1970-01-01T${endTime}:00Z`);

    if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
      throw new ApiError(400, "Invalid time format. Please use HH:mm format.");
    }

    if (startTimeDate >= endTimeDate) {
      throw new ApiError(400, "Start time must be earlier than end time.");
    }

    const startTimeFormatted = startTime.padStart(5, "0");
    const endTimeFormatted = endTime.padStart(5, "0");

    const subjectQuery =
      "SELECT id FROM subject WHERE id = ? AND school_id = ?";
    const [subject] = await pool.query(subjectQuery, [subjectId, school_id]);
    if (subject.length === 0) {
      throw new ApiError(
        404,
        `Subject with ID ${subjectId} not found for this school.`,
      );
    }

    // Validate class existence for the school
    const classQuery = "SELECT id FROM class WHERE id = ? AND school_id = ?";
    const [classExists] = await pool.query(classQuery, [classId, school_id]);
    if (classExists.length === 0) {
      throw new ApiError(
        404,
        `Class with ID ${classId} not found for this school.`,
      );
    }

    const teacherQuery =
      "SELECT id FROM teacher WHERE id = ? AND school_id = ?";
    const [teacher] = await pool.query(teacherQuery, [teacherId, school_id]);
    if (teacher.length === 0) {
      throw new ApiError(
        404,
        `Teacher with ID ${teacherId} not found for this school.`,
      );
    }

    const insertQuery = `
      INSERT INTO lesson (name, day, startTime, endTime, subjectId, classId, teacherId, school_id, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    const params = [
      name.trim(), // Trim the name to avoid leading/trailing spaces
      day,
      startTimeFormatted,
      endTimeFormatted,
      subjectId,
      classId,
      teacherId,
      school_id,
    ];

    const [insertResult] = await pool.query(insertQuery, params);

    const selectQuery = "SELECT * FROM lesson WHERE id = ?";
    const [lessonData] = await pool.query(selectQuery, [insertResult.insertId]);

    return lessonData[0];
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createExam = async ({
  title,
  date,
  startTime,
  endTime,
  lessonId,
  school_id,
}) => {
  try {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new ApiError(
        400,
        "Invalid time format. Please use 'HH:mm' (e.g., '14:30' for 2:30 PM).",
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)) {
      throw new ApiError(
        400,
        "Invalid date format. Please use 'YYYY-MM-DD' (e.g., '2024-06-15').",
      );
    }

    const startTimeDate = new Date(`1970-01-01T${startTime}:00Z`);
    const endTimeDate = new Date(`1970-01-01T${endTime}:00Z`);

    if (startTimeDate >= endTimeDate) {
      throw new ApiError(400, "Start time must be earlier than end time.");
    }

    const lessonQuery = "SELECT id FROM lesson WHERE id = ? AND school_id = ?";
    const [lesson] = await pool.query(lessonQuery, [lessonId, school_id]);

    if (lesson.length === 0) {
      throw new ApiError(
        404,
        `Lesson with ID ${lessonId} not found for this school.`,
      );
    }

    const insertQuery = `
      INSERT INTO exam (title, date, startTime, endTime, lessonId, school_id, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`;

    const params = [
      title.trim(),
      date,
      startTime,
      endTime,
      lessonId,
      school_id,
    ];
    const [insertResult] = await pool.query(insertQuery, params);

    const selectQuery = "SELECT * FROM exam WHERE id = ?";
    const [examData] = await pool.query(selectQuery, [insertResult.insertId]);

    return examData[0];
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createAssignment = async ({
  title,
  startDate,
  dueDate,
  lessonId,
  school_id,
}) => {
  try {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(dueDate)) {
      throw new ApiError(
        400,
        "Invalid date format. Use 'YYYY-MM-DD' (e.g., '2024-06-15').",
      );
    }

    if (new Date(startDate) >= new Date(dueDate)) {
      throw new ApiError(400, "Start date must be earlier than due date.");
    }

    const lessonQuery = "SELECT id FROM lesson WHERE id = ? AND school_id = ?";
    const [lesson] = await pool.query(lessonQuery, [lessonId, school_id]);
    if (lesson.length === 0) {
      throw new ApiError(
        404,
        `Lesson with ID ${lessonId} not found for this school.`,
      );
    }

    const query = `
      INSERT INTO assignment (title, startDate, dueDate, lessonId, school_id, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())`;
    const params = [title.trim(), startDate, dueDate, lessonId, school_id];
    const [result] = await pool.query(query, params);

    const selectQuery = "SELECT * FROM assignment WHERE id = ?";
    const [assignmentData] = await pool.query(selectQuery, [result.insertId]);

    return assignmentData[0];
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createResult = async ({
  score,
  examId,
  assignmentId,
  studentId,
  school_id,
}) => {
  try {
    if (examId && assignmentId) {
      throw new ApiError(
        400,
        "Both examId and assignmentId cannot be provided",
      );
    }

    if (examId) {
      const examQuery = "SELECT id FROM exam WHERE id = ? AND school_id = ?";
      const [exam] = await pool.query(examQuery, [examId, school_id]);
      if (exam.length === 0) {
        throw new ApiError(
          404,
          `Exam with ID ${examId} not found for this school.`,
        );
      }
    }

    if (assignmentId) {
      const assignmentQuery =
        "SELECT id FROM assignment WHERE id = ? AND school_id = ?";
      const [assignment] = await pool.query(assignmentQuery, [
        assignmentId,
        school_id,
      ]);
      if (assignment.length === 0) {
        throw new ApiError(
          404,
          `Assignment with ID ${assignmentId} not found for this school.`,
        );
      }
    }

    const studentQuery =
      "SELECT id FROM student WHERE id = ? AND school_id = ?";
    const [student] = await pool.query(studentQuery, [studentId, school_id]);
    if (student.length === 0) {
      throw new ApiError(
        404,
        `Student with ID ${studentId} not found for this school.`,
      );
    }

    const query = `
      INSERT INTO result (score, examId, assignmentId, studentId, school_id, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())`;
    const params = [
      score,
      examId || null,
      assignmentId || null,
      studentId,
      school_id,
    ];
    const [result] = await pool.query(query, params);

    const resultQuery = "SELECT * FROM result WHERE id = ?";
    const [resultData] = await pool.query(resultQuery, [result.insertId]);

    return resultData[0];
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const createAttendance = async ({
  date,
  present,
  studentId,
  lessonId,
  school_id,
}) => {
  try {
    const lessonQuery = "SELECT id FROM lesson WHERE id = ? AND school_id = ?";
    const [lesson] = await pool.query(lessonQuery, [lessonId, school_id]);
    if (lesson.length === 0) {
      throw new ApiError(
        404,
        `Lesson with ID ${lessonId} not found for this school.`,
      );
    }

    const studentQuery =
      "SELECT id FROM student WHERE id = ? AND school_id = ?";
    const [student] = await pool.query(studentQuery, [studentId, school_id]);
    if (student.length === 0) {
      throw new ApiError(
        404,
        `Student with ID ${studentId} not found for this school.`,
      );
    }

    const query = `
      INSERT INTO attendance (date, present, studentId, lessonId, school_id, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())`;

    const params = [date, present, studentId, lessonId, school_id];
    const [result] = await pool.query(query, params);

    return {
      id: result.insertId,
      date,
      present,
      studentId,
      lessonId,
      school_id,
      createdAt: new Date().toISOString(),
    };
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
  school_id,
}) => {
  try {
    if (classId) {
      const classQuery = "SELECT id FROM class WHERE id = ? AND school_id = ?";
      const [classExists] = await pool.query(classQuery, [classId, school_id]);
      if (classExists.length === 0) {
        throw new ApiError(
          404,
          `Class with ID ${classId} not found for this school.`,
        );
      }
    }

    const query = `
      INSERT INTO event (title, description, startDate, endDate, classId, school_id, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`;

    const params = [
      title.trim(),
      description.trim(),
      startDate,
      endDate,
      classId || null,
      school_id,
    ];

    const [result] = await pool.query(query, params);

    return {
      id: result.insertId,
      title,
      description,
      startDate,
      endDate,
      classId,
      school_id,
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
  school_id,
}) => {
  try {
    if (classId) {
      const classQuery = "SELECT id FROM class WHERE id = ? AND school_id = ?";
      const [classExists] = await pool.query(classQuery, [classId, school_id]);
      if (classExists.length === 0) {
        throw new ApiError(
          404,
          "Class not found or does not belong to your school",
        );
      }
    }

    const query = `
      INSERT INTO announcement (title, description, date, classId, school_id, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())`;

    const params = [title, description, date, classId || null, school_id];

    const [result] = await pool.query(query, params);

    return {
      id: result.insertId,
      title,
      description,
      date,
      classId: classId || null,
      school_id,
    };
  } catch (error) {
    throw new ApiError(500, `Database insertion failed: ${error.message}`);
  }
};

export const findByIdAndSchool = async (id, table, school_id) => {
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

  const query = `SELECT * FROM \`${table}\` WHERE id = ? AND school_id = ? LIMIT 1`;
  const [result] = await pool.query(query, [id, school_id]);

  return result.length > 0 ? result[0] : null;
};

export const fetchUpdatedDataByIdAndSchool = async (id, table, school_id) => {
  const query = `SELECT * FROM \`${table}\` WHERE id = ? AND school_id = ? LIMIT 1`;
  const [result] = await pool.query(query, [id, school_id]);

  return result.length > 0 ? result[0] : null;
};

export const updateClassDetails = async (
  id,
  name,
  capacity,
  supervisorId,
  gradeId,
  school_id,
) => {
  const query = `
    UPDATE class
    SET name = ?, capacity = ?, supervisorId = ?, gradeId = ?
    WHERE id = ? AND school_id = ?`;
  const params = [name, capacity, supervisorId, gradeId, id, school_id];
  await pool.query(query, params);
};

export const updateSubjectDetails = async (id, name, school_id) => {
  const duplicateSubjectQuery = `
    SELECT id 
    FROM subject 
    WHERE name = ? AND school_id = ? AND id != ?`;
  const [duplicateSubject] = await pool.query(duplicateSubjectQuery, [
    name,
    school_id,
    id,
  ]);

  if (duplicateSubject.length > 0) {
    throw new ApiError(400, "Subject name already exists for this school");
  }

  const updateQuery = `
    UPDATE subject
    SET name = ?
    WHERE id = ? AND school_id = ?`;
  const [updateResult] = await pool.query(updateQuery, [name, id, school_id]);

  if (updateResult.affectedRows === 0) {
    throw new ApiError(
      404,
      "Subject not found or not associated with this school",
    );
  }
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
  school_id,
) => {
  try {
    const startTimeDate = new Date(`1970-01-01T${startTime}:00Z`);
    const endTimeDate = new Date(`1970-01-01T${endTime}:00Z`);
    if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
      throw new ApiError(400, "Invalid time format. Use HH:mm format.");
    }
    if (startTimeDate >= endTimeDate) {
      throw new ApiError(400, "Start time must be earlier than end time");
    }

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

    const subjectQuery =
      "SELECT id FROM subject WHERE id = ? AND school_id = ?";
    const [subject] = await pool.query(subjectQuery, [subjectId, school_id]);
    if (subject.length === 0) {
      throw new ApiError(
        404,
        `Subject with ID ${subjectId} not found for the school`,
      );
    }

    const classQuery = "SELECT id FROM class WHERE id = ? AND school_id = ?";
    const [classExists] = await pool.query(classQuery, [classId, school_id]);
    if (classExists.length === 0) {
      throw new ApiError(
        404,
        `Class with ID ${classId} not found for the school`,
      );
    }

    const teacherQuery =
      "SELECT id FROM teacher WHERE id = ? AND school_id = ?";
    const [teacher] = await pool.query(teacherQuery, [teacherId, school_id]);
    if (teacher.length === 0) {
      throw new ApiError(
        404,
        `Teacher with ID ${teacherId} not found for the school`,
      );
    }

    const query = `
      UPDATE lesson
      SET name = ?, day = ?, startTime = ?, endTime = ?, subjectId = ?, classId = ?, teacherId = ?
      WHERE id = ? AND school_id = ?`;
    const params = [
      name.trim(),
      day,
      startTime.padStart(5, "0"),
      endTime.padStart(5, "0"),
      subjectId,
      classId,
      teacherId,
      id,
      school_id,
    ];
    await pool.query(query, params);
  } catch (error) {
    throw new ApiError(500, `Database update failed: ${error.message}`);
  }
};

export const updateExamDetails = async (
  id,
  title,
  date,
  startTime,
  endTime,
  lessonId,
  school_id,
) => {
  const examQuery = "SELECT id FROM exam WHERE id = ? AND school_id = ?";
  const [exam] = await pool.query(examQuery, [id, school_id]);
  if (exam.length === 0) {
    throw new ApiError(404, `Exam with ID ${id} not found for this school`);
  }

  const lessonQuery = "SELECT id FROM lesson WHERE id = ? AND school_id = ?";
  const [lesson] = await pool.query(lessonQuery, [lessonId, school_id]);
  if (lesson.length === 0) {
    throw new ApiError(
      404,
      `Lesson with ID ${lessonId} not found for this school`,
    );
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new ApiError(
      400,
      "Invalid time format. Use 'HH:mm' (e.g., '14:30' for 2:30 PM).",
    );
  }

  if (!dateRegex.test(date)) {
    throw new ApiError(
      400,
      "Invalid date format. Use 'YYYY-MM-DD' (e.g., '2024-06-15').",
    );
  }

  const startTimeDate = new Date(`1970-01-01T${startTime}:00Z`);
  const endTimeDate = new Date(`1970-01-01T${endTime}:00Z`);
  if (startTimeDate >= endTimeDate) {
    throw new ApiError(400, "Start time must be earlier than end time");
  }

  const query = `
    UPDATE exam
    SET title = ?, date = ?, startTime = ?, endTime = ?, lessonId = ?
    WHERE id = ? AND school_id = ?`;

  await pool.query(query, [
    title.trim(),
    date,
    startTime,
    endTime,
    lessonId,
    id,
    school_id,
  ]);
};

export const updateAssignmentDetails = async ({
  id,
  title,
  startDate,
  dueDate,
  lessonId,
  school_id,
}) => {
  const lessonQuery = "SELECT id FROM lesson WHERE id = ? AND school_id = ?";
  const [lesson] = await pool.query(lessonQuery, [lessonId, school_id]);
  if (lesson.length === 0) {
    throw new ApiError(
      404,
      `Lesson with ID ${lessonId} not found for this school.`,
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(dueDate)) {
    throw new ApiError(
      400,
      "Invalid date format. Use 'YYYY-MM-DD' (e.g., '2024-06-15').",
    );
  }

  if (new Date(startDate) >= new Date(dueDate)) {
    throw new ApiError(400, "Start date must be earlier than due date.");
  }

  const query = `
    UPDATE assignment
    SET title = ?, startDate = ?, dueDate = ?, lessonId = ?
    WHERE id = ? AND school_id = ?`;
  await pool.query(query, [
    title.trim(),
    startDate,
    dueDate,
    lessonId,
    id,
    school_id,
  ]);
};

export const updateResultDetails = async ({
  id,
  score,
  examId,
  assignmentId,
  studentId,
  school_id,
}) => {
  try {
    if (examId && assignmentId) {
      throw new ApiError(
        400,
        "Both examId and assignmentId cannot be provided",
      );
    }

    if (examId) {
      const examQuery = "SELECT id FROM exam WHERE id = ? AND school_id = ?";
      const [exam] = await pool.query(examQuery, [examId, school_id]);
      if (exam.length === 0) {
        throw new ApiError(
          404,
          `Exam with ID ${examId} not found for this school.`,
        );
      }
    }

    if (assignmentId) {
      const assignmentQuery =
        "SELECT id FROM assignment WHERE id = ? AND school_id = ?";
      const [assignment] = await pool.query(assignmentQuery, [
        assignmentId,
        school_id,
      ]);
      if (assignment.length === 0) {
        throw new ApiError(
          404,
          `Assignment with ID ${assignmentId} not found for this school.`,
        );
      }
    }

    const studentQuery =
      "SELECT id FROM student WHERE id = ? AND school_id = ?";
    const [student] = await pool.query(studentQuery, [studentId, school_id]);
    if (student.length === 0) {
      throw new ApiError(
        404,
        `Student with ID ${studentId} not found for this school.`,
      );
    }

    const query = `
      UPDATE result
      SET score = ?, examId = ?, assignmentId = ?, studentId = ?
      WHERE id = ? AND school_id = ?`;
    const params = [
      score,
      examId || null,
      assignmentId || null,
      studentId,
      id,
      school_id,
    ];

    const [updateResult] = await pool.query(query, params);

    if (updateResult.affectedRows === 0) {
      throw new ApiError(404, "Result not found or update failed");
    }
  } catch (error) {
    throw new ApiError(500, `Database update failed: ${error.message}`);
  }
};

export const updateAttendanceDetails = async (
  id,
  date,
  present,
  studentId,
  lessonId,
  school_id,
) => {
  try {
    const lessonQuery = "SELECT id FROM lesson WHERE id = ? AND school_id = ?";
    const [lesson] = await pool.query(lessonQuery, [lessonId, school_id]);
    if (lesson.length === 0) {
      throw new ApiError(
        404,
        `Lesson with ID ${lessonId} not found for this school.`,
      );
    }

    const studentQuery =
      "SELECT id FROM student WHERE id = ? AND school_id = ?";
    const [student] = await pool.query(studentQuery, [studentId, school_id]);
    if (student.length === 0) {
      throw new ApiError(
        404,
        `Student with ID ${studentId} not found for this school.`,
      );
    }

    const query = `
      UPDATE attendance
      SET date = ?, present = ?, studentId = ?, lessonId = ?
      WHERE id = ? AND school_id = ?`;

    const params = [date, present, studentId, lessonId, id, school_id];
    await pool.query(query, params);
  } catch (error) {
    throw new ApiError(500, `Database update failed: ${error.message}`);
  }
};

export const updateAnnouncementDetails = async (
  id,
  title,
  description,
  date,
  classId,
) => {
  try {
    const query = `
      UPDATE announcement
      SET title = ?, description = ?, date = ?, classId = ?
      WHERE id = ?`;
    const params = [
      title.trim(),
      description.trim(),
      date,
      classId || null,
      id,
    ];
    await pool.query(query, params);
  } catch (error) {
    throw new ApiError(500, `Database update failed: ${error.message}`);
  }
};

export const updateGradeDetails = async (id, level) => {
  try {
    const query = `
      UPDATE grade
      SET level = ?, updatedAt = NOW()
      WHERE id = ?`;
    const [result] = await pool.query(query, [level, id]);

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Failed to update grade; it might not exist");
    }
  } catch (error) {
    throw new ApiError(500, `Database operation failed: ${error.message}`);
  }
};

export const updateEventDetails = async (
  id,
  title,
  description,
  startDate,
  endDate,
  classId,
  school_id,
) => {
  if (classId) {
    const classQuery = "SELECT id FROM class WHERE id = ? AND school_id = ?";
    const [classExists] = await pool.query(classQuery, [classId, school_id]);
    if (classExists.length === 0) {
      throw new ApiError(
        404,
        "Class not found or does not belong to your school.",
      );
    }
  }

  const query = `
    UPDATE event
    SET title = ?, description = ?, startDate = ?, endDate = ?, classId = ?
    WHERE id = ?`;
  const params = [
    title.trim(),
    description.trim(),
    startDate,
    endDate,
    classId || null,
    id,
  ];

  try {
    await pool.query(query, params);
  } catch (error) {
    throw new ApiError(500, `Database update failed: ${error.message}`);
  }
};

export const findRecordsBySchool = async (table, school_id) => {
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

  if (!school_id) {
    throw new ApiError(400, "Please provide a valid school ID");
  }

  const query = `SELECT * FROM ?? WHERE school_id = ?`;
  const queryParams = [table, school_id];

  try {
    const [result] = await pool.query(query, queryParams);

    return result;
  } catch (error) {
    throw new ApiError(500, `Database query failed: ${error.message}`);
  }
};

export const findSingleRecordByIdAndSchool = async (table, id, schoolId) => {
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
    const query = `SELECT * FROM ?? WHERE id = ? AND school_id = ? LIMIT 1`;
    const queryParams = [table, id, schoolId];

    const [rows] = await pool.query(query, queryParams);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new ApiError(500, `Database query failed: ${error.message}`);
  }
};
