import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
const columns = [
  "transactionId",
  "cardId",
  "trusteeExternalId",
  "channelType",
  "status",
  "statusTimestamp",
  "timestamp",
  "message",
];
export function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return "JSON object required";
  if (
    body.version !== "1.0.0" ||
    !body.info ||
    body.info.title !== "Banking Message API"
  )
    return "Matching version and info.title required";
  for (const key of columns)
    if (
      typeof body[key] !== "string" ||
      !body[key].trim() ||
      body[key].length > (key === "message" ? 2000 : 200)
    )
      return `Invalid ${key}`;
  for (const key of ["statusTimestamp", "timestamp"])
    if (
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(
        body[key],
      ) ||
      !Number.isFinite(Date.parse(body[key]))
    )
      return `Invalid ${key}: ISO date-time with timezone required`;
  if (!["WEB", "MOBILE", "BRANCH"].includes(body.channelType))
    return "Invalid channelType";
  if (!["PENDING", "APPROVED", "DECLINED"].includes(body.status))
    return "Invalid status";
  return null;
}
export function mockStore(path = "data/messages.db") {
  if (path !== ":memory:") mkdirSync("data", { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(
    "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, payload TEXT NOT NULL, received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  );
  return {
    mode: "mock",
    async insert(body) {
      const r = db
        .prepare("INSERT INTO messages(payload) VALUES(?)")
        .run(JSON.stringify(body));
      return { id: Number(r.lastInsertRowid) };
    },
    async list() {
      return db
        .prepare(
          "SELECT id,payload,received_at FROM messages ORDER BY id DESC LIMIT 20",
        )
        .all()
        .map((r) => ({
          id: r.id,
          ...JSON.parse(r.payload),
          receivedAt: r.received_at,
        }));
    },
    close() {
      db.close();
    },
  };
}
export async function snowflakeStore() {
  for (const k of [
    "SNOWFLAKE_ACCOUNT",
    "SNOWFLAKE_USERNAME",
    "SNOWFLAKE_WAREHOUSE",
  ])
    if (!process.env[k]) throw new Error(`${k} is required`);
  const { default: snowflake } = await import("snowflake-sdk");
  const conn = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    authenticator: "EXTERNALBROWSER",
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: "TSI_CLASSWORK_11_12",
    schema: "MY_SCHEMA",
    role: process.env.SNOWFLAKE_ROLE || undefined,
    clientStoreTemporaryCredential: false,
  });
  await conn.connectAsync();
  const execute = (sqlText, binds = []) =>
    new Promise((resolve, reject) =>
      conn.execute({
        sqlText,
        binds,
        complete: (err, stmt, rows) =>
          err ? reject(err) : resolve({ queryId: stmt.getQueryId(), rows }),
      }),
    );
  await execute("SELECT CURRENT_ACCOUNT()");
  return {
    mode: "snowflake",
    async insert(body) {
      const result = await execute(
        "INSERT INTO BANKING_MESSAGES (TRANSACTION_ID,CARD_ID,TRUSTEE_EXTERNAL_ID,CHANNEL_TYPE,STATUS,STATUS_TIMESTAMP,EVENT_TIMESTAMP,MESSAGE,API_VERSION,API_INFO) SELECT ?,?,?,?,?,TO_TIMESTAMP_TZ(?),TO_TIMESTAMP_TZ(?),?,?,PARSE_JSON(?)",
        [
          ...columns.map((k) => body[k]),
          body.version,
          JSON.stringify(body.info),
        ],
      );
      return { queryId: result.queryId };
    },
    async list() {
      return (
        await execute(
          "SELECT * FROM BANKING_MESSAGES ORDER BY RECEIVED_AT DESC LIMIT 20",
        )
      ).rows;
    },
    close() {
      conn.destroy(() => {});
    },
  };
}
