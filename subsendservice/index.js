const gcloud = require('google-cloud');
const webpush = require('web-push');
const model = require('../model');
const project_id = 'web-push-rocks';
const pubsub = gcloud.pubsub({
  projectId: project_id
});

/*
  Push Notification Send Service
  This service will get notified when we need to send a notification
*/

const sendTopic = `projects/${project_id}/topics/send`;
let topic;

// Create the topic
pubsub.createTopic(sendTopic)
      .then(data => topic = data[0])
      .catch(data => topic = pubsub.topic(sendTopic))
      .then(topic => topic.subscribe('subscription-send-service', {reuseExisting:true}))
      .then(data => {
        const subscription = data[0];
        subscription.on('message', message => {
          // We only expect one message a day so this for now will be super super lightweight
          const id = message.data.id;
          const payload = message.data.message;

          model.Subscription.getByEndpoint(id).then(sub => {

            webpush.setVapidDetails('https://webpush.rocks', applicationServerKey, privateKey);

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