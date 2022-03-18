import socketio

SERVICE_PREFIX = "basic_service"

def emit_setup_message(sio, msg=None):
    if msg:
        msg['service'] = SERVICE_PREFIX
        sio.emit('service_setup_response_server', msg)
    else:
        sio.emit('service_setup_response_server', {"service": SERVICE_PREFIX})

sio = socketio.Client()
sio.connect('http://localhost:3000')
print('my sid is', sio.sid)

# emit setup message
emit_setup_message(sio)

@sio.on('client_message')
def on_message(msg):
    print('I received a message!')
    print(msg)

    # message from the client, use text to process.
    text = msg['msg']

    # Choose a unique name for your service. We are using the prefix here.
    msg['service'] = SERVICE_PREFIX

    # Add a message that can be displayed in the chatbox (optional)
    msg['message'] = "found something"

    # Basic things to add for your service, make sure the keys are unique, therefore it makes sense to add the service name, which is unique, as prefix.
    msg[SERVICE_PREFIX + '_stuff'] = {"a":1, "b":2}

    # back to the server.
    sio.emit('server_response', msg)

@sio.on('service_setup')
def on_message(msg):
    print('I received a setup message!')
    #I'm working, therefore we can reply here.

    #This is a message back to the server letting it know that this service is working.
    #You have to make sure that there is a tab button with id=SERVICE_PREFIX_button, e.g. kgp_button for Michael's KGP service.

    emit_setup_message(sio, msg)




