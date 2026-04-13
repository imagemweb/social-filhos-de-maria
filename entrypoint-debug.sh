#!/bin/sh
LOG=/tmp/app.log

# Start next in background, capture all output
./node_modules/.bin/next start -H 0.0.0.0 > $LOG 2>&1 &
NEXT_PID=$!

# Give next 5 seconds to either start or fail
sleep 5

# Serve the log on port 3000 via node
node -e "
const fs = require('fs');
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
  try {
    res.end(fs.readFileSync('/tmp/app.log', 'utf8') || 'Empty log');
  } catch(e) { res.end('Error: ' + e.message); }
}).listen(3000, '0.0.0.0', () => {});
" &

# Wait for next to exit (if it crashed)
wait $NEXT_PID
echo "EXIT CODE: $?" >> $LOG

# Keep container alive so we can read the log
sleep 600
