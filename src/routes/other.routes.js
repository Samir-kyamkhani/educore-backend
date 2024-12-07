import { Router } from "express";
import {
  createClassHandler,
  createSubjectHandler,
  createLessonHandler,
  createExamHandler,
  createAssignmentHandler,
  createGradeHandler,
  createResultHandler,
  createAttendanceHandler,
  createEventHandler,
  createAnnouncementHandler,
  deleteRecord,
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
  getSingleRecord,
  getAllGrades,
  getAllClasses,
  getAllSubjects,
  getAllLessons,
  getAllExams,
  getAllAssignments,
  getAllResults,
  getAllAttendances,
  getAllEvents,
  getAllAnnouncements,
} from "../controllers/other.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-grade").post(authenticateUser, createGradeHandler);

router.route("/create-class").post(authenticateUser, createClassHandler);

router.route("/create-subject").post(authenticateUser, createSubjectHandler);

router.route("/create-lesson").post(authenticateUser, createLessonHandler);

router.route("/create-exam").post(authenticateUser, createExamHandler);

router
  .route("/create-assignment")
  .post(authenticateUser, createAssignmentHandler);

router.route("/create-result").post(authenticateUser, createResultHandler);

router
  .route("/create-attendance")
  .post(authenticateUser, createAttendanceHandler);

router.route("/create-event").post(authenticateUser, createEventHandler);

router
  .route("/create-announcement")
  .post(authenticateUser, createAnnouncementHandler);

router
  .route("/delete-record/:table/:id")
  .delete(authenticateUser, deleteRecord);

//update
router.route("/update-class/:id").put(authenticateUser, updateClass);
router.route("/update-subject/:id").put(authenticateUser, updateSubject);
router.route("/update-lesson/:id").put(authenticateUser, updateLesson);
router.route("/update-exam/:id").put(authenticateUser, updateExam);
router.route("/update-assignment/:id").put(authenticateUser, updateAssignment);
router.route("/update-attendance/:id").put(authenticateUser, updateAttendance);
router.route("/update-grade/:id").put(authenticateUser, updateGrade);
router.route("/update-result/:id").put(authenticateUser, updateResult);
router.route("/update-event/:id").put(authenticateUser, updateEvent);
router
  .route("/update-announcement/:id")
  .put(authenticateUser, updateAnnouncement);

//fetch

router.route("/get-record/:table/:id").get(authenticateUser, getSingleRecord);
router.route("/get-grades").get(authenticateUser, getAllGrades);
router.route("/get-classes").get(authenticateUser, getAllClasses);
router.route("/get-subjects").get(authenticateUser, getAllSubjects);
router.route("/get-lessons").get(authenticateUser, getAllLessons);
router.route("/get-exams").get(authenticateUser, getAllExams);
router.route("/get-assignments").get(authenticateUser, getAllAssignments);
router.route("/get-results").get(authenticateUser, getAllResults);
router.route("/get-attendances").get(authenticateUser, getAllAttendances);
router.route("/get-events").get(authenticateUser, getAllEvents);
router.route("/get-announcements").get(authenticateUser, getAllAnnouncements);

export default router;
