import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const client = new Client({
  name: "coursework-browser-bridge",
  version: "1.0.0",
});
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL("./mcp-server.js", import.meta.url))],
  env: { PATH: process.env.PATH || "" },
});
await client.connect(transport);
const server = http.createServer(async (req, res) => {
  const send = (status, data) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  try {
    if (req.method === "GET" && req.url === "/api/tools") {
      send(200, await client.listTools());
      return;
    }
    if (req.method === "POST" && req.url === "/api/add") {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 2048) {
          send(413, { error: "Body too large" });
          return;
        }
      }
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        send(400, { error: "Invalid JSON" });
        return;
      }
      if (!Number.isFinite(data.a) || !Number.isFinite(data.b)) {
        send(400, { error: "Two finite numbers are required" });
        return;
      }
      send(
        200,
        await client.callTool({
          name: "add",
          arguments: { a: data.a, b: data.b },
        }),
      );
      return;
    }
    if (
      req.method === "GET" &&
      ["/", "/app.js", "/style.css"].includes(req.url)
    ) {
      const f = req.url === "/" ? "index.html" : req.url.slice(1);
      const content = await readFile(new URL("./public/" + f, import.meta.url));
      res.writeHead(200, {
        "Content-Type": f.endsWith(".js")
          ? "text/javascript"
          : f.endsWith(".css")
            ? "text/css"
            : "text/html",
      });
      res.end(content);
      return;
    }
    send(404, { error: "Not found" });
  } catch (error) {
    send(500, { error: "MCP request failed" });
  }
});
server.listen(Number(process.env.PORT) || 3011, "127.0.0.1", () =>
  console.log("MCP UI: http://127.0.0.1:" + (process.env.PORT || 3011)),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    server.close();
    await client.close();
    process.exit(0);
  });
