const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { protect } = require('../middleware/auth');
const { validateIncident } = require('../middleware/validation');

router.use(protect);

// Incident CRUD operations
router.get('/', incidentController.getIncidents);
router.get('/stats', incidentController.getStats);
router.get('/:id', incidentController.getIncidentById);
router.post('/', validateIncident, incidentController.createIncident);

// Incident actions
router.post('/:id/acknowledge', incidentController.acknowledgeIncident);
router.post('/:id/resolve', incidentController.resolveIncident);

module.exports = router;