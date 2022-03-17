const path = require('path');
const express = require('express')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const {MongoClient} = require('mongodb');
const url = "mongodb://127.0.0.1:27017/";

app.use(express.static(path.join(__dirname, 'services_client')));
app.use(express.static(path.join(__dirname, 'config')));
app.use(express.static(__dirname));
app.request

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const client = new MongoClient(url);
const socketIdToUsername = {}

// Open the connection to the server
client.connect(function(err, mongoclient) {
    const db = mongoclient.db("ana");
    if (err) {
        console.log("MongoDB error...")
        throw err;
    }

    console.log('MongoDB connected...')

    io.on('connection', (socket) => {
        socket.on('message', async msg => {
            // we got a message from a client and we distribute it to all services listening to the channel "client_message".
            const socketId = socket.id

            console.log(socketIdToUsername)
            console.log(socketId)
            console.log(msg)

            if (!msg.username) {
                io.to(socketId).emit("ana_server_response", {"service": "setup_username","message":"Hi, I'm Ana. What's your name?"})
            } else {
                if (!socketIdToUsername.socketId) {
                    if (msg.username) {
                        socketIdToUsername.socketId = msg
                        io.to(socketId).emit("ana_server_response", {"service": "setup_username","message":"Hi " + msg.username + "!"})
                    } else {
                        console.error("Username missing!")
                    }
                } else {
                    const messageId = (await db.collection('messages').countDocuments()) + 1
                    const message = msg
                    message.id = messageId
                    console.log("message socket")
                    io.emit('client_message', message)

                    console.log('socket.id: ' + socket.id)
                    console.log('message: ' + JSON.stringify(message))

                    db.collection('messages').insertOne(message)
                }
            }
        });

        socket.on('server_response', async res => {
            // These are incoming
            console.log("server response socket")
            console.log('socket.id: ' + socket.id)
            console.log('response: ' + JSON.stringify(res))

            if (res.messageId && res.service) {
                const responseId = (await db.collection('responses').countDocuments()) + 1
                db.collection('responses').insertOne({"id": responseId, "messageId": res.messageId, "service": res.service, "response": JSON.stringify(message)})
            } else {
                console.error("MessageId and/or service are missing in response!")
            }

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
});


http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});
