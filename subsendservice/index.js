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

// Create the topic
pubsub.createTopic(sendTopic)
      .then(data => data[0])
      .catch(data => pubsub.topic(sendTopic))
      .then(topic => topic.subscribe('subscription-send-service', {reuseExisting:true}))
      .then(data => {
        const subscription = data[0];
        subscription.on('message', message => {
          // We only expect one message a day so this for now will be super super lightweight
          const id = message.data.id;
          const payload = message.data.message;

          console.log(`Recieved Message ${message.data}`);
          console.log(`Recieved Message.Id ${id}`);

          model.Subscription.getByEndpoint(id)
          .then(sub => {
            console.log(`Got Subscription ${sub.endpoint}`);
            const applicationServerKey = sub.applicationServerKey;
            const endpoint = sub.endpoint;
            const p256dh = sub.p256dh;
            const auth = sub.authKey;
            const privateKey = sub.privateKey;
            const stringPayload = JSON.stringify(payload);
            console.log(`Payload: ${stringPayload}`);
            const pushSubscription = {
              endpoint: endpoint,
              keys: {
                p256dh: p256dh,
                auth: auth
              }
            };

            webpush.setVapidDetails('https://webpush.rocks', applicationServerKey, privateKey);

            webpush.sendNotification(
              pushSubscription,
              stringPayload
            )
            .catch(err => {
              if(err.statusCode && err.statusCode == 410) {
                console.log('Subscription not registered');
                // Delete the subscription and ack
                return sub.delete();
              }
            })
            .then(res => {
              message.ack();
            });
          }, err=> {
            console.error(`Error ${err}`);
            message.ack();
          })
          .catch(err => {
            console.error(`Error getting subscription: ${err}`);
            message.ack();
          });
        });
      });