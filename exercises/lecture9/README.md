# Lecture 9 practical: Snowflake

**Prepared, not executed:** an authenticated student Snowflake account is required. No database, Marketplace installation, budget or supervisor share has been created by these files yet.

1. Sign into the student account. Set a small coursework warehouse to auto-suspend, then configure daily/weekly credit monitoring under the account administrator. Confirm the budget amount before applying it. Resource monitors do not cap every serverless service.
2. Run `01-students.sql`. Verify ten synthetic records with IDs 1001–1010.
3. In Marketplace acquire Starschema **Worldwide Address Data**, checking current licensing and availability. Inspect its actual tables and column names. Create `SOURCE_ADDRESSES` adapter view according to the documented column contract in `02-addresses.sql`.
4. Run `country-lookup.sql`, then `02-addresses.sql`. Verify EU coverage, both views, row counts, and unmapped codes. The EU list contains 27 member states; the Americas list includes North, Central, South America and the Caribbean, including listed territories.
5. Review the sharing template and current Marketplace redistribution terms. Resolve Snowflake's restrictions on sharing imported databases before granting address objects. Confirm the supervisor account and region in the UI. The classroom page provides locator `pp79352` (AWS eu-north-1), ID `OK11655`, and alternate `nhhitrn-tsireader01`.
6. Save real query results and share confirmation for the Moodle submission. Do not describe these scripts as executed until those results exist.

The fixed latitude bounds are approximate Berlin (52.5200 N) and New York City (40.7128 N) city centers; boundaries are inclusive. Views use human-readable country names.

References: [Snowflake sharing](https://docs.snowflake.com/en/user-guide/data-sharing-provider), [resource monitors](https://docs.snowflake.com/en/user-guide/resource-monitors), [Worldwide Address Data example](https://www.snowflake.com/en/blog/geospatial-data-insghts/).
