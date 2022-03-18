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

    # messages from the client, use text to process. Of type list, typically one item, but could be more.
    messages_from_client_list = msg['messages']

    # Choose a unique name for your service. We are using the prefix here.
    msg['service'] = SERVICE_PREFIX

    responses = []

    for message_dict in messages_from_client_list:
        message = message_dict['message']
        messageId = message_dict['messageId']
        responses.append({"message": "response for this message", "messageId": messageId,
                          SERVICE_PREFIX + "_stuff": "a string or a dictionary of something else you need to attach. Make sure it starts with your prefix, otherwise you can use whatever key you'd like."})

    msg['responses'] = responses
    # back to the server.
    sio.emit('server_response', msg)

@sio.on('service_setup')
def on_message(msg):
    print('I received a setup message!')
    #I'm working, therefore we can reply here.

    #This is a message back to the server letting it know that this service is working.
    #You have to make sure that there is a tab button with id=SERVICE_PREFIX_button, e.g. kgp_button for Michael's KGP service.

    emit_setup_message(sio, msg)




