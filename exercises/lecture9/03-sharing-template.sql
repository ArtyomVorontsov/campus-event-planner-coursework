-- TEMPLATE ONLY: sharing requires the provider's redistribution permission,
-- a share-capable account/role, compatible region, and a verified recipient.
-- Do not re-share imported Marketplace data unless permitted by its terms.
-- Snowflake may disallow sharing views that depend on imported databases.
-- Materializing such data is not a workaround for licensing restrictions.
CREATE SHARE IF NOT EXISTS TSI_CLASSWORK_9_REVIEW;
GRANT USAGE ON DATABASE TSI_CLASSWORK_9 TO SHARE TSI_CLASSWORK_9_REVIEW;
GRANT USAGE ON SCHEMA TSI_CLASSWORK_9.MY_SCHEMA TO SHARE TSI_CLASSWORK_9_REVIEW;
GRANT SELECT ON TABLE TSI_CLASSWORK_9.MY_SCHEMA.STUDENT_DATA TO SHARE TSI_CLASSWORK_9_REVIEW;
-- If the provider permits it and the account supports it, grant the remaining
-- required objects after resolving imported-database sharing restrictions.
-- GRANT SELECT ON TABLE TSI_CLASSWORK_9.MY_SCHEMA.EU_ADDRESSES TO SHARE TSI_CLASSWORK_9_REVIEW;
-- GRANT SELECT ON VIEW TSI_CLASSWORK_9.MY_SCHEMA.V_BERLIN_NEWYORK TO SHARE TSI_CLASSWORK_9_REVIEW;
-- GRANT SELECT ON VIEW TSI_CLASSWORK_9.MY_SCHEMA.V_AMERICA TO SHARE TSI_CLASSWORK_9_REVIEW;
-- Confirm the supervisor identifier from the assignment in the share UI:
-- locator pp79352 in AWS eu-north-1; alternate organization/account nhhitrn-tsireader01.
-- ALTER SHARE TSI_CLASSWORK_9_REVIEW ADD ACCOUNTS = <verified_recipient>;
SHOW GRANTS TO SHARE TSI_CLASSWORK_9_REVIEW;
