import { createPool } from "mysql2/promise";

const pool = createPool({
  database: process.env.MYSQL_DATABASE_NAME,
  password: process.env.MYSQL_PASSWORD,
  user: process.env.MYSQL_USER,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
});

const DB_CONNECTION = async () => {
  try {
    await pool.getConnection();
    console.log("DB CONNECTED SUCCESSFULLY ");
  } catch (error) {
    console.log("DB CONNECTION FAILED ", error);
    throw error;
  }
};

export { DB_CONNECTION, pool };
