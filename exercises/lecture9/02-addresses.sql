-- PREREQUISITE: import Starschema Worldwide Address Data from Marketplace.
-- Inspect its actual schema in Snowsight. Create an adapter view named
-- TSI_CLASSWORK_9.MY_SCHEMA.SOURCE_ADDRESSES with these columns:
-- CITY, REGION, ADDRESS, COUNTRY_CODE (ISO alpha-2), LATITUDE (numeric).
-- Map the provider's real table/column names; do not run a guessed mapping.
-- ADDRESS should combine house number and street if they are separate fields.
-- COUNTRY_CODE must use two-letter codes; the following query normalizes case.
USE SCHEMA TSI_CLASSWORK_9.MY_SCHEMA;
CREATE TABLE IF NOT EXISTS COUNTRY_LOOKUP (CODE VARCHAR(2), NAME VARCHAR(80), IS_EU BOOLEAN, IS_AMERICAS BOOLEAN);
-- Fill COUNTRY_LOOKUP using country-lookup.sql before continuing.
CREATE TABLE IF NOT EXISTS EU_ADDRESSES AS
SELECT a.* FROM SOURCE_ADDRESSES a
JOIN COUNTRY_LOOKUP c ON UPPER(TRIM(a.COUNTRY_CODE))=c.CODE WHERE c.IS_EU;
-- Inclusive latitude range, using city-center reference latitudes.
CREATE OR REPLACE SECURE VIEW V_BERLIN_NEWYORK AS
SELECT a.CITY AS "City", a.REGION AS "Region", a.ADDRESS AS "Address", c.NAME AS "Country"
FROM SOURCE_ADDRESSES a LEFT JOIN COUNTRY_LOOKUP c ON UPPER(TRIM(a.COUNTRY_CODE))=c.CODE
WHERE a.LATITUDE BETWEEN 40.7128 AND 52.5200;
CREATE OR REPLACE SECURE VIEW V_AMERICA AS
SELECT a.CITY AS "City", a.REGION AS "Region", a.ADDRESS AS "Address", c.NAME AS "Country"
FROM SOURCE_ADDRESSES a JOIN COUNTRY_LOOKUP c ON UPPER(TRIM(a.COUNTRY_CODE))=c.CODE
WHERE c.IS_AMERICAS;
SELECT COUNT(*) AS EU_ADDRESS_COUNT FROM EU_ADDRESSES;
SELECT * FROM V_BERLIN_NEWYORK LIMIT 20;
SELECT * FROM V_AMERICA LIMIT 20;
-- Check unmapped codes before treating the views as complete.
SELECT DISTINCT a.COUNTRY_CODE FROM SOURCE_ADDRESSES a
LEFT JOIN COUNTRY_LOOKUP c ON UPPER(TRIM(a.COUNTRY_CODE))=c.CODE WHERE c.CODE IS NULL;
