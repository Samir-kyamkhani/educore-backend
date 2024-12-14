import { pool } from "../database/index.js";
import {
  createAnnouncement,
  createAssignment,
  createAttendance,
  createClass,
  createEvent,
  createExam,
  createGrade,
  createLesson,
  createResult,
  createSubject,
  fetchUpdatedDataByIdAndSchool,
  findByIdAndSchool,
  findRecordsBySchool,
  findSingleRecordByIdAndSchool,
  updateAnnouncementDetails,
  updateAssignmentDetails,
  updateAttendanceDetails,
  updateClassDetails,
  updateEventDetails,
  updateExamDetails,
  updateGradeDetails,
  updateLessonDetails,
  updateResultDetails,
  updateSubjectDetails,
} from "../queries/other.queries.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createGradeHandler = asyncHandler(async (req, res) => {
  const { level } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!level || level === "") {
    throw new ApiError(400, "Grade level is required");
  }

  const gradeData = await createGrade({
    level: level,
    school_id,
  });

  if (!gradeData) {
    throw new ApiError(500, "Error while creating grade");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Grade Created Successfully", gradeData));
});

const createClassHandler = asyncHandler(async (req, res) => {
  const { name, capacity, supervisorId, gradeId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!name || !capacity || !gradeId) {
    throw new ApiError(400, "Name, capacity, and grade ID are required");
  }

  const classData = await createClass({
    name: name.trim(),
    capacity,
    supervisorId,
    gradeId,
    school_id,
  });

  if (!classData) {
    throw new ApiError(500, "Error while creating class");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Class Created Successfully", classData));
});

const createSubjectHandler = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ApiError(400, "Subject name is required and cannot be empty");
  }

  const subjectName = name.trim();

  const subjectData = await createSubject({
    name: subjectName,
    school_id,
  });

  if (!subjectData) {
    throw new ApiError(500, "Error while creating subject");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Subject Created Successfully", subjectData));
});

const createLessonHandler = asyncHandler(async (req, res) => {
  const { name, day, startTime, endTime, subjectId, classId, teacherId } =
    req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (
    !name ||
    !day ||
    !startTime ||
    !endTime ||
    !subjectId ||
    !classId ||
    !teacherId
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const lessonData = await createLesson({
    name: name.trim(),
    day,
    startTime,
    endTime,
    subjectId,
    classId,
    teacherId,
    school_id,
  });

  if (!lessonData) {
    throw new ApiError(500, "Error while creating lesson");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Lesson Created Successfully", lessonData));
});

const createExamHandler = asyncHandler(async (req, res) => {
  const { title, date, startTime, endTime, lessonId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing.");
  }

  if (!title || !date || !startTime || !endTime || !lessonId) {
    throw new ApiError(
      400,
      "All fields (title, date, startTime, endTime, lessonId) are required.",
    );
  }

  const examData = await createExam({
    title,
    date,
    startTime,
    endTime,
    lessonId,
    school_id,
  });

  if (!examData) {
    throw new ApiError(500, "Error creating exam.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Exam created successfully.", examData));
});

const createAssignmentHandler = asyncHandler(async (req, res) => {
  const { title, startDate, dueDate, lessonId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!title || !startDate || !dueDate || !lessonId) {
    throw new ApiError(
      400,
      "All fields (title, startDate, dueDate, lessonId) are required",
    );
  }

  const assignmentData = await createAssignment({
    title,
    startDate,
    dueDate,
    lessonId,
    school_id,
  });

  if (!assignmentData) {
    throw new ApiError(500, "Error creating assignment");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Assignment Created Successfully", assignmentData),
    );
});

const createResultHandler = asyncHandler(async (req, res) => {
  const { score, examId, assignmentId, studentId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!score || (!examId && !assignmentId) || !studentId) {
    throw new ApiError(
      400,
      "All fields are required (score, examId/assignmentId, studentId)",
    );
  }

  if (examId && assignmentId) {
    throw new ApiError(
      400,
      "Provide only one of examId or assignmentId, not both",
    );
  }

  const resultData = await createResult({
    score,
    examId,
    assignmentId,
    studentId,
    school_id,
  });

  if (!resultData) {
    throw new ApiError(500, "Error creating result");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Result Created Successfully", resultData));
});

const createAttendanceHandler = asyncHandler(async (req, res) => {
  const { date, present, studentId, lessonId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!date || present === undefined || !studentId || !lessonId) {
    throw new ApiError(
      400,
      "All fields (date, present, studentId, lessonId) are required",
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ApiError(
      400,
      "Invalid date format. Use 'YYYY-MM-DD' (e.g., '2024-06-15').",
    );
  }

  const attendanceData = await createAttendance({
    date,
    present,
    studentId,
    lessonId,
    school_id,
  });

  if (!attendanceData) {
    throw new ApiError(500, "Error creating attendance record");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Attendance Record Created Successfully",
        attendanceData,
      ),
    );
});

const createEventHandler = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, classId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!title || !description || !startDate || !endDate) {
    throw new ApiError(
      400,
      "All fields (title, description, startDate, endDate) are required",
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    throw new ApiError(400, "Invalid date format. Use 'YYYY-MM-DD'.");
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new ApiError(400, "Start date must be earlier than end date");
  }

  const eventData = await createEvent({
    title,
    description,
    startDate,
    endDate,
    classId,
    school_id,
  });

  if (!eventData) {
    throw new ApiError(500, "Error creating event");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Event Created Successfully", eventData));
});

const createAnnouncementHandler = asyncHandler(async (req, res) => {
  const { title, description, date, classId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!title || !description || !date) {
    throw new ApiError(400, "Title, description, and date are required");
  }

  const announcementData = await createAnnouncement({
    title: title.trim(),
    description: description.trim(),
    date,
    classId,
    school_id,
  });

  if (!announcementData) {
    throw new ApiError(500, "Error creating announcement");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Announcement Created Successfully",
        announcementData,
      ),
    );
});

export const deleteRecord = asyncHandler(async (req, res) => {
  const { table, id } = req.params;
  const { school_id, role } = req.user;

  if (role !== "admin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!table || !id) {
    throw new ApiError(400, "Table name and ID are required");
  }

  const selectQuery = `SELECT * FROM ?? WHERE id = ? AND school_id = ?`;
  const [record] = await pool.query(selectQuery, [table, id, school_id]);

  if (record.length === 0) {
    throw new ApiError(
      404,
      `The requested ${table.slice(0, -1)} was not found or does not belong to your school`,
    );
  }

  const deleteQuery = `DELETE FROM ?? WHERE id = ? AND school_id = ?`;
  const [result] = await pool.query(deleteQuery, [table, id, school_id]);

  if (result.affectedRows === 0) {
    throw new ApiError(500, `Failed to delete the ${table.slice(0, -1)}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `${
          table.slice(0, -1).charAt(0).toUpperCase() + table.slice(1, -1)
        } deleted successfully`,
      ),
    );
});

const updateClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, capacity, supervisorId, gradeId } = req.body;
  const school_id = req.user.school_id;

  if (!name || !capacity || !gradeId) {
    throw new ApiError(400, "Name, capacity, and grade ID are required");
  }

  const classExists = await findByIdAndSchool(id, "class", school_id);
  if (!classExists) {
    throw new ApiError(
      404,
      "Class not found or does not belong to your school",
    );
  }

  await updateClassDetails(
    id,
    name,
    capacity,
    supervisorId,
    gradeId,
    school_id,
  );

  const updatedClass = await fetchUpdatedDataByIdAndSchool(
    id,
    "class",
    school_id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Class updated successfully", updatedClass));
});

const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const school_id = req.user.school_id;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!name) {
    throw new ApiError(400, "Subject name is required");
  }

  const subjectExists = await findByIdAndSchool(id, "subject", school_id);
  if (!subjectExists) {
    throw new ApiError(404, "Subject not found");
  }

  await updateSubjectDetails(id, name, school_id);

  const updatedSubject = await fetchUpdatedDataByIdAndSchool(
    id,
    "subject",
    school_id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Subject updated successfully", updatedSubject));
});

const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, day, startTime, endTime, subjectId, classId, teacherId } =
    req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (
    !name ||
    !day ||
    !startTime ||
    !endTime ||
    !subjectId ||
    !classId ||
    !teacherId
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const lessonExists = await findByIdAndSchool(id, "lesson", school_id);
  if (!lessonExists) {
    throw new ApiError(404, "Lesson not found");
  }

  await updateLessonDetails(
    id,
    name.trim(),
    day,
    startTime,
    endTime,
    subjectId,
    classId,
    teacherId,
    school_id,
  );

  const updatedLesson = await fetchUpdatedDataByIdAndSchool(
    id,
    "lesson",
    school_id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Lesson updated successfully", updatedLesson));
});

const updateExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, startTime, endTime, lessonId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!title || !date || !startTime || !endTime || !lessonId) {
    throw new ApiError(400, "All fields are required");
  }

  const examExists = await findByIdAndSchool(id, "exam", school_id);
  if (!examExists) {
    throw new ApiError(404, "Exam not found for this school");
  }

  await updateExamDetails(
    id,
    title,
    date,
    startTime,
    endTime,
    lessonId,
    school_id,
  );

  const updatedExam = await fetchUpdatedDataByIdAndSchool(
    id,
    "exam",
    school_id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Exam updated successfully", updatedExam));
});

const updateAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, startDate, dueDate, lessonId } = req.body;
  const school_id = req.user.school_id;

  if (!title || !startDate || !dueDate || !lessonId) {
    throw new ApiError(
      400,
      "All fields (title, startDate, dueDate, lessonId) are required",
    );
  }

  const assignmentExists = await findByIdAndSchool(id, "assignment", school_id);
  if (!assignmentExists) {
    throw new ApiError(
      404,
      `Assignment with ID ${id} not found for this school.`,
    );
  }

  await updateAssignmentDetails({
    id,
    title,
    startDate,
    dueDate,
    lessonId,
    school_id,
  });

  const updatedAssignment = await fetchUpdatedDataByIdAndSchool(
    id,
    "assignment",
    school_id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Assignment updated successfully",
        updatedAssignment,
      ),
    );
});

const updateResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { score, examId, assignmentId, studentId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!score || (!examId && !assignmentId) || !studentId) {
    throw new ApiError(
      400,
      "All fields are required (score, examId/assignmentId, studentId)",
    );
  }

  if (examId && assignmentId) {
    throw new ApiError(
      400,
      "Provide only one of examId or assignmentId, not both",
    );
  }

  const resultExists = await findByIdAndSchool(id, "result", school_id);
  if (!resultExists) {
    throw new ApiError(404, `Result with ID ${id} not found for this school.`);
  }

  await updateResultDetails({
    id,
    score,
    examId,
    assignmentId,
    studentId,
    school_id,
  });

  const updatedResult = await fetchUpdatedDataByIdAndSchool(
    id,
    "result",
    school_id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Result updated successfully", updatedResult));
});

const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, present, studentId, lessonId } = req.body;
  const school_id = req.user.school_id;

  if (!date || present === undefined || !studentId || !lessonId) {
    throw new ApiError(
      400,
      "All fields (date, present, studentId, lessonId) are required",
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ApiError(
      400,
      "Invalid date format. Use 'YYYY-MM-DD' (e.g., '2024-06-15').",
    );
  }

  const attendanceExists = await findByIdAndSchool(id, "attendance", school_id);
  if (!attendanceExists) {
    throw new ApiError(404, "Attendance record not found");
  }

  // Update the attendance details
  await updateAttendanceDetails(
    id,
    date,
    present,
    studentId,
    lessonId,
    school_id,
  );

  const updatedAttendance = await fetchUpdatedDataByIdAndSchool(
    id,
    "attendance",
    school_id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Attendance updated successfully",
        updatedAttendance,
      ),
    );
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, date, classId } = req.body;
  const { school_id } = req.user;

  if (!school_id) {
    throw new ApiError(400, "School ID is missing");
  }

  if (!title || !description || !date) {
    throw new ApiError(400, "Title, description, and date are required");
  }

  const announcementExists = await findByIdAndSchool(
    id,
    "announcement",
    school_id,
  );
  if (!announcementExists) {
    throw new ApiError(
      404,
      "Announcement not found or does not belong to your school",
    );
  }

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

  await updateAnnouncementDetails(id, title, description, date, classId);

  const updatedAnnouncement = await fetchUpdatedDataByIdAndSchool(
    id,
    "announcement",
    school_id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Announcement updated successfully",
        updatedAnnouncement,
      ),
    );
});

const updateGrade = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { level } = req.body;
  const school_id = req.user.school_id;

  if (!id || !level) {
    throw new ApiError(400, "Grade ID and level are required");
  }

  const gradeExists = await findByIdAndSchool(id, "grade", school_id);
  if (!gradeExists) {
    throw new ApiError(404, "Grade not found");
  }

  const existingGradeQuery = `
    SELECT * FROM grade WHERE level = ? AND id != ? AND school_id = ?`;
  const [existingGrade] = await pool.query(existingGradeQuery, [
    level,
    id,
    gradeExists.school_id,
  ]);

  if (existingGrade.length > 0) {
    throw new ApiError(400, "Another grade with the same level already exists");
  }

  await updateGradeDetails(id, level);

  const updatedGrade = await fetchUpdatedDataByIdAndSchool(
    id,
    "grade",
    school_id,
  );

  if (!updatedGrade) {
    throw new ApiError(500, "Failed to fetch updated grade");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Grade updated successfully", updatedGrade));
});

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate, classId } = req.body;
  const school_id = req.user.school_id;

  if (!title || !description || !startDate || !endDate) {
    throw new ApiError(
      400,
      "Title, description, startDate, and endDate are required",
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    throw new ApiError(400, "Invalid date format. Use 'YYYY-MM-DD'.");
  }
  if (new Date(startDate) >= new Date(endDate)) {
    throw new ApiError(400, "Start date must be earlier than end date.");
  }

  const eventExists = await findByIdAndSchool(id, "event", school_id);
  if (!eventExists) {
    throw new ApiError(
      404,
      "Event not found or does not belong to your school.",
    );
  }

  await updateEventDetails(
    id,
    title,
    description,
    startDate,
    endDate,
    classId,
    school_id,
  );

  const updatedEvent = await fetchUpdatedDataByIdAndSchool(
    id,
    "event",
    school_id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Event updated successfully", updatedEvent));
});

const getSingleRecord = asyncHandler(async (req, res) => {
  const { table, id } = req.params;
  const { school_id } = req.user;

  if (!table || !id) {
    throw new ApiError(400, "Table name and ID are required");
  }

  const record = await findSingleRecordByIdAndSchool(table, id, school_id);

  if (!record) {
    throw new ApiError(
      404,
      `The requested ${table.slice(0, -1)} was not found or does not belong to your school.`,
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Record fetched successfully", record));
});

const getAllGrades = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const grades = await findRecordsBySchool("grade", school_id);

  if (!grades || grades.length === 0) {
    return res.status(404).json(new ApiResponse(404, "No grades found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All grades fetched successfully", grades));
});

const getAllClasses = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const classes = await findRecordsBySchool("class", school_id);

  if (!classes || classes.length === 0) {
    return res.status(404).json(new ApiResponse(404, "Classes not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All classes fetched successfully", classes));
});

const getAllSubjects = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const subjects = await findRecordsBySchool("subject", school_id);

  if (!subjects || subjects.length === 0) {
    return res.status(404).json(new ApiResponse(404, "Subjects not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All subjects fetched successfully", subjects));
});

const getAllLessons = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const lessons = await findRecordsBySchool("lesson", school_id);

  if (!lessons || lessons.length === 0) {
    return res.status(404).json(new ApiResponse(404, "Lessons not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All lessons fetched successfully", lessons));
});

const getAllExams = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const exams = await findRecordsBySchool("exam", school_id);

  if (!exams || exams.length === 0) {
    return res.status(404).json(new ApiResponse(404, "exams not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All exams fetched successfully", exams));
});

const getAllAssignments = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const assignments = await findRecordsBySchool("assignment", school_id);

  if (!assignments || assignments.length === 0) {
    return res.status(404).json(new ApiResponse(404, "assignments not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "All assignments fetched successfully", assignments),
    );
});

const getAllResults = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const results = await findRecordsBySchool("result", school_id);

  if (!results || results.length === 0) {
    return res.status(404).json(new ApiResponse(404, "results not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All results fetched successfully", results));
});

const getAllAttendances = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const attendances = await findRecordsBySchool("attendance", school_id);

  if (!attendances || attendances.length === 0) {
    return res.status(404).json(new ApiResponse(404, "Attendances not found"));
  }

  const updatedAttendances = attendances.map((attendance) => ({
    ...attendance,
    present: attendance.present === 0 ? "false" : "true",
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "All attendances fetched successfully",
        updatedAttendances,
      ),
    );
});

const getAllEvents = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const events = await findRecordsBySchool("event", school_id);

  if (!events || events.length === 0) {
    return res.status(404).json(new ApiResponse(404, "events not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All events fetched successfully", events));
});

const getAllAnnouncements = asyncHandler(async (req, res) => {
  const { school_id } = req.user;

  const announcements = await findRecordsBySchool("announcement", school_id);

  if (!announcements || announcements.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "announcements not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "All announcements fetched successfully",
        announcements,
      ),
    );
});

export {
  createClassHandler,
  createSubjectHandler,
  createLessonHandler,
  createExamHandler,
  createAssignmentHandler,
  createAttendanceHandler,
  createAnnouncementHandler,
  createResultHandler,
  createEventHandler,
  createGradeHandler,
  updateClass,
  updateSubject,
  updateLesson,
  updateExam,
  updateAssignment,
  updateResult,
  updateAttendance,
  updateAnnouncement,
  updateGrade,
  updateEvent,
  getAllGrades,
  getSingleRecord,
  getAllClasses,
  getAllSubjects,
  getAllLessons,
  getAllExams,
  getAllAssignments,
  getAllResults,
  getAllAttendances,
  getAllEvents,
  getAllAnnouncements,
};
