import express from "express";
import swaggerUi from "swagger-ui-dist";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { mockStore, snowflakeStore, validate } from "./store.js";
const mode = process.env.STORAGE_MODE || "mock";
if (!["mock", "snowflake"].includes(mode))
  throw new Error("STORAGE_MODE must be mock or snowflake");
const store = mode === "snowflake" ? await snowflakeStore() : mockStore();
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use((req, res, next) => {
  if (
    ["POST", "PUT", "DELETE", "PATCH"].includes(req.method) &&
    req.headers.origin &&
    req.headers.origin !== `http://${req.headers.host}`
  )
    return res.status(403).json({ error: "Same-origin requests required" });
  next();
});
app.get("/openapi.json", (_req, res) =>
  res.json(
    JSON.parse(
      readFileSync(new URL("./openapi.json", import.meta.url), "utf8"),
    ),
  ),
);
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", mode: store.mode }),
);
app.get("/api/messages", async (_req, res, next) => {
  try {
    res.json({ mode: store.mode, messages: await store.list() });
  } catch (e) {
    next(e);
  }
});
app.post("/api/messages", async (req, res, next) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const result = await store.insert(req.body);
    res.status(201).json({ status: "stored", mode: store.mode, ...result });
  } catch (e) {
    next(e);
  }
});
app.use("/swagger", express.static(swaggerUi.getAbsoluteFSPath()));
app.use(express.static(fileURLToPath(new URL("./public", import.meta.url))));
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res
    .status(err.type === "entity.parse.failed" ? 400 : 500)
    .json({
      error:
        err.type === "entity.parse.failed"
          ? "Invalid JSON"
          : "Storage request failed",
    });
});
const server = app.listen(Number(process.env.PORT || 3013), "127.0.0.1", () =>
  console.log(
    `Banking message exercise: http://127.0.0.1:${server.address().port} (${store.mode})`,
  ),
);
process.on("SIGINT", () =>
  server.close(() => {
    store.close();
    process.exit(0);
  }),
);
