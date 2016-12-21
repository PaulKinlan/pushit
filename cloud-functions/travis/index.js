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
  const data = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
  const msgObject = JSON.parse(data.message.payload);

  const sendTopic = pubsub.topic(sendTopicId);
  const transformedMessage = {
    "title": `Travis: ${msgObject.repository.name} ${msgObject.status_message}`,
    "description": `${msgObject.status_message}`,
    "url": `${msgObject.build_url}`
  };

  sendTopic.publish({
    id: id,
    message: transformedMessage
  });

  // Don't forget to call the callback.
  callback();
};