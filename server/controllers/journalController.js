import asyncHandler from 'express-async-handler';
import JournalEntry from '../models/JournalEntry.js';
import Account from '../models/Account.js';
import { checkForDuplicateEntry } from '../services/geminiService.js';


// @desc    Fetch all journal entries
// @route   GET /api/journal
// @access  Private
const getJournalEntries = asyncHandler(async (req, res) => {
    const entries = await JournalEntry.find({}).populate('createdBy', 'name').sort({ date: -1 });
    res.json(entries);
});

// @desc    Create a new journal entry
// @route   POST /api/journal
// @access  Private
const createJournalEntry = asyncHandler(async (req, res) => {
    const { date, description, debitAccount, creditAccount, amount, receiptUrl } = req.body;
    
    const existingEntries = await JournalEntry.find({}).sort({ date: -1 }).limit(50); // Get recent entries for check
    const { isDuplicate, reason } = await checkForDuplicateEntry(req.body, existingEntries);

    const entry = new JournalEntry({
        date,
        description,
        debitAccount,
        creditAccount,
        amount,
        receiptUrl,
        createdBy: req.user._id,
        isPotentialDuplicate: isDuplicate,
        duplicateReason: reason
    });

    const createdEntry = await entry.save();
    const populatedEntry = await JournalEntry.findById(createdEntry._id).populate('createdBy', 'name');
    res.status(201).json(populatedEntry);
});

// @desc    Update entry status
// @route   PUT /api/journal/:id
// @access  Private/FinanceManager
const updateJournalEntryStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const entry = await JournalEntry.findById(req.params.id);

    if (entry) {
        entry.status = status;
        const updatedEntry = await entry.save();
        const populatedEntry = await JournalEntry.findById(updatedEntry._id).populate('createdBy', 'name');
        res.json(populatedEntry);
    } else {
        res.status(404);
        throw new Error('Journal entry not found');
    }
});

// @desc    Get chart of accounts
// @route   GET /api/journal/accounts
// @access  Private
const getAccounts = asyncHandler(async (req, res) => {
    const accounts = await Account.find({});
    res.json(accounts);
});


export { getJournalEntries, createJournalEntry, updateJournalEntryStatus, getAccounts };