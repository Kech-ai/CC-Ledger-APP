import mongoose from 'mongoose';

const journalEntrySchema = mongoose.Schema({
    date: { type: Date, required: true },
    description: { type: String, required: true },
    debitAccount: { type: String, required: true },
    creditAccount: { type: String, required: true },
    amount: { type: Number, required: true },
    receiptUrl: { type: String, default: null },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    isPotentialDuplicate: { type: Boolean, default: false },
    duplicateReason: { type: String, default: null },
}, {
    timestamps: true,
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

export default JournalEntry;