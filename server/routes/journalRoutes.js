import express from 'express';
const router = express.Router();
import {
    getJournalEntries,
    createJournalEntry,
    updateJournalEntryStatus,
    getAccounts
} from '../controllers/journalController.js';
import { protect, financeManager } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, getJournalEntries)
    .post(protect, createJournalEntry);

router.get('/accounts', protect, getAccounts);
    
router.route('/:id').put(protect, financeManager, updateJournalEntryStatus);

export default router;