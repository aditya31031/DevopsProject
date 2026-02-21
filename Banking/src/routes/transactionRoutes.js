const express = require('express');
const router = express.Router();
const { transfer, getHistory, getAllTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAllTransactions);
router.post('/transfer', transfer);
router.get('/:accountId', getHistory);

module.exports = router;
