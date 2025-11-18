import mongoose from 'mongoose';
import dotenv from 'dotenv';
import users from './data/users.js';
import accounts from './data/accounts.js';
import journalEntries from './data/journalEntries.js';
import User from './models/User.js';
import JournalEntry from './models/JournalEntry.js';
import Account from './models/Account.js';
import connectDB from './config/db.js';

dotenv.config();

const runSeeder = async () => {
    await connectDB();

    // Check if the seeder can run
    if (!mongoose.connection.readyState || mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
        console.error('MongoDB not connected. Seeder cannot run. Please check your MONGO_URI in server/.env');
        process.exit(1);
    }

    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};


const importData = async () => {
  try {
    await User.deleteMany();
    await JournalEntry.deleteMany();
    await Account.deleteMany();

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;
    const accountantUser = createdUsers[1]._id;


    const sampleEntries = journalEntries.map(entry => {
      return { ...entry, createdBy: accountantUser };
    });

    await JournalEntry.insertMany(sampleEntries);
    await Account.insertMany(accounts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await JournalEntry.deleteMany();
    await Account.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

runSeeder();
