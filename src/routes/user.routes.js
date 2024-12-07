import { Router } from "express";
import {
  adminSignup,
  adminUpdate,
  authenticateUserController,
  deleteSingleUser,
  getAllAdmins,
  getAllParents,
  getAllStudents,
  getAllTeachers,
  getCurrentUser,
  getSingleUser,
  parentSignup,
  parentUpdate,
  studentSignup,
  studentUpdate,
  teacherSignup,
  teacherUpdate,
  userLogin,
  userLogout,
} from "../controllers/user.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/signup").post(
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1,
    },
    {
      name: "schoolLogo",
      maxCount: 1,
    },
  ]),
  adminSignup,
);
router.route("/login").post(userLogin);
router.route("/create-teacher").post(authenticateUser, upload.single("profile"), teacherSignup);
router.route("/create-parent").post(authenticateUser, parentSignup);
router.route("/create-student").post(authenticateUser, upload.single("profile"), studentSignup);
router.route("/protected-route").get(authenticateUser, authenticateUserController);
router.route("/get-current-user").get(authenticateUser, getCurrentUser);
router.route("/logout").post(authenticateUser, userLogout);


//Fetch data

router.route("/get-user/:id").get(authenticateUser, getSingleUser);
router.route("/get-admins").get(authenticateUser, getAllAdmins);
router.route("/get-teachers").get(authenticateUser, getAllTeachers);
router.route("/get-parents").get(authenticateUser, getAllParents);
router.route("/get-students").get(authenticateUser, getAllStudents);

//update
router.route("/update-admin").put(
  authenticateUser,
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1,
    },
    {
      name: "schoolLogo",
      maxCount: 1,
    },
  ]),
  adminUpdate,
);
router.route("/update-teacher/:id").put(authenticateUser, upload.single("profile"), teacherUpdate);
router.route("/update-parent/:id").put(authenticateUser, parentUpdate);
router.route("/update-student/:id").put(authenticateUser, upload.single("profile"), studentUpdate);


//delete
router.route("/delete-user/:id").delete(authenticateUser, deleteSingleUser);


export default router;
