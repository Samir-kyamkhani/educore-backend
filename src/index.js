// src/database/index.js
import dotenv from "dotenv";
import app from "./app.js";
import { DB_CONNECTION } from "./database/index.js"

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;

DB_CONNECTION()
  .then(() => {
    app.on("error", (error) => {
      console.log("Server listening error:: ", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`Server running at port:: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Server Connection failed:: ", error);
    throw error;
  });
