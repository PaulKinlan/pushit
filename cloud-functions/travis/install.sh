#! /usr/bin/bash

# gcloud --project=web-push-rocks

#gcloud components install alpha

# Create the buckets
gsutil mb -p web-push-rocks gs://web-push-rocks-staging-bucket
gsutil mb -p web-push-rocks gs://web-push-rocks-source-bucket
gsutil mb -p web-push-rocks gs://web-push-rocks-output-bucket

# Create the topic that we send function calls to
gcloud beta pubsub topics create send-travis --project web-push-rocks

# Create the cloud function [TEMPLATE]
gcloud alpha functions deploy send-travis \
  --stage-bucket gs://web-push-rocks-staging-bucket \
  --trigger-provider cloud.pubsub \
  --trigger-event topic.publish \
  --trigger-resource send-travis \
  --entry-point run \
  --project web-push-rocks
