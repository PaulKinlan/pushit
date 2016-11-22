const google = require('googleapis');
const gcloud = require('google-cloud');
const datastore = gcloud.datastore({
  projectId: 'toplink-today'
});

class Model {

  static _init () {
    return new Promise(function (resolve, reject) {
      google.auth.getApplicationDefault(function (err, authClient) {
        if (err) {
          console.log('Failed to get the default credentials: ' + String(err));
          return;
        }
        // The createScopedRequired method returns true when running on GAE or a local developer
        // machine. In that case, the desired scopes must be passed in manually. When the code is
        // running in GCE or a Managed VM, the scopes are pulled from the GCE metadata server.
        // See https://cloud.google.com/compute/docs/authentication for more information.
        if (authClient.createScopedRequired && authClient.createScopedRequired()) {
          // Scopes can be specified either as an array or as a single, space-delimited string.
          authClient = authClient.createScoped(['https://www.googleapis.com/auth/compute']);
        }
        resolve(authClient);
      });
    });
}

  constructor(model) {
    this.model = model;
  }

  query(filter) {
    return Model._init().then(() => {
      const q = datastore.createQuery(this.model);
      q.filter(filter[0], filter[1]);
      return datastore.runQuery(q);
    });
  }

  put(keyPath, data) {
    return Model._init().then(() => {
      const key = datastore.key([this.model].concat(keyPath), this.model);
      return datastore.save({
        key: key,
        data: data
      });
    });
  }

  save(data) {
    return Model._init().then(() => {
      const key = datastore.key(this.model);
      return datastore.save({
        key: key,
        data: data
      });
    });
  }

  delete(keyPath) {
    return Model._init().then(() => {
      const key = datastore.key([this.model].concat(keyPath), this.model);
      return datastore.delete(key);
    });
  }

  static get(model, filter) {
    return Model._init().then(() => {
      const q = datastore.createQuery(model);
      q.filter(filter[0], '=', filter[1]);
      return datastore.runQuery(q).then(result => result[0]);
    });
  }

  static query(model, filter) {
    return Model._init().then(() => {
      const q = datastore.createQuery(model);
      q.filter(filter[0], '=', filter[1]);
      return datastore.runQueryStream(q);
    });
  }
}

class ApplicationKey extends Model {

  constructor(publicKey, privateKey) {
    super('ApplicationKey');
    this._publicKey = publicKey;
    this._privateKey = privateKey;
  }

  get publicKey() {
    return this._publicKey;
  }

  get privateKey() {
    return this._privateKey;
  }

  put() {
    return super.put([this.publicKey], {
      publicKey: this.publicKey,
      privateKey: this.privateKey
    });
  }

  static getByPublicKey(publicKey) {
    return super.get('ApplicationKey', ['publicKey', publicKey])
                .then(keyData => new ApplicationKey(keyData[0].publicKey, keyData[0].privateKey));
  }

}

/*
  Record all the messages that have been sent.
   -
*/
class Message extends Model {

  constructor(title, description, url) {
    super('Message');

    this._title = title;
    this._description = description;
    this._url = url;
  }

  get title() {
    return this._title;
  }

  get description() {
    return this._title;
  }

  get url() {
    return this._title;
  }

  put() {
    // Need to think of a key...
    return super.put([this.url], {
      title: this.title,
      description: this.description,
      url: this.url
    });
  }

  static getAllByDate(messageCallback) {
    return this.query('Message')
            .then(stream => {
                  stream.on('error', function() {
                  })
                  .on('data', function (entity) {

                    const title = entity.title;
                    const description = entity.description;
                    const url = entity.url;

                    const message = new Message(title, description, url);

                    messageCallback(message);
                  })
                  .on('info', function(info) {})
                  .on('end', function() {
                    // All entities retrieved.
                  });
        });
  }
}

/*
  A user has one subscription for each topic, the subscription contains
  the auth key.  NOTE: This doesn't handle actual topics right now
   - endpoint (who we are sending it to)
   - Reference to the public key of the server.
   - p256dh key (user public key)
   - auth secret
*/
class Subscription extends Model {
  constructor(topic, endpoint, applicationServerKey, p256dh, authKey, privateKey) {
    super('Subscription');
    this._topic = topic;
    this._endpoint = endpoint;
    this._applicationServerKey = applicationServerKey;
    this._p256dh = p256dh;
    this._authKey = authKey;
    this._privateKey = privateKey;
  }

  get topic() {
    return this._topic;
  }

  get endpoint() {
    return this._endpoint;
  }

  get applicationServerKey() {
    return this._applicationServerKey;
  }

  get p256dh() {
    return this._p256dh;
  }

  get authKey() {
    return this._authKey;
  }

  get privateKey() {
    return this._privateKey;
  }

  put() {
    return super.put([this.endpoint], {
      topic: this.topic,
      endpoint: this.endpoint,
      applicationServerKey: this.applicationServerKey,
      p256dh: this.p256dh,
      authKey: this.authKey,
      privateKey: this.privateKey
    });
  }

  delete() {
    return super.delete([this.endpoint]);
  }

  static getAllByTopic(topic, topicCallback) {
      super.query('Subscription', ["topic", topic])
        .then(stream => {
                  stream.on('error', function() {
                  })
                  .on('data', function (entity) {

                    const topic = entity.topic;
                    const endpoint = entity.endpoint;
                    const aps = entity.applicationServerKey;
                    const p256dh = entity.p256dh;
                    const authKey = entity.authKey;
                    const privateKey = entity.privateKey;
                    const subscription = new Subscription(topic, endpoint, aps, p256dh, authKey, privateKey);

                    topicCallback(subscription);
                  })
                  .on('info', function(info) {})
                  .on('end', function() {
                    // All entities retrieved.
                  });
        });
  }

  static getByEndpoint(endpoint) {
    return super.get('Subscription', ['publicKey', endpoint])
                .then(keyData => {
                  const topic = keyData[0].topic;
                  const endpoint = keyData[0].endpoint;
                  const aps = keyData[0].applicationServerKey;
                  const p256dh = keyData[0].p256dh;
                  const authKey = keyData[0].authKey;
                  const privateKey = entity.privateKey;
                  return new Subscription(topic, endpoint, aps, p256dh, authKey, privateKey);
                });
  }
}

module.exports = {
  ApplicationKey: ApplicationKey,
  Subscription: Subscription
};