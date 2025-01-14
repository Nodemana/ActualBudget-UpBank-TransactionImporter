const BankAPILib = require('./BankAPICollect/src/functions/GetBankTransactions');
require('dotenv').config();

async function main() {
  try {
    const connection = await BankAPILib.AuthenticateUp();
    const dailyTransactions = await BankAPILib.fetchTransactionsForPastWeek(connection);
    await BankAPILib.uploadWeeklyTransactions(dailyTransactions);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
