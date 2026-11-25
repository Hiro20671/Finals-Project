-- =====================================================================
-- Peer-to-Peer Academic Book & Reviewer Exchange System
-- MySQL Database Initialization & Schema Script
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `academic_exchange_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `academic_exchange_db`;

-- Category Table
CREATE TABLE IF NOT EXISTS `marketplace_category` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `slug` VARCHAR(120) NOT NULL UNIQUE,
    `description` LONGTEXT NULL,
    `icon_name` VARCHAR(50) NOT NULL DEFAULT 'BookOpen',
    `created_at` DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Core Categories
INSERT IGNORE INTO `marketplace_category` (`id`, `name`, `slug`, `description`, `icon_name`, `created_at`) VALUES
(1, 'Textbooks', 'textbooks', 'Curriculum textbooks for undergraduate and graduate courses', 'BookOpen', NOW()),
(2, 'Reviewers & Board Prep', 'reviewers-board-prep', 'Comprehensive exam review materials, licensure guides, and reviewers', 'FileCheck', NOW()),
(3, 'Lecture Notes & Summaries', 'lecture-notes-summaries', 'Condensed lecture notes, chapter summaries, and student study kits', 'FileText', NOW()),
(4, 'Study Guides & Solutions', 'study-guides-solutions', 'Problem-set solutions, formula sheets, and module walkthroughs', 'Bookmark', NOW()),
(5, 'Reference Materials & Handbooks', 'reference-materials', 'Engineering handbooks, medical references, law codals, and dictionaries', 'Layers', NOW()),
(6, 'Laboratory Manuals & Workbooks', 'lab-manuals-workbooks', 'Science and computer laboratory guides, activity sheets, and workbooks', 'FlaskConical', NOW());

COMMIT;

