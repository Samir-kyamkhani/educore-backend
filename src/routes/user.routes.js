import { Router } from "express";
import {
  adminSignup,
  authenticateUserController,
  parentSignup,
  studentSignup,
  teacherSignup,
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
router.route("/create-teacher").post(upload.single("profile"), teacherSignup);
router.route("/create-parent").post(parentSignup);
router.route("/create-student").post(upload.single("profile"),studentSignup);
router.route("/login").post(userLogin);
router
  .route("/protected-route")
  .get(authenticateUser, authenticateUserController);
router.route("/logout").post(authenticateUser, userLogout);

// // router.route("/refresh-token").post(refreshAccessToken);
// router.route("/change-password").post(verifyJwt, changeCurrentPassword);
// router.route("/:id").get(getCurrentUser);
// router.route("/").get(getAuthores);
// router.route("/update-account").patch(verifyJwt, updateUserDetails);

// router
//   .route("/update-avatar")
//   .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);

export default router;
