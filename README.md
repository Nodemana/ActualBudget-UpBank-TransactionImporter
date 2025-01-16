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
#### 2. Install nvm:
  - Open a terminal window.
  - Run the following command to download and install the nvm script: **NOTE You will need a WSL terminal if on Windows.**

    `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`

    Note: Replace v0.39.3 with the latest nvm version number if you prefer. Check the official nvm GitHub repository for the latest version: https://github.com/nvm-sh/nvm
  - Close and reopen your terminal window for the changes to take effect. 

#### 3. Verify nvm installation:
- Run the following command to check if nvm is installed correctly:
    `nvm -v`
This should print the installed nvm version.

#### 4. Install Node.js version 18.4.1:
- Use the following command to install Node.js version 18.4.1:
  `nvm install 18.4.1`

#### 5. Verify Node.js installation:
- Run the following commands to verify the installed Node.js version and npm version:
```
node -v
npm -v
```
These should print v18.4.1 for Node.js and the corresponding npm version.

#### 6. Install Project Dependencies:
Navigate to the cloned repository directory using the cd command in your terminal. Then, run the following command to install the project's dependencies:

`npm install`
This will download and install all the necessary libraries needed for the script to function.

#### 7. Obtain Up Bank API Key:
- Log in to your Up Bank online banking portal.
- Navigate to the developer section (may vary depending on Up Bank's interface).
- Generate a new API key and copy it for later use.

#### 8. Obtain Actual Budget Credentials:
- Log in to your Actual Budget account.
- Navigate to your profile settings.
- Locate your Actual Budget ID (a unique identifier for your account).
- Locate your Actual Budget Account IDs. (These are IDs for each of your individual on or off budget accounts).

#### 9. In The autorun.sh File:
- In the project's root directory (where you cloned the repository), there is a file called autorun.sh. This file is used to store sensitive information like API keys and passwords securely and is the entry point of the automated script.
- Open the autorun.sh file with a text editor and add your credentials to the other side of the equals signs:

```
export ACTUAL_BUDGET_ID=
export ACTUAL_BUDGET_PASSWORD=
export ACTUAL_BUDGET_SERVER_URL=    # http://localhost:5006
export ACTUAL_BUDGET_UP_ACCOUNT_ID=

# left is up id, right is actual budget id
export UP_ACCOUNT_MAPPING='{
    "up_account1": "actual_budget_account1",
    "up_account2": "actual_budget_account1"
}'

export UP_BANK_ACCESS_TOKEN=

```
**Important**: Never commit this file to your version control system (e.g., GitHub) as it contains sensitive information.

Explanation of `UP_ACCOUNT_MAPPING`: This section is crucial for mapping your Up Bank accounts to the correct accounts in Actual Budget. You need to replace the placeholder IDs with your actual IDs. For example:
```
{
  "12345678-abcd-efgh-ijkl-1234567890ab": "98765432-zyxw-vuts-rqpo-0987654321dc",
  "98765432-zyxw-vuts-rqpo-0987654321dc": "56789012-lkjh-gfed-cba9-2109876543fe"
}
```

This maps the Up Bank account with ID `12345678-abcd-efgh-ijkl-1234567890ab` to the Actual Budget account with ID `98765432-zyxw-vuts-rqpo-0987654321dc`, and so on.

#### 10. Running the Script (Simplified Method):

Option 1: Manual Execution

Open a terminal window and navigate to the project's root directory.

Run the following command to execute the script:
`./autorun.sh`

Option 2: Scheduled Execution (Recommended - Cron Job)

To automate the script to run periodically (e.g., daily), you can use cron (on Linux/macOS) or Task Scheduler (on Windows).

Example Cron Job (runs daily at 3:00 AM):
- Open your crontab for editing:
    `crontab -e`
- Add the following line to the crontab (adjust the path to your autorun.sh script):
`0 3 * * * /path/to/your/project/autorun.sh`
- Replace `/path/to/your/project/autorun.sh` with the absolute path to the autorun.sh file. You can get the absolute path by running pwd in your project directory and then appending /autorun.sh.

Explanation of the Cron Expression:
- 0: Minute (0-59)
- 3: Hour (0-23)
- *: Day of the month (1-31)
- *: Month (1-12)
- *: Day of the week (0-6, Sunday is 0)

This setup will run the script every day at 3:00 AM.
