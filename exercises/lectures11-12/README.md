# Lectures 11–12: Banking Message API

## Status

OpenAPI specification, Swagger UI, validation, local SQLite mock, Snowflake DDL and connector are implemented. **Live Snowflake execution is pending access to a student account.** Mock results are not evidence of a Snowflake insert.

## Run locally

Requires Node.js 24+ and pnpm (or npm).

```sh
pnpm install
cp .env.example .env
pnpm start
```

Open http://127.0.0.1:3013. Expand `POST /api/messages`, edit the JSON body, and select **Execute**. HTTP 201 confirms storage. `GET /api/messages` shows stored rows, including the `version` and `info` metadata. All eight assignment fields are required; dates must use ISO 8601 with a timezone. Use synthetic card tokens, never payment card numbers.

`pnpm test` checks message persistence, metadata, quoted text, missing fields and malformed dates. The local database persists under ignored `data/`.

## Snowflake mode

1. Sign into the intended student account and run `schema.sql` using an existing coursework role and warehouse.
2. Set `STORAGE_MODE=snowflake`, account, username, warehouse and optional role in `.env`. The account value is the organization-account identifier, not a URL.
3. Start the app and complete the official Snowflake external-browser sign-in. No password is stored in the project.
4. The app performs a connection query before listening. It fails if live configuration fails; it never silently falls back to the mock.
5. Send the synthetic example using Swagger **Execute**. A successful response identifies `mode: snowflake` and includes the Snowflake query ID. Verify the table using the SELECT in `schema.sql` and capture that result.

The live connector uses parameter bindings, a fixed table name and a single INSERT statement. `timestamp` maps to `EVENT_TIMESTAMP`; `info` maps to a VARIANT column. A row is a message, not an executed bank transfer. This loopback-only teaching application has no user authentication and must not be publicly deployed.

Sources: [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3), [Snowflake authentication](https://docs.snowflake.com/en/developer-guide/node-js/nodejs-driver-authenticate), [Snowflake SQL execution](https://docs.snowflake.com/en/developer-guide/node-js/nodejs-driver-execute).
