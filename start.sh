# /usr/bin/sh

cwd=$(pwd)

(cd frontend && pm2 start $cwd/frontend/index.js --name="frontend")
(cd subsendservice && pm2 start $cwd/subsendservice/index.js --name="subsend")
(cd subsubscribeservice && pm2 start $cwd/subsubscribeservice/index.js --name="subsubscribe")

sudo pm2 startup