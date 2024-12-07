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
  fetchUpdatedDataById,
  findById,
  findRecords,
  findSingleRecordById,
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

  if (!level || level === "") {
    throw new ApiError(400, "Grade level is required");
  }

  const gradeData = await createGrade({ level: level });

  if (!gradeData) {
    throw new ApiError(500, "Error while creating grade");
  }

  return res.status(201).json(
    new ApiResponse(201, "Grade Created Successfully", {
      level: level,
    }),
  );
});

const createClassHandler = asyncHandler(async (req, res) => {
  const { name, capacity, supervisorId, gradeId } = req.body;

  if (!name || !capacity || !gradeId) {
    throw new ApiError(400, "Name, capacity, and grade ID are required");
  }

  const classData = await createClass({
    name: name.trim(),
    capacity,
    supervisorId,
    gradeId,
  });

  if (!classData) {
    throw new ApiError(500, "Error while creating class");
  }

  return res.status(201).json(
    new ApiResponse(201, "Class Created Successfully", {
      name: name.trim(),
      capacity,
      supervisorId,
      gradeId,
    }),
  );
});

const createSubjectHandler = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Subject name is required");
  }

  const subjectData = await createSubject({
    name: name.trim(),
  });

  if (!subjectData) {
    throw new ApiError(500, "Error while creating subject");
  }

  return res.status(201).json(
    new ApiResponse(201, "Subject Created Successfully", {
      name: name.trim(),
    }),
  );
});

const createLessonHandler = asyncHandler(async (req, res) => {
  const { name, day, startTime, endTime, subjectId, classId, teacherId } =
    req.body;

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
    name,
    day,
    startTime,
    endTime,
    subjectId,
    classId,
    teacherId,
  });

  if (!lessonData) {
    throw new ApiError(500, "Error while creating lesson");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Lesson Created Successfully", lessonData));
});

const createExamHandler = asyncHandler(async (req, res) => {
  const { title, startTime, endTime, lessonId } = req.body;

  if (!title || !startTime || !endTime || !lessonId) {
    throw new ApiError(400, "All fields are required");
  }

  const examData = await createExam({ title, startTime, endTime, lessonId });

  if (!examData) {
    throw new ApiError(500, "Error creating exam");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Exam Created Successfully", examData));
});

const createAssignmentHandler = asyncHandler(async (req, res) => {
  const { title, startDate, dueDate, lessonId } = req.body;

  if (!title || !startDate || !dueDate || !lessonId) {
    throw new ApiError(400, "All fields are required");
  }

  const assignmentData = await createAssignment({
    title,
    startDate,
    dueDate,
    lessonId,
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

  if (!score || (!examId && !assignmentId) || !studentId) {
    throw new ApiError(400, "All fields are required");
  }

  const resultData = await createResult({
    score,
    examId,
    assignmentId,
    studentId,
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

  if (!date || present === undefined || !studentId || !lessonId) {
    throw new ApiError(400, "All fields are required");
  }

  const attendanceData = await createAttendance({
    date,
    present,
    studentId,
    lessonId,
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

  if (!title || !description || !startDate || !endDate) {
    throw new ApiError(400, "All fields are required");
  }

  const eventData = await createEvent({
    title,
    description,
    startDate,
    endDate,
    classId,
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

  if (!title || !description || !date) {
    throw new ApiError(400, "Title, description, and date are required");
  }

  const announcementData = await createAnnouncement({
    title,
    description,
    date,
    classId,
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
  const { role } = req.user;

  if (role !== "admin" && role !== "superadmin") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  if (!table || !id) {
    throw new ApiError(400, "Table name and ID are required");
  }

  const selectQuery = `SELECT * FROM ?? WHERE id = ?`;
  const [record] = await pool.query(selectQuery, [table, id]);

  if (record.length === 0) {
    throw new ApiError(404, `${table.slice(0, -1)} not found`);
  }

  const deleteQuery = `DELETE FROM ?? WHERE id = ?`;
  const [result] = await pool.query(deleteQuery, [table, id]);

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

  if (!name || !capacity || !gradeId) {
    throw new ApiError(400, "Name, capacity, and grade ID are required");
  }

  const classExists = await findById(id, "class");
  if (!classExists) {
    throw new ApiError(404, "Class not found");
  }

  await updateClassDetails(id, name, capacity, supervisorId, gradeId);

  const updatedClass = await fetchUpdatedDataById(id, "class");

  return res
    .status(200)
    .json(new ApiResponse(200, "Class updated successfully", updatedClass));
});

const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Subject name is required");
  }

  const subjectExists = await findById(id, "subject");
  if (!subjectExists) {
    throw new ApiError(404, "Subject not found");
  }

  await updateSubjectDetails(id, name);

  const updatedSubject = await fetchUpdatedDataById(id, "subject");

  return res
    .status(200)
    .json(new ApiResponse(200, "Subject updated successfully", updatedSubject));
});

const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, day, startTime, endTime, subjectId, classId, teacherId } =
    req.body;

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

  const lessonExists = await findById(id, "lesson");
  if (!lessonExists) {
    throw new ApiError(404, "Lesson not found");
  }

  await updateLessonDetails(
    id,
    name,
    day,
    startTime,
    endTime,
    subjectId,
    classId,
    teacherId,
  );

  const updatedLesson = await fetchUpdatedDataById(id, "lesson");

  return res
    .status(200)
    .json(new ApiResponse(200, "Lesson updated successfully", updatedLesson));
});

const updateExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, startTime, endTime, lessonId } = req.body;

  if (!title || !startTime || !endTime || !lessonId) {
    throw new ApiError(400, "All fields are required");
  }

  const examExists = await findById(id, "exam");
  if (!examExists) {
    throw new ApiError(404, "Exam not found");
  }

  await updateExamDetails(id, title, startTime, endTime, lessonId);

  const updatedExam = await fetchUpdatedDataById(id, "exam");

  return res
    .status(200)
    .json(new ApiResponse(200, "Exam updated successfully", updatedExam));
});

const updateAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, startDate, dueDate, lessonId } = req.body;

  if (!title || !startDate || !dueDate || !lessonId) {
    throw new ApiError(400, "All fields are required");
  }

  const assignmentExists = await findById(id, "assignment");
  if (!assignmentExists) {
    throw new ApiError(404, "Assignment not found");
  }

  await updateAssignmentDetails(id, title, startDate, dueDate, lessonId);

  const updatedAssignment = await fetchUpdatedDataById(id, "assignment");

  // Send response
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

const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, present, studentId, lessonId } = req.body;

  if (!date || present === undefined || !studentId || !lessonId) {
    throw new ApiError(400, "All fields are required");
  }

  const attendanceExists = await findById(id, "attendance");
  if (!attendanceExists) {
    throw new ApiError(404, "Attendance record not found");
  }

  await updateAttendanceDetails(id, date, present, studentId, lessonId);

  const updatedAttendance = await fetchUpdatedDataById(id, "attendance");

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

  if (!title || !description || !date) {
    throw new ApiError(400, "Title, description, and date are required");
  }

  const announcementExists = await findById(id, "announcement");
  if (!announcementExists) {
    throw new ApiError(404, "Announcement not found");
  }

  await updateAnnouncementDetails(id, title, description, date, classId);

  const updatedAnnouncement = await fetchUpdatedDataById(id, "announcement");

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

  if (!level) {
    throw new ApiError(400, "level are required");
  }

  const gradeExists = await findById(id, "grade");
  if (!gradeExists) {
    throw new ApiError(404, "Grade not found");
  }

  await updateGradeDetails(id, level);

  const updatedGrade = await fetchUpdatedDataById(id, "grade");

  return res
    .status(200)
    .json(new ApiResponse(200, "Grade updated successfully", updatedGrade));
});

const updateResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { score, examId, assignmentId, studentId } = req.body;

  if (!score || (!examId && !assignmentId) || !studentId) {
    throw new ApiError(
      400,
      "Score, exam or assignment ID, and student ID are required",
    );
  }

  const resultExists = await findById(id, "result");
  if (!resultExists) {
    throw new ApiError(404, "Result not found");
  }

  await updateResultDetails(id, score, examId, assignmentId, studentId);

  const updatedResult = await fetchUpdatedDataById(id, "result");

  return res
    .status(200)
    .json(new ApiResponse(200, "Result updated successfully", updatedResult));
});

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate, classId } = req.body;

  if (!title || !description || !startDate || !endDate) {
    throw new ApiError(
      400,
      "Title, description, startDate, and endDate are required",
    );
  }

  const eventExists = await findById(id, "event");
  if (!eventExists) {
    throw new ApiError(404, "Event not found");
  }

  await updateEventDetails(id, title, description, startDate, endDate, classId);

  const updatedEvent = await fetchUpdatedDataById(id, "event");

  return res
    .status(200)
    .json(new ApiResponse(200, "Event updated successfully", updatedEvent));
});

const getSingleRecord = asyncHandler(async (req, res) => {
  const { table, id } = req.params;

  if (!table || !id) {
    throw new ApiError(400, "Table name and ID are required");
  }

  const record = await findSingleRecordById(table, id);

  if (!record) {
    return res.status(404).json(new ApiResponse(404, "Record not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Record fetched successfully", record));
});

const getAllGrades = asyncHandler(async (req, res) => {
  const grades = await findRecords("grade");

  if (!grades || grades.length === 0) {
    return res.status(404).json(new ApiResponse(404, "No grades found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All grades fetched successfully", grades));
});

const getAllClasses = asyncHandler(async (req, res) => {
  const classes = await findRecords("class");

  if (!classes || classes.length === 0) {
    return res.status(404).json(new ApiResponse(404, "Classes not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All classes fetched successfully", classes));
});

const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await findRecords("subject");

  if (!subjects || subjects.length === 0) {
    return res.status(404).json(new ApiResponse(404, "subjects not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All subjects fetched successfully", subjects));
});

const getAllLessons = asyncHandler(async (req, res) => {
  const lessons = await findRecords("lesson");

  if (!lessons || lessons.length === 0) {
    return res.status(404).json(new ApiResponse(404, "Lessons not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All lessons fetched successfully", lessons));
});

const getAllExams = asyncHandler(async (req, res) => {
  const exams = await findRecords("exam");

  if (!exams || exams.length === 0) {
    return res.status(404).json(new ApiResponse(404, "exams not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All exams fetched successfully", exams));
});

const getAllAssignments = asyncHandler(async (req, res) => {
  const assignments = await findRecords("assignment");

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
  const results = await findRecords("result");

  if (!results || results.length === 0) {
    return res.status(404).json(new ApiResponse(404, "results not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All results fetched successfully", results));
});

const getAllAttendances = asyncHandler(async (req, res) => {
  const attendances = await findRecords("attendance");

  if (!attendances || attendances.length === 0) {
    return res.status(404).json(new ApiResponse(404, "attendances not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "All attendances fetched successfully", attendances),
    );
});

const getAllEvents = asyncHandler(async (req, res) => {
  const events = await findRecords("event");

  if (!events || events.length === 0) {
    return res.status(404).json(new ApiResponse(404, "events not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All events fetched successfully", events));
});

const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await findRecords("announcement");

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
  updateAttendance,
  updateAnnouncement,
  updateGrade,
  updateResult,
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
