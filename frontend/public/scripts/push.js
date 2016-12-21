let pushSubscription;

if(navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js')
    .then(function() {
      EventManager.trigger('offlineready');
    })
    .catch(function() {
      EventManager.trigger('offlinefailed');
    });

  pushSubscription = navigator.serviceWorker.ready.then(function(reg) {
    if(!!reg.pushManager == false) {
      EventManager.trigger('pushnotsupported');
      return null;
    }

    EventManager.trigger('pushsupported');
    var sub = reg.pushManager.getSubscription().then(function(s) {
      if(!!s) {
        EventManager.trigger('usersubscribed', s);
      }
      return s;
    });

    return sub;
  });
}
else {
  EventManager.trigger('serviceworkernotsupported');
}

EventManager.add('offlineready', function() {
  console.log('offlineready')
});

EventManager.add('serviceworkernotsupported', function() {
  var subscribeButton = document.getElementById('subscribe');
  subscribeButton.innerText = 'Push messaging not supported';
  subscribeButton.disabled = true;
});

EventManager.add('pushsupported', function() {
  console.log('pushsupported');
});

EventManager.add('pushnotsupported', function() {
  var subscribeButton = document.getElementById('subscribe');
  subscribeButton.innerText = 'Push messaging not supported';
  subscribeButton.disabled = true;
});

EventManager.add('usersubscribed', function(subscriptionData) {
  var unsubscribePara = document.getElementById('unsubscribe');
  var subscribeButton = document.getElementById('subscribe');
  var subscribeDataElement = document.getElementById('dataElement');
  var exampleCurl = document.getElementById('exampleCurl');
  var testBtn = document.getElementById('test');

  unsubscribePara.classList.add('visible');
  subscribeDataElement.classList.add('visible');
  exampleCurl.classList.add('visible');
  testBtn.classList.add('visible');
  subscribeButton.innerText = 'Subscribed';
  subscribeDataElement.innerText = `${location.origin}/send?id=${subscriptionData.endpoint}`;
  exampleCurl.innerText = `curl -XPOST -H "Content-type: application/json" -d '{
    "title": "This is a test",
    "description": "This is a longer description",
    "icon": "https://pbs.twimg.com/profile_images/2736788281/13811f0063041a72d7ea6ede7b89fedd.png",
    "image": "https://pbs.twimg.com/profile_images/2736788281/13811f0063041a72d7ea6ede7b89fedd.png"
}' '${location.origin}/send?id=${subscriptionData.endpoint}'`;
});

EventManager.add('sendtestmessage', function(subscriptionData) {
  var fetchOptions = {
    method: 'post',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({
      "title": "This is a test",
      "description": "This is a longer description",
      "icon": "https://pbs.twimg.com/profile_images/2736788281/13811f0063041a72d7ea6ede7b89fedd.png",
      "image": "https://pbs.twimg.com/profile_images/2736788281/13811f0063041a72d7ea6ede7b89fedd.png"
    })
  };
  
  return fetch(`${location.origin}/send?id=${subscriptionData.endpoint}`, fetchOptions);
});

EventManager.add('userunsubscribed', function() {
  var unsubscribePara = document.getElementById('unsubscribe');
  var subscribeButton = document.getElementById('subscribe');
  var subscribeDataElement = document.getElementById('dataElement');
  var exampleCurl = document.getElementById('exampleCurl');
  var testBtn = document.getElementById('test');

  unsubscribePara.classList.remove('visible');
  subscribeDataElement.classList.remove('visible');
  exampleCurl.classList.remove('visible');
  testBtn.classList.remove('visible');
  subscribeButton.innerText = 'Subscribe';
  subscribeDataElement.innerText = '';
  exampleCurl.innerText = '';
});

EventManager.add('pushunsubscribed', function() {
  var unsubscribePara = document.getElementById('unsubscribe');
  unsubscribePara.classList.remove('visible');
});

window.addEventListener('load', function() {
  var subscribe = document.getElementById('subscribe');
  var unsubscribe = document.getElementById('unsubscribe');
  var testBtn = document.getElementById('test');

  subscribe.addEventListener('click', function() {

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    pushSubscription.then(sub => {
      if(!!sub) {
        return sub.unsubscribe().then(function(s) {return navigator.serviceWorker.ready; });
      }
      return navigator.serviceWorker.ready;
    })
    .then(function(reg) {
      return reg.pushManager.subscribe({
         userVisibleOnly: true,
         applicationServerKey: convertedVapidKey
      })
    })
    .then(function(subscription) {
      // Update the global state (sorry) and pass through
      pushSubscription = Promise.resolve(subscription);
      return pushSubscription;
    })
    .then(function(subscription) {
      // Process the subscription
      let subscriptionData = subscription.toJSON();
      subscriptionData.applicationServerKey = vapidPublicKey;
      var fetchOptions = {
        method: 'post',
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(subscriptionData)
        };
      return fetch('/subscribe', fetchOptions).then(() => subscriptionData);
    })
    .then(function(subscriptionData) {
      EventManager.trigger('usersubscribed', subscriptionData);
    })
    .catch(function() {
      EventManager.trigger('usersubsribefailed');
    });
  });

  unsubscribe.addEventListener('click', function() {
    pushSubscription.then(sub => {
      if(!!sub) {
        return sub.unsubscribe().then(() => {
          pushSubscription = Promise.resolve(null);
          EventManager.trigger('userunsubscribed');
        });
      }
    });
  });

  testBtn.addEventListener('click', function() {
    pushSubscription.then(sub => {
      if(!!sub) {
        EventManager.trigger('sendtestmessage', sub);
      }
    });
  });
});