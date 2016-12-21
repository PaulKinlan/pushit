let gcloud = require('google-cloud');
const project_id = 'web-push-rocks';
const pubsub = gcloud.pubsub({
  projectId: project_id
});

const sendTopicId = `projects/${project_id}/topics/send`;

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event The Cloud Functions event.
 * @param {!Function} The callback function.
 */
exports.run = function subscribe(event, callback) {
  // The Cloud Pub/Sub Message object.
  const pubsubMessage = event.data;
  const message = JSON.parse(pubsubMessage.message);

  const sendTopic = pubsub.topic(sendTopicId);
  const transformedMessage = {
    "title": `Travis: ${message.status_message}`,
    "description": `${message.status_message}`,
    "url": `${message.build_url}`
  }

  sendTopic.publish({
    id: id,
    message: transformedMessage
  });

  // We're just going to log the message to prove that
  // it worked.
  console.log(Buffer.from(pubsubMessage.data, 'base64').toString());

  // Don't forget to call the callback.
  callback();
};