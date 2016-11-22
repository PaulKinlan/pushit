// This is not a real 'test harness' it's more of an end to end thing

const model = require('./index.js');
const project_id = 'toplink-today';

// Integration test that will dump stuff in the database.

initApplicationKey = () => {
  let key = new model.ApplicationKey('1','2');
  console.log('success');
};

saveApplicationKey = () => {
  let key = new model.ApplicationKey('1','2');
  key.put().then(d => console.log(`success`));
}

getApplicationKey = () => {
  model.ApplicationKey.getByPublicKey('1')
     .then(key => console.log(`publicKey: ${key.publicKey}, privateKey: ${key.privateKey}`));
}

saveSubscription = () => {
    sub = new model.Subscription(
            `projects/${project_id}/topics/technology`,
            '1',
            '2',
            '3',
            '4'
          );
    return sub.put(`projects/${project_id}/topics/technology`).then(d => console.log(`success`))
}

getSubscriptionsByTopic = () => {
  model.Subscription.getAllByTopic(`projects/${project_id}/topics/technology`, (topic) => {
       console.log(topic);
  });
    
}


initApplicationKey();
saveApplicationKey();
getApplicationKey();

saveSubscription()
  .catch(err => console.log(err));

getSubscriptionsByTopic();
