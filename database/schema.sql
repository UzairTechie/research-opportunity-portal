-- =====================================================================
-- Database Schema for University Research Opportunity Portal
-- Assignment: CN Assignment #01
-- =====================================================================

-- 1. Create Database if it does not already exist
CREATE DATABASE IF NOT EXISTS research_portal_db;
USE research_portal_db;

-- 2. Drop existing table to ensure a clean schema creation
DROP TABLE IF EXISTS research_opportunities;

-- 3. Create the research_opportunities table
-- Contains all 10 required fields with appropriate data types and constraints:
-- - Unique ID (Primary Key, Auto Increment)
-- - Research title (NOT NULL)
-- - Research description (NOT NULL)
-- - Research area (NOT NULL)
-- - Faculty member's name (NOT NULL)
-- - Department (NOT NULL)
-- - Required skills (NOT NULL)
-- - Number of available positions (NOT NULL, Must be >= 0)
-- - Application deadline (NOT NULL, Date format YYYY-MM-DD)
-- - Status: Restricted to 'Open' or 'Closed' only (Default: 'Open')
CREATE TABLE research_opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    research_area VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    required_skills TEXT NOT NULL,
    available_positions INT NOT NULL,
    application_deadline DATE NOT NULL,
    status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_positions_non_negative CHECK (available_positions >= 0)
);

-- =====================================================================
-- 4. Seed Initial Sample Data (3 Opportunities for testing & grading)
-- =====================================================================
INSERT INTO research_opportunities 
(title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
VALUES 
(
    'Edge AI Optimization in Software Defined Networks',
    'Investigating low-latency inference pipelines deployed directly on SDN edge switches.',
    'Computer Networks & AI',
    'Dr. Arshad Khan',
    'Computer Science',
    'Python, Mininet, PyTorch, C++',
    2,
    '2026-11-15',
    'Open'
),
(
    'Zero-Trust Security for IoT Healthcare Systems',
    'Designing decentralized identity and mutual authentication protocols for biomedical sensor grids.',
    'Cyber Security',
    'Dr. Sara Malik',
    'Computer Science',
    'Network Security, Cryptography, Linux, Wireshark',
    3,
    '2026-11-30',
    'Open'
),
(
    'Autonomous UAV Swarm Communication Protocols',
    'Analyzing ad-hoc mesh networking resiliency during high-interference tactical conditions.',
    'Wireless & Mobile Networks',
    'Prof. Tariq Mehmood',
    'Electrical & Computer Engineering',
    'NS-3, C++, MATLAB, Radio Frequency Basics',
    1,
    '2026-10-25',
    'Closed'
);
