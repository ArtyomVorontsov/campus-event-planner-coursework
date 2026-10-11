SwaggerUIBundle({
  url: "/openapi.json",
  dom_id: "#swagger-ui",
  deepLinking: true,
  validatorUrl: null,
  tryItOutEnabled: true,
});
fetch("/api/health")
  .then((r) => r.json())
  .then((r) => {
    document.getElementById("mode").textContent =
      `Active storage: ${r.mode}. ${r.mode === "mock" ? "Local SQLite mock; no Snowflake connection." : "Connected to Snowflake."}`;
  })
  .catch(() => {
    document.getElementById("mode").textContent = "Storage unavailable";
  });
