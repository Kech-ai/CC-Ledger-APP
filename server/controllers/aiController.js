import asyncHandler from 'express-async-handler';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractReceiptData, suggestAccount, summarizeReport } from '../services/geminiService.js';
import Account from '../models/Account.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Scan a receipt image
// @route   POST /api/ai/scan-receipt
// @access  Private
const scanReceipt = asyncHandler(async (req, res) => {
    const { imagePath } = req.body;

    if (!imagePath) {
        res.status(400);
        throw new Error('No image path provided');
    }
    const fullPath = path.resolve(__dirname, '..', imagePath.substring(1));
    
    try {
        const data = await extractReceiptData(fullPath);
        res.json(data);
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to process receipt with AI: ${error.message}`);
    }
});

// @desc    Suggest an account based on description
// @route   POST /api/ai/suggest-account
// @access  Private
const suggestExpenseAccount = asyncHandler(async (req, res) => {
    const { description } = req.body;
    if (!description) {
        res.status(400);
        throw new Error('Description is required');
    }
    
    try {
        const chartOfAccounts = await Account.find({});
        const suggestedAccount = await suggestAccount(description, chartOfAccounts);
        res.json(suggestedAccount);
    } catch (error) {
         res.status(500);
        throw new Error(`Failed to get suggestion from AI: ${error.message}`);
    }
});

// @desc    Summarize a financial report
// @route   POST /api/ai/summarize-report
// @access  Private
const getReportSummary = asyncHandler(async (req, res) => {
    const { reportName, reportData } = req.body;
    if (!reportName || !reportData) {
        res.status(400);
        throw new Error('Report name and data are required');
    }

    try {
        const summary = await summarizeReport(reportName, reportData);
        res.send(summary);
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to get summary from AI: ${error.message}`);
    }
});


export { scanReceipt, suggestExpenseAccount, getReportSummary };