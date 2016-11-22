Architecture
============

This a set of small services that do one thing.

* Front end:
  * User Subscribes, Publishes the Push Subscription to Topic
* Model:
  * The shared model used across all the services.
* Subscription Sub Service:
  * listens to new Push Subscriptions and saves them to the data store.
* Subscription Send Service:
  * Sends a Web Push to the specific user


Installing node 6 on Ubuntu
===========================

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

### Web Server Config

coniguration/nginx.conf

### App Server Config

npm install pm2 -g

### Set up Certs.

TODO.

### Home directory

/home/[someuser]
chown someuser:www-data   <<< actually, not sure about this.

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
