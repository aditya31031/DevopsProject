const express = require('express');
const router = express.Router();
const { createAccount, getMyAccounts, getAccount, deposit, withdraw } = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getMyAccounts).post(createAccount);
router.route('/:id').get(getAccount);
router.post('/:id/deposit', deposit);
router.post('/:id/withdraw', withdraw);

module.exports = router;
