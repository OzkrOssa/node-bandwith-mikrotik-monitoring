const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const RouterOSClient = require('routeros-client').RouterOSClient;

const routeros = new RouterOSClient({
    host: "10.99.99.4",
    user: "redplanet",
    password: "****10596853"
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

routeros.connect().then((client) => {

  const monitorTraffic = client.menu("/interface monitor-traffic");
  const traffic = monitorTraffic.where({
    interface: "ether3"
  }).stream((err, data) => {
    if (err) {
        // Error trying to stream
        console.log(err);
        return;
    };

    const {"rxBitsPerSecond":rx, "txBitsPerSecond":tx} = data[0];
    console.log({
        rx: rx/1000000,
        tx: tx/1000000
    }); // { tx: 37894, rx: 35481, txPackets: 9, rxPackets: 9 }

    io.emit('traffic', {rx: rx/1000000,tx: tx/1000000});
});


}).catch((err) => {
    // Error when trying to connect
    console.log(err);
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});