#!/bin/bash

export ACTUAL_BUDGET_ID=
export ACTUAL_BUDGET_PASSWORD=
export ACTUAL_BUDGET_SERVER_URL=    # http://localhost:5006
export ACTUAL_BUDGET_UP_ACCOUNT_ID=
export ACTUAL_BUDGET_ENCRYPTION_PASSWORD= # Only Required if budget file has end-to-end encryption enabled
export UP_BANK_SYNC_START= # Date & time in rfc-3339 format YYYY-MM-DDTHH:MM:SS[Z or +HH:MM]

# left is up id, right is actual budget id
export UP_ACCOUNT_MAPPING='{
    "up_account1": "actual_budget_account1",
    "up_account2": "actual_budget_account1"
}'

export UP_BANK_ACCESS_TOKEN=

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 18.14.1 && node ~/Projects/budget-app/startup.js  # CHANGE THIS PATH TO SUIT YOUR startup.js
