# Up Bank Transaction Importer For [Actual Budget](https://github.com/actualbudget/actual-server)

This project aims to improve the automation of [Actual Budget](https://github.com/actualbudget/actual-server) by allowing you to connect your [Up Bank](https://up.com.au/) accounts to your budget and have automatic transaction imports.
Up bank has a beautiful [API]((https://developer.up.com.au/)) which allows you to take your finances and manipulate it with code. This encouraged me to switch banks as shockingly no other Australian bank supplies an API for personal use.

## Getting Started
These instructions, while long, are written to hopefully be as painless as possible. Even if you're new to coding, you should be able to follow these steps.

### Prerequisites:
- A computer with an internet connection.
- Git installed.
- An Up Bank account.
- Actual Budget installed either locally or hosted.

### Steps:

#### 1. Clone the Repository:
- Open a terminal window (Command Prompt on Windows, Terminal on Mac/Linux). You can use a free online terminal emulator if you don't have one installed.
- Navigate to the directory where you want to download the project files. Then, run the following command to clone the repository:

```https://github.com/YOUR_USERNAME/ActualBudget-UpBank-TransactionImporter.git```

- Replace YOUR_USERNAME with your GitHub username.

#### 2. Install Node.js and npm:
Node.js is a runtime environment that allows you to run JavaScript code outside of a web browser. npm (Node Package Manager) is used to install dependencies (required libraries) for your project.

- Windows: Download and install the latest Node.js version from the official website (https://nodejs.org/en).
- Mac: Open a terminal window and run: brew install node
- Linux: Most distributions have Node.js in their package repositories. Use your package manager to install it (e.g., sudo apt install nodejs on Ubuntu/Debian).

Once installed, open a terminal window and run node -v and npm -v to verify the installation.

#### 3. Install Project Dependencies:
Navigate to the cloned repository directory using the cd command in your terminal. Then, run the following command to install the project's dependencies:

`npm install`
This will download and install all the necessary libraries needed for the script to function.

#### 4. Obtain Up Bank API Key:
- Log in to your Up Bank online banking portal.
- Navigate to the developer section (may vary depending on Up Bank's interface).
- Generate a new API key and copy it for later use.

#### 5. Obtain Actual Budget Credentials:
- Log in to your Actual Budget account.
- Navigate to your profile settings.
- Locate your Actual Budget ID (a unique identifier for your account).
- Locate your Actual Budget Account IDs. (These are IDs for each of your individual on or off budget accounts).

#### 6. Create a .env File:
- In the project's root directory (where you cloned the repository), create a new file named .env. This file is used to store sensitive information like API keys and passwords securely.
- Open the .env file with a text editor and add the following lines, replacing the placeholders with your actual values:

```
UP_BANK_ACCESS_TOKEN=UP_BANK_ACCESS_TOKEN
ACTUAL_BUDGET_SERVER_URL=YOUR_ACTUAL_BUDGET_SERVER_URL 
ACTUAL_BUDGET_ID=YOUR_ACTUAL_BUDGET_ID
ACTUAL_BUDGET_PASSWORD=YOUR_ACTUAL_BUDGET_SCRIPT_PASSWORD
UP_ACCOUNT_MAPPING='{"upAccountId1": "actualBudgetId1", "upAccountId2": "actualBudgetId2", "upAccountId3": "actualBudgetId3"}'
```
**Important**: Never commit the .env file to your version control system (e.g., GitHub) as it contains sensitive information.

#### 7. Running the Script (Simplified Method):

Option 1: Manual Execution

Open a terminal window and navigate to the project's root directory.

Run the following command to execute the script:

Bash

node env environment node BankAPICollect/index.js
This will use the environment variables from your .env file and run the script to import your Up Bank transactions into Actual Budget.

Option 2: Scheduled Execution (Optional):

While the manual execution method works, ideally you'd want to automate the script to run periodically (e.g., daily). Setting up cron jobs (automated tasks) can be a
