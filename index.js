const path = require('path');
const express = require('express')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'services_client')));
app.use(express.static(__dirname));
app.request

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('message', msg => {
        // we got a message from a client and we distribute it to the client where it came from and all services_server (just not other clients).
        const socketId = socket.id
        const message = {socketId,msg}
        console.log("message socket")
        io.emit('client_message',message);
        //io.to(socketId).emit("message",message)
        console.log('socket.id: ' + socket.id)
        console.log('message: ' + JSON.stringify(message));
    });

    socket.on('server_response', res => {
        console.log("server response socket")
        console.log('socket.id: ' + socket.id)
        console.log('response: ' + JSON.stringify(res))

        // emit this message back to the client where the original message came from.
        if (res.socketId) {
            io.to(res.socketId).emit("ana_server_response", res)
        }
    });

    socket.on('another_channel_to_do_something', res => {
        // Eventually we'll have a database that stores our messages.
        // This socket channel could be used, for example, to accept requests to look up something in the database and return it.

        // If you want to send a message to this channel in python, it works like this:
        // sio.emit('another_channel_to_do_something', msg)
        // "another_channel_to_do_something" is the unique channel name.

        // A response to the python service can be sent this way:
        // io.to(res.socketId).emit("server_response_for_this_channel", res)
        // we only want to send the response to a specific socket, therefore the socketId of the service requesting has to be used here.
    });
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});
