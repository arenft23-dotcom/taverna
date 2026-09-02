import { WebSocketServer } from 'ws'
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const port = Number(process.env.PORT || process.env.WS_PORT || 3001)
const players = new Map()
const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' }
const distRoot = join(process.cwd(), 'dist')
const httpServer = createServer((request, response) => {
  const requestedPath = request.url?.split('?')[0] || '/'
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.replace(/^\/+/, '')
  const filePath = normalize(join(distRoot, relativePath))
  const safePath = filePath.startsWith(distRoot) && existsSync(filePath) && statSync(filePath).isFile() ? filePath : join(distRoot, 'index.html')
  response.writeHead(200, { 'Content-Type': mimeTypes[extname(safePath)] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
  createReadStream(safePath).pipe(response)
})
const wss = new WebSocketServer({ server: httpServer })

function send(socket, payload) {
  if (socket.readyState === 1) socket.send(JSON.stringify(payload))
}

function broadcast(payload, except) {
  for (const socket of wss.clients) {
    if (socket !== except) send(socket, payload)
  }
}

wss.on('connection', (socket) => {
  const id = randomUUID()
  socket.playerId = id
  send(socket, { type: 'snapshot', players: [...players.values()] })

  socket.on('message', (raw) => {
    let event
    try {
      event = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (event.type === 'join' && typeof event.name === 'string') {
      const player = {
        id,
        name: event.name.slice(0, 16),
        color: typeof event.color === 'string' ? event.color : 'teal',
        x: 50,
        y: 58,
      }
      players.set(id, player)
      socket.player = player
      broadcast({ type: 'player-joined', player }, socket)
      return
    }

    if (!socket.player) return

    if (event.type === 'move' && Number.isFinite(event.x) && Number.isFinite(event.y)) {
      socket.player.x = Math.max(4, Math.min(96, event.x))
      socket.player.y = Math.max(18, Math.min(84, event.y))
      broadcast({ type: 'player-moved', id, x: socket.player.x, y: socket.player.y }, socket)
      return
    }

    if (event.type === 'chat' && typeof event.text === 'string') {
      broadcast({
        type: 'chat',
        id,
        name: socket.player.name,
        text: event.text.slice(0, 180),
        role: typeof event.role === 'string' ? event.role : 'say',
        duration: event.duration === 'long' ? 'long' : 'normal',
      }, socket)
    }
  })

  socket.on('close', () => {
    if (!socket.player) return
    players.delete(id)
    broadcast({ type: 'player-left', id })
  })
})

httpServer.listen(port, '0.0.0.0', () => console.log(`La Última Luz multiplayer server listening on port ${port}`))
