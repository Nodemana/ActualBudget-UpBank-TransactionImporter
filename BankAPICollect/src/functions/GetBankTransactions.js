const axios = require('axios');
const api = require('@actual-app/api');

//require('dotenv').config();


//=============================================================================
//                         Utility Functions
//=============================================================================


async function AuthenticateUp() {
    const accessToken = process.env.UP_BANK_ACCESS_TOKEN;
    console.log(accessToken);
    try {
        const accountsResponse = await axios.get('https://api.up.com.au/api/v1/accounts', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

    return accountsResponse;
    } catch (error) {
        throw new Error('Error fetching transactions: ' + error.message);
    }
}

async function getUpAccounts(connection) {
    console.log(connection.data.data);
}

async function getBudgetAccounts() {
    await api.init({
        dataDir: '/tmp',
        serverURL: process.env.ACTUAL_BUDGET_SERVER_URL,
        password: process.env.ACTUAL_BUDGET_PASSWORD
    });

    const budgetId = process.env.ACTUAL_BUDGET_ID;
    await api.downloadBudget(budgetId);

    // Fetch and print all account IDs from Actual Budget
    const actualAccounts = await api.getAccounts(); // Assuming this method exists in your API
    console.log('Available Actual Budget Accounts:',
                    actualAccounts.map(a => `${a.name} (ID: ${a.id})`).join(', '));
}


//=============================================================================
//                          All Transactions For Accounts
//=============================================================================

async function fetchTransactionsForAccount(accountId, accessToken) {
    let allTransactions = [];
    let nextPageUrl = `https://api.up.com.au/api/v1/accounts/${accountId}/transactions`;

    try {
        while (nextPageUrl) {
            const transactionsResponse = await axios.get(nextPageUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    'page[size]': 10  // Adjust size as needed
                }
            });

            // Add current page's transactions to the array
            allTransactions = [...allTransactions, ...transactionsResponse.data.data];

            // Update nextPageUrl based on the links in the response
            nextPageUrl = transactionsResponse.data.links.next || null;

            console.log(`Fetched ${allTransactions.length} transactions so far`);
        }

        return allTransactions;
    } catch (error) {
        console.error(`Error fetching transactions for account ${accountId}:`, error.response?.data || error.message);
        throw new Error(`Error fetching transactions for account ${accountId}: ${error.message}`);
    }
}

async function fetchAllTransactions(connection) {
    try {
        const accessToken = process.env.UP_BANK_ACCESS_TOKEN;
        const accounts = connection.data.data;
        let allTransactions = [];

        for (const account of accounts) {
            console.log(`Fetching transactions for account: ${account.attributes.displayName}`);
            const transactions = await fetchTransactionsForAccount(account.id, accessToken);
            allTransactions = [...allTransactions, ...transactions];
        }

        return allTransactions;
    } catch (error) {
        throw new Error('Error fetching all transactions: ' + error.message);
    }
}

async function uploadTransactions(accounts) {
    try {
        await api.init({
            dataDir: '/tmp',
            serverURL: process.env.ACTUAL_BUDGET_SERVER_URL,
            password: process.env.ACTUAL_BUDGET_PASSWORD
        });

        const budgetId = process.env.ACTUAL_BUDGET_ID;
        await api.downloadBudget(budgetId);

        // Fetch the access token and Actual Budget accounts
        const accessToken = process.env.UP_BANK_ACCESS_TOKEN;
        const actualAccounts = await api.getAccounts();

        // Parse account mapping from environment variable (if exists)
        const accountMapping = JSON.parse(process.env.UP_ACCOUNT_MAPPING || '{}');

        // Process each Up account
        for (const account of accounts) {
            const upAccountId = account.id;
            const upAccountName = account.attributes.displayName;

            console.log(`Processing transactions for account: ${upAccountName}`);

            // 1. Check for explicit mapping in environment variable
            let actualBudgetAccountId = accountMapping[upAccountId];

            // 2. If no explicit mapping, try to find by name
            if (!actualBudgetAccountId) {
                const matchedAccount = actualAccounts.find(a =>
                    a.name.toLowerCase() === upAccountName.toLowerCase()
                );

                if (matchedAccount) {
                    actualBudgetAccountId = matchedAccount.id;
                }
            }

            // 3. If still no match, use default or log warning

            if (!actualBudgetAccountId) {
                console.warn(`No account mapping found for Up Account: ${upAccountName} (ID: ${upAccountId})`);
                console.log('Available Actual Budget Accounts:',
                    actualAccounts.map(a => `${a.name} (ID: ${a.id})`).join(', '));
                continue; // Skip this account
            }


            // Fetch transactions for this specific account
            const transactions = await fetchTransactionsForAccount(upAccountId, accessToken);

            const formattedTransactions = transactions.flatMap(transaction => { // Use flatMap
              const roundUpAmount = transaction.attributes.roundUp ? transaction.attributes.roundUp.amount.value : 0;

              const formattedTransaction = {
                account: actualBudgetAccountId,
                date: new Date(transaction.attributes.settledAt || transaction.attributes.createdAt).toISOString().split('T')[0],
                amount: Math.round(transaction.attributes.amount.value * 100),
                payee_name: transaction.attributes.description || 'Unknown',
              };

              if (roundUpAmount !== 0) {
                const roundUpTransaction = {
                  account: actualBudgetAccountId, //Round up destination account
                  date: formattedTransaction.date,
                  amount: -Math.round(Math.abs(roundUpAmount) * 100),
                  payee_name: "Round Up Transfer",
                };
                return [formattedTransaction, roundUpTransaction]; // Return an array
              } else {
                return [formattedTransaction]; // Return an array with a single item
              }
            });

            // Import transactions for this account
            if (formattedTransactions.length > 0) {
                try {
                    console.log(JSON.stringify(formattedTransactions));
                    const result = await api.importTransactions(actualBudgetAccountId, formattedTransactions);
                    console.log(`Uploaded ${formattedTransactions.length} transactions for ${upAccountName}`);
                } catch (importError) {
                    console.error(`Error importing transactions for ${upAccountName}:`, importError);
                }
            } else {
                console.log(`No transactions found for ${upAccountName}`);
            }
        }
    } catch (error) {
        console.error('Error in uploadTransactions:', error);
        throw error;
    } finally {
        await api.shutdown();
    }
}

//=============================================================================
//                          Daily Transactions For Accounts
//=============================================================================


async function fetchDateRangeTransactionsForAccount(accountId, accessToken, since) {
    let allTransactions = [];
    let nextPageUrl = `https://api.up.com.au/api/v1/accounts/${accountId}/transactions`;

    try {
        while (nextPageUrl) {
            const transactionsResponse = await axios.get(nextPageUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    'page[size]': 100,  // Increased page size
                    'filter[since]': since  // Add date filter
                }
            });

            // Add current page's transactions to the array
            allTransactions = [...allTransactions, ...transactionsResponse.data.data];

            // Update nextPageUrl based on the links in the response
            nextPageUrl = transactionsResponse.data.links.next || null;

            console.log(`Fetched ${allTransactions.length} transactions so far for account ${accountId}`);
        }

        return allTransactions;
    } catch (error) {
        console.error(`Error fetching transactions for account ${accountId}:`, error.response?.data || error.message);
        throw new Error(`Error fetching transactions for account ${accountId}: ${error.message}`);
    }
}

async function fetchTransactionsForPastWeek(connection) {
    try {
        const accessToken = process.env.UP_BANK_ACCESS_TOKEN;
        const accounts = connection.data.data;
        let allTransactions = [];

        // Calculate the date for past 24 hours
        const OneWeekAgo = new Date(Date.now() - 24 * 7 * 60 * 60 * 1000).toISOString();

        for (const account of accounts) {
            console.log(`Fetching transactions for account: ${account.attributes.displayName}`);

            try {
                const transactions = await fetchDateRangeTransactionsForAccount(
                    account.id,
                    accessToken,
                    OneWeekAgo
                );

                allTransactions = [...allTransactions, ...transactions];
            } catch (accountError) {
                console.error(`Error processing account ${account.attributes.displayName}:`, accountError);
                // Continue with next account
                continue;
            }
        }

        console.log(`Total transactions fetched in past 24 hours: ${allTransactions.length}`);
        return allTransactions;
    } catch (error) {
        console.error('Error fetching transactions for past day:', error);
        throw new Error('Error fetching transactions for past day: ' + error.message);
    }
}

async function uploadWeeklyTransactions(weeklyTransactions) {
    try {
        await api.init({
            dataDir: '/tmp',
            serverURL: process.env.ACTUAL_BUDGET_SERVER_URL,
            password: process.env.ACTUAL_BUDGET_PASSWORD
        });

        const budgetId = process.env.ACTUAL_BUDGET_ID;
        await api.downloadBudget(budgetId);

        // Fetch Actual Budget accounts
        const actualAccounts = await api.getAccounts();

        // Parse account mapping from environment variable (if exists)
        const accountMapping = JSON.parse(process.env.UP_ACCOUNT_MAPPING || '{}');

        // Group transactions by Up account
        const transactionsByAccount = weeklyTransactions.reduce((acc, transaction) => {
            const accountId = transaction.relationships.account.data.id;
            if (!acc[accountId]) {
                acc[accountId] = {
                    transactions: [],
                    accountName: transaction.relationships.account.data.id // You might want to improve this
                };
            }
            acc[accountId].transactions.push(transaction);
            return acc;
        }, {});

        // Process transactions for each account
        for (const [upAccountId, accountData] of Object.entries(transactionsByAccount)) {
            const upAccountName = accountData.accountName;
            const transactions = accountData.transactions;

            console.log(`Processing weekly transactions for account: ${upAccountName}`);

            // 1. Check for explicit mapping in environment variable
            let actualBudgetAccountId = accountMapping[upAccountId];

            // 2. If no explicit mapping, try to find by name
            if (!actualBudgetAccountId) {
                const matchedAccount = actualAccounts.find(a =>
                    a.name.toLowerCase() === upAccountName.toLowerCase()
                );
                if (matchedAccount) {
                    actualBudgetAccountId = matchedAccount.id;
                }
            }

            // 3. If still no match, use default or log warning
            if (!actualBudgetAccountId) {
                console.warn(`No account mapping found for Up Account: ${upAccountName} (ID: ${upAccountId})`);
                console.log('Available Actual Budget Accounts:',
                    actualAccounts.map(a => `${a.name} (ID: ${a.id})`).join(', '));
                continue; // Skip this account
            }

            const formattedTransactions = transactions.map(transaction => {
              const roundUpAmount = transaction.attributes.roundUp ? spendingTransaction.attributes.roundUp.amount.value : 0;

              const formattedTransaction = {
                account: actualBudgetAccountId,
                date: new Date(transaction.attributes.settledAt || transaction.attributes.createdAt).toISOString().split('T')[0],
                amount: Math.round(transaction.attributes.amount.value * 100),
                payee_name: transaction.attributes.description || 'Unknown',
              };

              if (roundUpAmount !== 0) {
                // Create an additional transaction for the round-up
                const roundUpTransaction = {
                  account: actualBudgetAccountId,
                  date: formattedTransaction.date, // Use the same date as the spending transaction
                  amount: Math.abs(roundUpAmount) * 100, // Positive amount in the Savings account
                  payee_name: "Round Up Transfer",
                };
                console.log(roundUpTransaction);
                // Return an array containing both transactions
                return [formattedTransaction, roundUpTransaction];
              } else {
                // Return the original formatted transaction if no round-up
                return formattedTransaction;
              }
            });

            // Import transactions for this account
            if (formattedTransactions.length > 0) {
                try {
                    const result = await api.importTransactions(actualBudgetAccountId, formattedTransactions);
                    console.log(`Uploaded ${formattedTransactions.length} weekly transactions for ${upAccountName}`);
                } catch (importError) {
                    console.error(`Error importing weekly transactions for ${upAccountName}:`, importError);
                }
            } else {
                console.log(`No weekly transactions found for ${upAccountName}`);
            }
        }
    } catch (error) {
        console.error('Error in uploadTransactions:', error);
        throw error;
    } finally {
        await api.shutdown();
    }
}

module.exports = {
  AuthenticateUp,
  getUpAccounts,
  getBudgetAccounts,
  fetchAllTransactions,
  uploadTransactions,
  fetchTransactionsForPastWeek,
  uploadWeeklyTransactions
};


