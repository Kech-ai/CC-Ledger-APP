import mongoose from 'mongoose';

const accountSchema = mongoose.Schema({
    _id: { type: String, alias: 'code' },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['Asset', 'Liability', 'Equity', 'Income', 'Expense'],
    },
});

const Account = mongoose.model('Account', accountSchema);

export default Account;