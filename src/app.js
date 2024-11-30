import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();
const data = "1mb";

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credential: true,
  }),
);

app.use(express.json({ limit: data }));
app.use(express.urlencoded({ extended: true, limit: data }));
app.use(express.static("public"));
app.use(cookieParser());

import userSignup from "./routes/user.routes.js";

//router decleration
app.use("/api/v1/users", userSignup);

export default app;
