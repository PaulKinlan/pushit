const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const gcloud = require('google-cloud');
const model = require('../model');
const path = require ('path');

// Project variables
const project_id = 'web-push-rocks';
const app = express();
const pubsub = gcloud.pubsub({
  projectId: project_id
});
const subscribeTopicId = `projects/${project_id}/topics/subscribe`;
const sendTopicId = `projects/${project_id}/topics/send`;
const sendRawTopicId = `projects/${project_id}/topics/send-raw`;
const jsonParser = bodyParser.json();

let subscribeTopic;
let sendTopic;
let sendRawTopic;
let instanceVAPIDKey;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', {
    publicKey: instanceVAPIDKey.publicKey,
    messages: [{}]
  });
});

app.post('/subscribe', jsonParser, (req, res) => {
  const subscription = req.body;
  console.log(subscription);

  subscription.privateKey = instanceVAPIDKey.privateKey;

  subscribeTopic.publish({
    subscription: subscription
  });
  res.send('ok');
});

app.post('/send', jsonParser, (req, res) => {
  const message = req.body;
  const id = req.query.id;

  console.log(message)

  sendTopic.publish({
    id: id,
    message: message
  });

  res.send('ok');
});

app.post('/send-raw', jsonParser, (req, res) => {
  const message = req.body;
  const id = req.query.id;
  const processor = req.query.processor;

  console.log(message)

  sendRawTopic.publish({
    id: id,
    processor: processor,
    message: message
  });

  res.send('ok');
});



app.listen(3000, () => {
  app.set('views', path.join(__dirname , 'views'));
  app.set('view engine', 'ejs');

  const vapidKeys = webpush.generateVAPIDKeys();

  // Before the server starts, let's get VAPID persisted
  instanceVAPIDKey = new model.ApplicationKey(vapidKeys.publicKey, vapidKeys.privateKey);
  instanceVAPIDKey.put();

  // Create the topic
  pubsub.createTopic(subscribeTopicId)
        .then(data => subscribeTopic = data[0])
        .catch(data => subscribeTopic = pubsub.topic(subscribeTopicId));

  // Create the topic that will be used to send the broadcasts.
  pubsub.createTopic(sendTopicId)
        .then(data => sendTopic = data[0])
        .catch(data => sendTopic = pubsub.topic(sendTopicId));

 // Create the topic that will be used to send the broadcasts to cloud function
  pubsub.createTopic(sendRawTopicId)
        .then(data => sendRawTopic = data[0])
        .catch(data => sendRawTopic = pubsub.topic(sendRawTopicId));

  console.log('Front-end is listenting on port 3000');
});