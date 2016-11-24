# /usr/bin/sh

(cd model && npm install && npm rebuild --build-from-source google-cloud)
(cd frontend && npm install && npm rebuild --build-from-source google-cloud)
(cd subsendservice && npm install && npm rebuild --build-from-source google-cloud)
(cd subsubscribeservice && npm install && npm rebuild --build-from-source google-cloud)