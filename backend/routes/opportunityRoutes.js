const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');

// 1. Create a Research Opportunity
// POST /api/opportunities
router.post('/', opportunityController.createOpportunity);

// 2. Retrieve All Research Opportunities
// GET /api/opportunities
router.get('/', opportunityController.getAllOpportunities);

// 3. Retrieve One Research Opportunity by ID
// GET /api/opportunities/:id
router.get('/:id', opportunityController.getOpportunityById);

// 4. Update a Research Opportunity
// PUT /api/opportunities/:id
router.put('/:id', opportunityController.updateOpportunity);

// 5. Delete a Research Opportunity
// DELETE /api/opportunities/:id
router.delete('/:id', opportunityController.deleteOpportunity);

module.exports = router;
