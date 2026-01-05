const express = require('express');
const { sendTestEmail } = require('../controllers/emailTestController');

const router = express.Router();

router.post('/test-email', sendTestEmail);

module.exports = router;
