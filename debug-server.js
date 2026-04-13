const { spawn } = require('child_process')
const { createServer } = require('http')
const { appendFileSync, readFileSync } = require('fs')

const LOG = '/tmp/next.log'
const log = (s) => { appendFileSync(LOG, s + '\n'); console.log(s) }

log('=== debug-server starting ===')
log('NODE_ENV=' + process.env.NODE_ENV)
log('DATABASE_URL=' + (process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@') : 'NOT SET'))
log('JWT_SECRET=' + (process.env.JWT_SECRET ? 'SET' : 'NOT SET'))

// Start next start as child process
const next = spawn('./node_modules/.bin/next', ['start', '-H', '0.0.0.0'], {
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe']
})

next.stdout.on('data', d => log('[next stdout] ' + d.toString().trim()))
next.stderr.on('data', d => log('[next stderr] ' + d.toString().trim()))
next.on('exit', (code, sig) => log('[next EXIT] code=' + code + ' signal=' + sig))
next.on('error', e => log('[next ERROR] ' + e.message))

// Serve the log on port 3000 regardless of what next does
createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
  try { res.end(readFileSync(LOG, 'utf8')) }
  catch (e) { res.end('No log yet: ' + e.message) }
}).listen(3000, '0.0.0.0', () => log('Log server listening on :3000'))
