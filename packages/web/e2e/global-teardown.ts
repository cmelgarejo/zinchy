const ADMIN_URL = "postgresql://zinchy:zinchy_dev@localhost:5433/postgres";
const TEST_DB = "zinchy_test";

export default async function globalTeardown() {
  const postgres = (await import("postgres")).default;
  const sql = postgres(ADMIN_URL);
  await sql.unsafe(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  await sql.end();
}
