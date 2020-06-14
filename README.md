ukrexpat.com - website for Ukrainian expats and diaspora

# Local setup

Make sure mongodb service is running.

```sh
cd ./db
./userseed.sh
./dataseed.sh
cd ..
node ./app.js
```
