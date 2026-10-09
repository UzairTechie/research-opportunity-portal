const db = require('../config/db');

// Helper to validate positive integer IDs
const isValidId = (id) => {
    const parsed = parseInt(id, 10);
    return !isNaN(parsed) && parsed > 0 && String(parsed) === String(id).trim();
};

// Helper to validate date format (YYYY-MM-DD)
const isValidDateString = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const timestamp = Date.parse(dateStr);
    return !isNaN(timestamp);
};

// =====================================================================
// 1. Create a Research Opportunity
// POST /api/opportunities
// =====================================================================
exports.createOpportunity = async (req, res) => {
    try {
        const {
            title,
            description,
            research_area,
            faculty_name,
            department,
            required_skills,
            available_positions,
            application_deadline,
            status = 'Open'
        } = req.body;

        // Validation for missing required fields
        const missingFields = [];
        if (!title || !title.trim()) missingFields.push('title');
        if (!description || !description.trim()) missingFields.push('description');
        if (!research_area || !research_area.trim()) missingFields.push('research_area');
        if (!faculty_name || !faculty_name.trim()) missingFields.push('faculty_name');
        if (!department || !department.trim()) missingFields.push('department');
        if (!required_skills || !required_skills.trim()) missingFields.push('required_skills');
        if (available_positions === undefined || available_positions === null || String(available_positions).trim() === '') {
            missingFields.push('available_positions');
        }
        if (!application_deadline || !String(application_deadline).trim()) {
            missingFields.push('application_deadline');
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Validation Error: Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate available_positions is a non-negative number
        const positions = parseInt(available_positions, 10);
        if (isNaN(positions) || positions < 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error: available_positions must be a non-negative integer (0 or greater).'
            });
        }

        // Validate status (must be either 'Open' or 'Closed')
        if (status !== 'Open' && status !== 'Closed') {
            return res.status(400).json({
                success: false,
                message: "Validation Error: status must be either 'Open' or 'Closed'."
            });
        }

        // Validate application_deadline format (YYYY-MM-DD)
        const deadlineStr = String(application_deadline).trim();
        if (!isValidDateString(deadlineStr)) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error: application_deadline must be a valid date in YYYY-MM-DD format.'
            });
        }

        // Insert into MySQL
        const insertQuery = `
            INSERT INTO research_opportunities 
            (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(insertQuery, [
            title.trim(),
            description.trim(),
            research_area.trim(),
            faculty_name.trim(),
            department.trim(),
            required_skills.trim(),
            positions,
            application_deadline,
            status
        ]);

        // Fetch newly created opportunity
        const [newRecord] = await db.execute(
            'SELECT * FROM research_opportunities WHERE id = ?',
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: 'Research opportunity created successfully.',
            data: newRecord[0]
        });
    } catch (error) {
        console.error('Error in createOpportunity:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while creating research opportunity.',
            error: error.message
        });
    }
};

// =====================================================================
// 2. Retrieve All Research Opportunities
// GET /api/opportunities
// =====================================================================
exports.getAllOpportunities = async (req, res) => {
    try {
        const query = 'SELECT * FROM research_opportunities ORDER BY created_at DESC';
        const [rows] = await db.execute(query);

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error in getAllOpportunities:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving research opportunities.',
            error: error.message
        });
    }
};

// =====================================================================
// 3. Retrieve One Research Opportunity by ID
// GET /api/opportunities/:id
// =====================================================================
exports.getOpportunityById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error: Opportunity ID must be a valid positive integer.'
            });
        }

        const query = 'SELECT * FROM research_opportunities WHERE id = ?';
        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Research opportunity with ID ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error in getOpportunityById:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving research opportunity.',
            error: error.message
        });
    }
};

// =====================================================================
// 4. Update a Research Opportunity
// PUT /api/opportunities/:id
// =====================================================================
exports.updateOpportunity = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error: Opportunity ID must be a valid positive integer.'
            });
        }

        // Check if the record exists
        const [existing] = await db.execute(
            'SELECT * FROM research_opportunities WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Research opportunity with ID ${id} not found.`
            });
        }

        const current = existing[0];
        const {
            title,
            description,
            research_area,
            faculty_name,
            department,
            required_skills,
            available_positions,
            application_deadline,
            status
        } = req.body;

        // Validate body is not completely empty
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error: Request body cannot be empty for update.'
            });
        }

        // Validate available_positions if provided
        let newPositions = current.available_positions;
        if (available_positions !== undefined && available_positions !== null && String(available_positions).trim() !== '') {
            newPositions = parseInt(available_positions, 10);
            if (isNaN(newPositions) || newPositions < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation Error: available_positions must be a non-negative integer (0 or greater).'
                });
            }
        }

        // Validate status if provided
        let newStatus = current.status;
        if (status !== undefined) {
            if (status !== 'Open' && status !== 'Closed') {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error: status must be either 'Open' or 'Closed'."
                });
            }
            newStatus = status;
        }

        // Merge updated fields with existing values if partial update, or use provided values
        const updatedTitle = title !== undefined && title.trim() !== '' ? title.trim() : current.title;
        const updatedDescription = description !== undefined && description.trim() !== '' ? description.trim() : current.description;
        const updatedResearchArea = research_area !== undefined && research_area.trim() !== '' ? research_area.trim() : current.research_area;
        const updatedFacultyName = faculty_name !== undefined && faculty_name.trim() !== '' ? faculty_name.trim() : current.faculty_name;
        const updatedDepartment = department !== undefined && department.trim() !== '' ? department.trim() : current.department;
        const updatedRequiredSkills = required_skills !== undefined && required_skills.trim() !== '' ? required_skills.trim() : current.required_skills;

        // Validate and normalize application_deadline
        let updatedDeadline;
        if (application_deadline !== undefined && String(application_deadline).trim() !== '') {
            const cleanDate = String(application_deadline).trim();
            if (!isValidDateString(cleanDate)) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation Error: application_deadline must be a valid date in YYYY-MM-DD format.'
                });
            }
            updatedDeadline = cleanDate;
        } else {
            if (current.application_deadline instanceof Date) {
                updatedDeadline = current.application_deadline.toISOString().split('T')[0];
            } else {
                updatedDeadline = current.application_deadline;
            }
        }

        const updateQuery = `
            UPDATE research_opportunities 
            SET title = ?, description = ?, research_area = ?, faculty_name = ?, department = ?, 
                required_skills = ?, available_positions = ?, application_deadline = ?, status = ?
            WHERE id = ?
        `;

        await db.execute(updateQuery, [
            updatedTitle,
            updatedDescription,
            updatedResearchArea,
            updatedFacultyName,
            updatedDepartment,
            updatedRequiredSkills,
            newPositions,
            updatedDeadline,
            newStatus,
            id
        ]);

        // Retrieve the updated record
        const [updatedRows] = await db.execute(
            'SELECT * FROM research_opportunities WHERE id = ?',
            [id]
        );

        return res.status(200).json({
            success: true,
            message: 'Research opportunity updated successfully.',
            data: updatedRows[0]
        });
    } catch (error) {
        console.error('Error in updateOpportunity:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while updating research opportunity.',
            error: error.message
        });
    }
};

// =====================================================================
// 5. Delete a Research Opportunity
// DELETE /api/opportunities/:id
// =====================================================================
exports.deleteOpportunity = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error: Opportunity ID must be a valid positive integer.'
            });
        }

        const deleteQuery = 'DELETE FROM research_opportunities WHERE id = ?';
        const [result] = await db.execute(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: `Research opportunity with ID ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            message: `Research opportunity with ID ${id} deleted successfully.`
        });
    } catch (error) {
        console.error('Error in deleteOpportunity:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while deleting research opportunity.',
            error: error.message
        });
    }
};
