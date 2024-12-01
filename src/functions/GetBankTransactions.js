const axios = require('axios');
const api = require('@actual-app/api');
require('dotenv').config();


async function fetchTransactions() {
    const accessToken = process.env.UP_BANK_ACCESS_TOKEN;
    try {
        const accountsResponse = await axios.get('https://api.up.com.au/api/v1/accounts', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        //console.log(accountsResponse);
        const accountId = accountsResponse.data.data[0].id;

        const transactionsResponse = await axios.get(`https://api.up.com.au/api/v1/accounts/${accountId}/transactions`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return transactionsResponse.data.data;
    } catch (error) {
        throw new Error('Error fetching transactions: ' + error.message);
    }
}


async function uploadTransactions(transactions) {
    try {
        await api.init({
            dataDir: 'C:\\Users\\User\\Documents\\Projects\\BankAPIConnect\\src\\functions\\tmp', // Use a writable directory
            serverURL: process.env.ACTUAL_BUDGET_SERVER_URL,
            password: process.env.ACTUAL_BUDGET_PASSWORD
        });

        const budgetId = process.env.ACTUAL_BUDGET_ID;
        await api.downloadBudget(budgetId);

        // Fetch and print all account IDs from Actual Budget
        const accounts = await api.getAccounts(); // Assuming this method exists in your API
        console.log('Account IDs in Actual Budget:', accounts.map(account => account.id));

        const formattedTransactions = transactions.map(transaction => {
            const date = new Date(transaction.attributes.settledAt || transaction.attributes.createdAt);
            return {
                account: process.env.ACTUAL_BUDGET_UP_ACCOUNT_ID,
                date: date.toISOString().split('T')[0],
                amount: Math.round(transaction.attributes.amount.value * 100),
                payee_name: transaction.attributes.description || 'Unknown',
            };
        });

        const result = await api.importTransactions(process.env.ACTUAL_BUDGET_UP_ACCOUNT_ID, formattedTransactions);
        console.log('Transactions uploaded successfully:', result);
    } catch (error) {
        console.error('Error in uploadTransactions:', error);
        throw error; // Rethrow to allow the main handler to catch it
    } finally {
        await api.shutdown();
    }
}

async function main() {
    try {
        const transactions = await fetchTransactions();
        await uploadTransactions(transactions);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

// Execute the main function
main();