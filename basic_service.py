import socketio

SERVICE_PREFIX = "basic_service"

sio = socketio.Client()
sio.connect('http://localhost:3000')
print('my sid is', sio.sid)

@sio.on('client_message')
def on_message(msg):
    print('I received a message!')
    print(msg)

    # message from the client, use text to process.
    text = msg['msg']

    # Choose a unique name for your service. We are using the prefix here.
    msg['service'] = SERVICE_PREFIX

    # Add a message that can be displayed in the chatbox (optional)
    msg['message'] = "found emotions"

    # Basic things to add for your service, make sure the keys are unique, therefore it makes sense to add the service name, which is unique, as prefix.
    msg[SERVICE_PREFIX + '_stuff'] = {"a":1, "b":2}

    # back to the server.
    sio.emit('server_response', msg)




