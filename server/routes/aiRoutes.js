import express from 'express';
const router = express.Router();
import { scanReceipt, suggestExpenseAccount, getReportSummary } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/scan-receipt', protect, scanReceipt);
router.post('/suggest-account', protect, suggestExpenseAccount);
router.post('/summarize-report', protect, getReportSummary);

export default router;