const express = require('express');
const router = express.Router();
const obController = require('../controllers/occurrenceBook');
const { validate } = require('../middleware');
const { createObEntrySchema, signOffSchema } = require('../validators/schemas');

router.get('/next-entry/:site', obController.getNextEntry);
router.get('/my-entries', obController.getMyEntries);
router.get('/all', obController.getAllEntries);
router.get('/security-guards', obController.getSecurityGuards);

router.post('/', validate(createObEntrySchema), obController.createEntry);
router.post('/sign-off', validate(signOffSchema), obController.signOff);

module.exports = router;
