﻿--
-- Script was generated by Devart dbForge Studio 2020 for MySQL, Version 9.0.567.0
-- Product Home Page: http://www.devart.com/dbforge/mysql/studio
-- Script date 3/30/2022 4:03:05 PM
-- Source server version: 5.7.29
-- Source connection string: User Id=root;Host=127.0.0.1;Protocol=Ssh;Character Set=utf8;SSH Host=192.168.150.111;SSH Port=22;SSH User=root;SSH Authentication Type=Password
-- Target server version: 5.7.29
-- Target connection string: User Id=root;Host=127.0.0.1;Protocol=Ssh;Character Set=utf8;SSH Host=192.168.150.111;SSH Port=22;SSH User=root;SSH Authentication Type=Password
-- Run this script against hr-excel-generetor-DEV to synchronize it with hr-excel-generator
--



SET NAMES 'utf8';
USE `hr-excel-generetor-DEV`;
--
-- -- Disable foreign keys
--
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;

--
-- Dropping constraints from issues
--
ALTER TABLE issues 
   DROP FOREIGN KEY FK_issues_project_id;

--
-- Dropping constraints from issues_task_log
--
ALTER TABLE issues_task_log 
   DROP FOREIGN KEY FK_issues_task_log_issue_id;
ALTER TABLE issues_task_log 
   DROP FOREIGN KEY FK_issues_task_log_user_id;

--
-- Inserting data into table issues
--
INSERT INTO issues(issue_id, issue_summary, project_id) VALUES
(1, 'kipa aduma to shabi', 1),
(2, 'Snufkin Memory Restoration', 2);

--
-- Inserting data into table issues_task_log
--
INSERT INTO issues_task_log(task_id, user_id, issue_id, timeworked, date) VALUES
(1, 2, 1, 10000, '2022-03-08 00:00:00'),
(2, 1, 2, 20000, '2022-03-04 00:00:00'),
(3, 1, 1, 10000, '2022-03-08 00:00:00'),
(4, 2, 2, 22222, '2022-03-04 00:00:00'),
(5, 1, 2, 111111, '2022-03-05 00:00:00'),
(6, 2, 2, 111111, '2022-03-06 00:00:00'),
(7, 2, 2, 222222, '2022-03-04 00:00:00'),
(8, 1, 1, 121212, '2022-03-07 00:00:00');

--
-- Inserting data into table jira_project
--
INSERT INTO jira_project(jira_id, project_name) VALUES
(1, 'unsecrets project'),
(2, 'Muminim villige');

--
-- Inserting data into table users
--
INSERT INTO users(user_id, user_fname, user_sname) VALUES
(1, 'Moshe', 'Ufnik'),
(2, 'Shmulic', 'Kipod');
--
-- -- Enable foreign keys
--
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;

--
-- Creating constraints for issues
--
ALTER TABLE issues 
  ADD CONSTRAINT FK_issues_project_id FOREIGN KEY (project_id)
    REFERENCES jira_project(jira_id) ON DELETE NO ACTION;

--
-- Creating constraints for issues_task_log
--
ALTER TABLE issues_task_log 
  ADD CONSTRAINT FK_issues_task_log_issue_id FOREIGN KEY (issue_id)
    REFERENCES issues(issue_id) ON DELETE NO ACTION;
ALTER TABLE issues_task_log 
  ADD CONSTRAINT FK_issues_task_log_user_id FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE NO ACTION;