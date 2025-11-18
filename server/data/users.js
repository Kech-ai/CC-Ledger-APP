import bcrypt from 'bcryptjs';

const users = [
    { name: 'Super Admin', email: 'admin@cctech.com', password: bcrypt.hashSync('123456', 10), role: 'Super Admin' },
    { name: 'Dana Accountant', email: 'dana@cctech.com', password: bcrypt.hashSync('123456', 10), role: 'Accountant' },
    { name: 'Alex Manager', email: 'alex@cctech.com', password: bcrypt.hashSync('123456', 10), role: 'Finance Manager' },
    { name: 'Sam Auditor', email: 'sam@cctech.com', password: bcrypt.hashSync('123456', 10), role: 'Auditor' },
];

export default users;