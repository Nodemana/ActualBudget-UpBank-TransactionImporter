const BankAPILib = require('./BankAPICollect/src/functions/GetBankTransactions');
require('dotenv').config();
const cron = require('node-cron');

async function GetAccounts() {
    try {
        const UpResponse = await BankAPILib.AuthenticateUp();
        console.log("========================================================================================");
        console.log("===========================Up Accounts==================================================");
        console.log("========================================================================================");

        await BankAPILib.getUpAccounts(UpResponse);
        console.log("========================================================================================");
        console.log("===========================Actual Budget Accounts=======================================");
        console.log("========================================================================================");

        await BankAPILib.getBudgetAccounts();
    } catch (error) {
        console.error('Error in GetAccounts:', error);
    }
}

async function startup() {
  try {
    await GetAccounts();
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
