Architecture
============

This a set of small services that do one thing.

* Front end:
  * User Subscribes to Topic, Publishes the Push Subscription to Topic
  * Admin interface:
    * sends a message
    * stats
* Model:
  * The shared model used across all the services.
* Subscription Sub Service:
  * listens to new Push Subscriptions and saves them to the data store.
* Subscription Send Service:
  * Sends a Web Push to the all the users listening to the Topic


Installing node 7 on Ubuntu
===========================

curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs

Some other deps
===============

* Node 6 (7 doesn't yet work with grpc)
* npm install -g pm2

Gcloud commands
===============

```
gcloud compute instance create instance-2 \
  --machine-type f1-micro \
  --image ubuntu-14-10 \
  --scopes userinfo-email,datastore,storage-full,compute,https://www.googleapis.com/auth/pubsub,cloud-platforms
``` 
