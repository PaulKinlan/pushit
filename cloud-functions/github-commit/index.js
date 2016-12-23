let gcloud = require('google-cloud');
const project_id = 'web-push-rocks';
const pubsub = gcloud.pubsub({
  projectId: project_id
});

const sendTopicId = `projects/${project_id}/topics/send`;


const transformMessage = (type, payload) => {
  switch(type) {
    case 'issues':
      return {
        "title": `Github Issue ${payload.action}: ${payload.repository.full_name}`,
        "description": `${payload.issue.title}`,
        "icon": `${payload.issue.user.avatar_url}`,
        "url": `${payload.issue.html_url}`
      };
    case 'push':
      return {
        "title": `Github ${type}: ${payload.repository.full_name}`,
        "description": `${payload.head_commit.message}`,
        "icon": `${payload.sender.avatar_url}`,
        "url": `${payload.head_commit.url}`
      };
    default:
      return {
        "title": `Github ${type} on ${payload.repository.full_name}`,
        "url": `${payload.repository.html_url}`
      };
  }

};

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
  const id = data.id;
  const headers = data.headers;
  const msgObject = data.message; 
  const sendTopic = pubsub.topic(sendTopicId);

  const eventType = headers['x-github-event'];

  sendTopic.publish({
    id: id,
    message: transformMessage(eventType, msgObject)
  });

  // Don't forget to call the callback.
  callback();
};