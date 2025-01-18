const BankAPILib = require('./BankAPICollect/src/functions/GetBankTransactions');
require('dotenv').config();
const cron = require('node-cron');

async function startup() {
  try {
    const connection = await BankAPILib.AuthenticateUp();
    const accounts = connection.data.data;

    await BankAPILib.uploadTransactions(accounts);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function update() {
  try {
    const connection = await BankAPILib.AuthenticateUp();
    const dailyTransactions = await BankAPILib.fetchTransactionsForPastWeek(connection);
    await BankAPILib.uploadWeeklyTransactions(dailyTransactions);
  } catch (error) {
    console.error('Error:', error);
  }
}

startup();

cron.schedule('*/1 * * * *', async () => {
    await update();
});
console.log('Cron job scheduled. Waiting for next execution.');
