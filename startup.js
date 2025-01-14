const BankAPILib = require('./BankAPICollect/src/functions/GetBankTransactions');

async function main() {
  try {
    const connection = await BankAPILib.AuthenticateUp();
    const accounts = connection.data.data;

    await BankAPILib.uploadTransactions(accounts);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
