const gcloud = require('google-cloud');
const model = require('../model');
const project_id = 'web-push-rocks';
const pubsub = gcloud.pubsub({
  projectId: project_id
});

/*
  Push Notification Subscription Service
  This service will get notified when we have a new subscription
*/

const subscribeTopic = `projects/${project_id}/topics/subscribe`;
const newsTopic = `projects/${project_id}/topics/send`;

// Create the topic
pubsub.createTopic(subscribeTopic)
      .then(data => data[0])
      .catch(data => pubsub.topic(subscribeTopic))
      .then(topic => topic.subscribe('subscription-storage-service', {reuseExisting:true}))
      .then(d => {
        var subscription = d[0];
        subscription.on('message', message => {

          console.log('Recieved Subscription Message', message.data.subscription);

          const data = message.data.subscription;
          const applicationServerKey = data.applicationServerKey;
          const endpoint = data.endpoint;
          const p256dh = data.keys.p256dh;
          const auth = data.keys.auth;
          const privateKey = data.privateKey;

          const userSubscription = new model.Subscription(
            endpoint,
            applicationServerKey,
            p256dh,
            auth,
            privateKey
          );

          // Scoping ick.
          ((m) =>
            userSubscription.put(endpoint).then(() => {
            // Successfully stored. Acknowledge
            m.ack();
          }))(message);
        });
      })