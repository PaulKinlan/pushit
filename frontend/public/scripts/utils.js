function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

var EventManager = new (function() {
  var events = {};

  this.trigger = function(name, data) {
    return new Promise(function(resolve, reject) {
      var handlers = events[name];
      if(!!handlers === false) return;
      handlers.forEach(function(handler) {
        handler.call(this, data);
      });
      resolve();
    });
  };

  this.add = function(name, handler) {
    var handlers = events[name];
    if(!!handlers === false) {
      handlers = events[name] = [];
    }
    handlers.push(handler);
  };
  this.remove = function(name, handler) {
    var handlers = events[name];
    if(!!handlers === false) return;

    var handlerIdx = handlers.indexOf(handler);
    handlers.splice(handlerIdx);
  };
});

class PushManager {
  constructor() {
  }

  get subscriptionId() {
      //global var ick...
      if(pushSubscription) {
          return `${location.origin}/send?id=${pushSubscription.endpoint}`;
      }
      else {
          return;
      }
  }
}

var setupComlink = function(opener) {
   // We are ready. Tell the opener.
   var channel = new MessageChannel();
   var port1 = channel.port1;
   comlink = Comlink.proxy(port1);
   comlink.expose(PushManager);
   opener.postMessage({'cmd': 'READY'}, '*', [channel.port2]);
}