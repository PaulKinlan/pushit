const gcloud = require('google-cloud');
const webpush = require('web-push');
const model = require('../model');
const project_id = 'toplink-today';
const pubsub = gcloud.pubsub({
  projectId: project_id
});

/*
  Push Notification Send Service
  This service will get notified when we need to send a notification
*/

const newsTopic = `projects/${project_id}/topics/technology`;

// Create the topic
pubsub.createTopic(newsTopic)
      .then(data => topic = data[0])
      .catch(data => topic = pubsub.topic(newsTopic))
      .then(topic => topic.subscribe('subscription-send-service', {reuseExisting:true}))
      .then(data => {
        const subscription = data[0];
        subscription.on('message', message => {
          // We only expect one message a day so this for now will be super super lightweight
          const payload = message.data.message;
          const msgObj = new Message(payload.title, payload.description, payload.url);
          // Save the message object
          msgObj.put();

          model.Subscription.getAllByTopic(`projects/${project_id}/topics/technology`, topic => {
            const applicationServerKey = topic.applicationServerKey;
            const endpoint = topic.endpoint;
            const p256dh = topic.p256dh;
            const auth = topic.authKey;
            const privateKey = topic.privateKey;
            const stringPayload = JSON.stringify(payload);
            const pushSubscription = {
              endpoint: endpoint,
              keys: {
                p256dh: p256dh,
                auth: auth
              }
            };

            webpush.setVapidDetails('https://toplink.today',applicationServerKey, privateKey);

            webpush.sendNotification(
              pushSubscription,
              JSON.stringify(payload)
            )
            .catch(err => {
              if(err.statusCode && err.statusCode == 410) {
                console.log('Subscription not registered');
                // Delete the subscription and ack
                return topic.delete();
              }
            })
            .then(res => {
              message.ack();
            });
          });
        });
      });