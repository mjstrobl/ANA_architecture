import socketio


import torch
from torch.autograd import Variable
from model_cpu import AttentionLSTMClassifier
import pickle

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# stop_words = set(stopwords.words('english'))
NUM_CLASS = 9


def inference(t, word2id, model):

    t = t.lower()

    word_tokens = word_tokenize(t)
    # filtered_sentence = [w for w in word_tokens if w not in stop_words]
    text = ' '.join(word_tokens)
    tokens = text.split()
    tmp = [word2id[x] if x in word2id else word2id['<unk>'] for x in tokens]
    if len(tmp) == 0:
        tmp = [word2id['<empty>']]

    to_infer = torch.LongTensor([tmp, tmp])
    seq_len = torch.LongTensor([len(tmp), len(tmp)])
    y_pred = model(Variable(to_infer), seq_len)
    y_pred = y_pred.data.numpy()
    return y_pred[0]



num_labels = NUM_CLASS
vocab_size = 30000
batch_size = 5
embedding_dim = 200
hidden_dim = 600
label_cols = ['anger', 'fear', 'joy', 'love', 'sadness', 'surprise', 'thankfulness', 'disgust', 'guilt']
with open('checkpoint/some_data.pkl', 'br') as f:
    word2id, id2word = pickle.load(f)

model = AttentionLSTMClassifier(embedding_dim, hidden_dim, vocab_size, word2id,
                                num_labels, batch_size, use_att=False, soft_last=False)

model.load_state_dict(torch.load(
    'checkpoint/cbet2.model'
))
model.eval()


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

    y_pred = inference(text, word2id, model)
    # Choose a unique name for your service. We are using the prefix here.
    msg['service'] = SERVICE_PREFIX

    # Add a message that can be displayed in the chatbox (optional)
    msg['message'] = str(y_pred)

    # Basic things to add for your service, make sure the keys are unique, therefore it makes sense to add the service name, which is unique, as prefix.
    msg[SERVICE_PREFIX + '_stuff'] = {"a":1, "b":2}

    # back to the server.
    sio.emit('server_response', msg)





