Web application that allows you to create articles and events (CMS), originally developed for Ukrainian expats website.

Setup
=====

Make sure mongodb service is running. Then execute commands:

```sh
cd ./db
./userseed.sh
./dataseed.sh
cd ..
node ./app.js
```
