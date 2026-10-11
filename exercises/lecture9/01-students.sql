-- Prepared coursework SQL; execute in a student Snowflake account.
CREATE DATABASE IF NOT EXISTS TSI_CLASSWORK_9;
CREATE SCHEMA IF NOT EXISTS TSI_CLASSWORK_9.MY_SCHEMA;
USE SCHEMA TSI_CLASSWORK_9.MY_SCHEMA;
CREATE TABLE IF NOT EXISTS STUDENT_DATA (
  NAME VARCHAR(80), SURNAME VARCHAR(80), ID INTEGER, AGE INTEGER, FACULTY VARCHAR(100)
);
-- Fictional students. MERGE makes a repeat run avoid duplicate IDs.
MERGE INTO STUDENT_DATA d USING (
 SELECT column1 AS name,column2 AS surname,column3 AS id,column4 AS age,column5 AS faculty
 FROM VALUES
 ('Anna','Ozola',1001,20,'Computer Science'),('Mark','Miller',1002,22,'Engineering'),
 ('Eva','Kalnina',1003,19,'Computer Science'),('Leo','Smith',1004,23,'Transport'),
 ('Mia','Brown',1005,21,'Business'),('Tom','Wilson',1006,24,'Engineering'),
 ('Lina','Green',1007,20,'Computer Science'),('Alex','White',1008,22,'Transport'),
 ('Sara','Black',1009,21,'Business'),('Max','Gray',1010,19,'Computer Science')
) s ON d.id=s.id
WHEN NOT MATCHED THEN INSERT (NAME,SURNAME,ID,AGE,FACULTY) VALUES(s.name,s.surname,s.id,s.age,s.faculty);
SELECT * FROM STUDENT_DATA ORDER BY ID;
