const journalEntries = [
    {
        date: '2025-11-10T00:00:00.000Z',
        description: 'Taxi fare for client meeting',
        amount: 15.75,
        debitAccount: '5015',
        creditAccount: '1010',
        receiptUrl: null,
        status: 'Pending',
    },
    {
        date: '2025-11-09T00:00:00.000Z',
        description: 'Office supplies from Addis Stationery',
        amount: 120.50,
        debitAccount: '5005',
        creditAccount: '1020',
        receiptUrl: '/uploads/sample-receipt.jpg',
        status: 'Approved',
    },
    {
        date: '2025-11-08T00:00:00.000Z',
        description: 'Client payment - Invoice #INV-001',
        amount: 2500.00,
        debitAccount: '1020',
        creditAccount: '4000',
        receiptUrl: null,
        status: 'Approved',
    },
     {
        date: '2025-11-07T00:00:00.000Z',
        description: 'Duplicate travel expense claim',
        amount: 350.00,
        debitAccount: '5020',
        creditAccount: '1010',
        receiptUrl: '/uploads/sample-receipt.jpg',
        status: 'Rejected',
    },
];

export default journalEntries;