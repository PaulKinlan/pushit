const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const gcloud = require('google-cloud');
const model = require('../model');
const passport = require('passport');
const path = require ('path');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Project variables
const project_id = 'toplink-today';
const app = express();
const pubsub = gcloud.pubsub({
  projectId: 'toplink-today'
});
const topicId = `projects/${project_id}/topics/subscribe-technology`;
const newsTopicId = `projects/${project_id}/topics/technology`;
const jsonParser = bodyParser.json();

let topic;
let newsTopic;
let instanceVAPIDKey;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Set up the authentication
passport.use(new GoogleStrategy({
    clientID: '163224464558-th8il090r9d7nf0qikhhf8ac4e4hpa6n.apps.googleusercontent.com',
    clientSecret: '7fJrnRoGagG65HsCnboa4DDa',
    callbackURL: "https://toplink.today/auth/google/callback"
  }, (accessToken, refreshToken, profile, done) => {
    if(profile.id === '116059998563577101552') {
      console.log('correct profile');
      return done(null, profile);
    }
    else {
      return done(null, false,  { message: 'Incorrect user.' });
    }
  }));

app.use(express.static('public'));
app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: false,
  resave: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.render('index', {
    publicKey: instanceVAPIDKey.publicKey,
    messages: [{}]
  });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
     successRedirect: '/admin/post',
     failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/admin/post');
  });

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.post('/subscribe', jsonParser, (req, res) => {
  const subscription = req.body;
  console.log(subscription);

  subscription.privateKey = instanceVAPIDKey.privateKey;

  topic.publish({
    subscription: subscription
  });
  res.send('ok');
});

app.get('/admin/post',
  ensureAuthenticated,
  (req,res) => {
    res.render('admin');
});

app.post('/admin/post',
  ensureAuthenticated,
  bodyParser.urlencoded({ extended: true }),
  (req,res) => {
    const message = req.body;
    newsTopic.publish({
       message: message
    });
    res.redirect('/admin/post');
});

app.listen(3000, () => {
  app.set('views', path.join(__dirname , 'views'));
  app.set('view engine', 'ejs');

  const vapidKeys = webpush.generateVAPIDKeys();

  // Before the server starts, let's get VAPID persisted
  instanceVAPIDKey = new model.ApplicationKey(vapidKeys.publicKey, vapidKeys.privateKey);
  instanceVAPIDKey.put();

  // Create the topic
  pubsub.createTopic(topicId)
        .then(data => topic = data[0])
        .catch(data => topic = pubsub.topic(topicId));

  // Create the topic that will be used to send the broadcasts.
  pubsub.createTopic(newsTopicId)
        .then(data => newsTopic = data[0])
        .catch(data => newsTopic = pubsub.topic(newsTopicId));

  console.log('Front-end is listenting on port 3000');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}