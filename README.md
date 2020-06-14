ukrexpat.com - portal for Ukrainian expats and diaspora

# Local setup

Make sure mongodb service is running.

cd ./db
./userseed.sh
./dataseed.sh
cd ..
node ./app.js
