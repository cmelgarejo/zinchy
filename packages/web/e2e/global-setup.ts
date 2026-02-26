import { execSync } from "child_process";
import path from "path";

const ADMIN_URL = "postgresql://zinchy:zinchy_dev@localhost:5433/postgres";
const TEST_DB = "zinchy_test";
const TEST_DB_URL = `postgresql://zinchy:zinchy_dev@localhost:5433/${TEST_DB}`;

export default async function globalSetup() {
  const postgres = (await import("postgres")).default;
  const sql = postgres(ADMIN_URL);

  // Drop if leftover from previous failed run
  await sql.unsafe(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await sql.unsafe(`CREATE DATABASE ${TEST_DB}`);
  await sql.end();

  // Run Drizzle migrations against test DB
  const packageRoot = path.resolve(__dirname, "..");
  execSync("pnpm db:migrate", {
    cwd: packageRoot,
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: "inherit",
  });
}
