BlackHole Sniper is monitoring the events of new pair created, has multiple options and has integrated buy/sell
npm i ethers@5.7.0
npm i dotenv
npm i readline
RUN IT WITH THE COMMAND node blSniper.js

The WebSocketServer is a system where you can store in mongodb using the scan.js all new pairs created and with the webSocketServer.js started as a pm2 process you can listen to it and send information to your telegram channel.
npm i ws
npm express
npm i mongoose
npm i telegraf
npm i ethers@5.7.0
npm i axios
pm2 start scan.js
pm2 start webSocketServer.js
