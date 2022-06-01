const db = require('../config/connection');
const { User } = require('../models');

const userData = require('./userData.json');

db.once('open', async () => {
  try {
    await User.deleteMany({})

    const users = User.insertMany(userData);

    await User.create(userData);

    console.log('Done seeding!');
    process.exit(0);
  } catch (err) {
    throw err;
  }
});