import './style.css'
import './fullscreen.css'

type Guest = { name: string; mood: string; color: string; position: string; active?: boolean; player?: boolean }
const guests: Guest[] = [
  { name: 'Brunna', mood: '✦', color: 'coral', position: 'guest-one' },
  { name: 'Milo', mood: '☼', color: 'gold', position: 'guest-two' },
  { name: 'Taro', mood: '…', color: 'blue', position: 'guest-three' },
  { name: 'Sera', mood: '♥', color: 'pink', position: 'guest-four', active: true },
  { name: 'Aren', mood: '✦', color: 'teal', position: 'player-aren', player: true },
]
let coins = 248
let selectedDrink = 'Cerveza de trigo'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<main class="game-shell"><div class="name-screen" id="name-screen"><form class="name-card" id="name-form"><span class="name-symbol">✦</span><span class="eyebrow">NUEVO EN LA SALA</span><h2>¿Cómo te llamas?</h2><p>Elige el nombre que verá la taberna sobre tu personaje.</p><input id="name-input" maxlength="16" autocomplete="nickname" placeholder="Tu nombre" required><button type="submit">Entrar a la taberna <span>↗</span></button></form></div><audio id="tavern-music" src="/towards-the-horizon.mp3" loop></audio><header class="topbar"><div class="brand-lockup"><span class="brand-mark">✦</span><div><strong>LA ÚLTIMA LUZ</strong><small>taberna & chat</small></div></div><div class="top-actions"><span class="live-dot"></span><span class="online-count">37 personas dentro</span><button class="icon-button" aria-label="Ajustes">⚙</button><button class="avatar-button" aria-label="Abrir perfil">D</button></div></header>
<section class="content-grid"><div class="left-column"><div class="section-heading"><div><span class="eyebrow">SALA ABIERTA · #01</span><h1>Donde las historias <em>encuentran mesa.</em></h1></div><button class="quiet-button" id="help-button">?</button></div><div class="tavern-scene"><div class="scene-header"><span>MIÉRCOLES, 21:47</span><span>☾ noche tranquila</span></div><div class="pixel-window"><span class="moon"></span><span class="star">✦</span></div><div class="shelf"><span>◈</span><span>◈</span><span>◈</span><span>◈</span><span>◈</span></div><div class="lantern lantern-left">✦</div><div class="lantern lantern-right">✦</div><div class="bar-counter"><span class="bottle"></span><span class="bottle bottle-two"></span><span class="bottle bottle-three"></span><span class="tap">◒</span></div><div class="bar-keeper"><div class="keeper-hat"></div><div class="keeper-head"></div><div class="keeper-body"></div><span class="keeper-label">TABERNERO</span></div><div class="table table-back"><span class="plate">✦</span></div><div class="table table-front"><span class="plate">✦</span></div>${guests.map((guest) => `<div class="guest ${guest.position} ${guest.active ? 'is-active' : ''} ${guest.player ? 'player-character' : ''}"><span class="guest-mood">${guest.mood}</span><div class="pixel-person ${guest.color}"><i></i><b></b></div><span class="guest-name">${guest.name}</span>${guest.player ? '<div class="player-speech" id="aren-speech"></div>' : ''}</div>`).join('')}<div class="scene-floor"></div></div><div class="room-footer"><span><i class="online-dot"></i> Las conversaciones son públicas</span><span>⟟ modo lento activado</span></div></div>
<aside class="chat-panel"><div class="panel-title"><div><span class="eyebrow">CONVERSACIÓN</span><h2>Lo que se cuenta aquí, queda aquí.</h2></div><button class="dots-button" aria-label="Más opciones">•••</button></div><div class="messages" id="messages"></div><form class="composer" id="chat-form"><textarea id="chat-input" rows="1" placeholder="Habla aquí" maxlength="180"></textarea></form></aside><section class="role-guide"><span>/d hablar</span><span>/g gritar</span><span>/me acción</span><span>/do entorno</span><span>/e situación</span><span>/b fuera de personaje</span></section><section class="music-control"><button id="music-toggle" aria-label="Pausar música">Ⅱ</button><label for="music-volume">♫</label><input id="music-volume" type="range" min="0" max="1" step="0.01" value="0.28" aria-label="Volumen de música"></section></section>
<section class="bottom-grid"><div class="wallet-panel"><div class="panel-title compact"><div><span class="eyebrow">TU BOLSILLO</span><h2>Pequeños gestos, grandes rondas.</h2></div><div class="coin-balance"><span class="coin-icon">◉</span><strong id="coin-value">248</strong><small>monedas</small></div></div><div class="progress-row"><span>Nivel 2 · oyente habitual</span><span>52 / 100 xp</span></div><div class="progress-track"><span></span></div><div class="wallet-note">Hablar y escuchar te da monedas. <a href="#shop">Ver cómo funciona ↗</a></div></div><div class="shop-panel" id="shop"><div class="shop-heading"><div><span class="eyebrow">EL RINCÓN DEL TABERNERO</span><h2>Invita la siguiente.</h2></div></div><div class="shop-items"><button class="shop-item selected" data-item="Cerveza de trigo" data-cost="18"><span class="item-icon">🍺</span><span><strong>Cerveza de trigo</strong><small>18 monedas</small></span></button><button class="shop-item" data-item="Té de luciérnaga" data-cost="12"><span class="item-icon">♨</span><span><strong>Té de luciérnaga</strong><small>12 monedas</small></span></button><button class="shop-item" data-item="Tarta de miel" data-cost="24"><span class="item-icon">✦</span><span><strong>Tarta de miel</strong><small>24 monedas</small></span></button></div><button class="buy-button" id="buy-button">Invitar ${selectedDrink} · 18 <span>↗</span></button></div></section><div class="toast" id="toast" role="status"></div></main>`

const coinValue = document.querySelector('#coin-value')!
const playerSpeech = document.querySelector('#aren-speech')!
const input = document.querySelector<HTMLTextAreaElement>('#chat-input')!
const toast = document.querySelector('#toast')!
const music = document.querySelector<HTMLAudioElement>('#tavern-music')!
const musicToggle = document.querySelector<HTMLButtonElement>('#music-toggle')!
const musicVolume = document.querySelector<HTMLInputElement>('#music-volume')!
music.volume = Number(musicVolume.value)
musicToggle.addEventListener('click', () => { if (music.paused) { music.play(); musicToggle.textContent = 'Ⅱ'; musicToggle.setAttribute('aria-label', 'Pausar música') } else { music.pause(); musicToggle.textContent = '▶'; musicToggle.setAttribute('aria-label', 'Reproducir música') } })
musicVolume.addEventListener('input', () => { music.volume = Number(musicVolume.value) })
function showToast(text: string) { toast.textContent = text; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 2600) }
const nameScreen = document.querySelector<HTMLElement>('#name-screen')!
const nameForm = document.querySelector<HTMLFormElement>('#name-form')!
const nameInput = document.querySelector<HTMLInputElement>('#name-input')!
const playerName = document.querySelector<HTMLElement>('.player-aren .guest-name')!
let currentPlayerName = ''
let socket: WebSocket | null = null
const remotePlayers = new Map<string, HTMLElement>()
const scene = document.querySelector<HTMLElement>('.tavern-scene')!
const escapeHtml = (text: string) => text.replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[char] || char))
function showPlayerMessage(target: HTMLElement, text: string, role: string, duration: string) {
  const speech = target.querySelector<HTMLElement>('.player-speech')
  if (!speech) return
  speech.replaceChildren()
  const message = document.createElement('div')
  const roleClass = ['role-shout', 'role-me', 'role-do', 'role-entorno', 'role-ooc', 'role-say'].includes(role) ? role : 'role-say'
  message.className = `message player-message new-message ${roleClass}`
  const paragraph = document.createElement('p')
  paragraph.innerHTML = escapeHtml(text)
  message.append(paragraph)
  speech.append(message)
  window.setTimeout(() => message.remove(), duration === 'long' ? 9000 : 7200)
}
function addRemotePlayer(player: { id: string; name: string; color: string; x: number; y: number }) {
  if (remotePlayers.has(player.id)) return
  const guest = document.createElement('div')
  guest.className = `guest remote-player ${player.color}`
  guest.dataset.playerId = player.id
  guest.style.left = `${player.x}%`
  guest.style.top = `${player.y}%`
  guest.innerHTML = `<span class="guest-mood">✦</span><div class="pixel-person ${player.color}"><i></i><b></b></div><span class="guest-name"></span><div class="player-speech"></div>`
  guest.querySelector<HTMLElement>('.guest-name')!.textContent = player.name
  scene.append(guest)
  remotePlayers.set(player.id, guest)
}
function connectToRoom() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const endpoint = location.port === '5173' ? `${location.hostname}:3001` : location.host
  socket = new WebSocket(`${protocol}://${endpoint}`)
  socket.addEventListener('open', () => socket?.send(JSON.stringify({ type: 'join', name: currentPlayerName, color: 'teal' })))
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data as string)
    if (message.type === 'snapshot') message.players.forEach(addRemotePlayer)
    if (message.type === 'player-joined') addRemotePlayer(message.player)
    if (message.type === 'player-left') { remotePlayers.get(message.id)?.remove(); remotePlayers.delete(message.id) }
    if (message.type === 'player-moved') { const player = remotePlayers.get(message.id); if (player) { player.style.left = `${message.x}%`; player.style.top = `${message.y}%` } }
    if (message.type === 'chat') { const player = remotePlayers.get(message.id); if (player) showPlayerMessage(player, message.text, message.role, message.duration) }
  })
}
nameForm.addEventListener('submit', (event) => { event.preventDefault(); const name = nameInput.value.trim(); if (!name) return; currentPlayerName = escapeHtml(name); playerName.textContent = currentPlayerName; nameScreen.classList.add('is-hidden'); input.focus(); music.play().catch(() => undefined); connectToRoom() })
document.querySelectorAll<HTMLElement>('.guest').forEach((guest) => {
  let dragging = false
  let offsetX = 0
  let offsetY = 0
  guest.addEventListener('pointerdown', (event) => {
    dragging = true
    guest.setPointerCapture(event.pointerId)
    const guestRect = guest.getBoundingClientRect()
    offsetX = event.clientX - guestRect.left - guestRect.width / 2
    offsetY = event.clientY - guestRect.top
    guest.style.bottom = 'auto'
    guest.style.right = 'auto'
  })
  guest.addEventListener('pointermove', (event) => {
    if (!dragging) return
    const sceneRect = scene.getBoundingClientRect()
    const x = Math.max(24, Math.min(sceneRect.width - 24, event.clientX - sceneRect.left - offsetX))
    const y = Math.max(120, Math.min(sceneRect.height - 82, event.clientY - sceneRect.top - offsetY))
    guest.style.left = `${(x / sceneRect.width) * 100}%`
    guest.style.top = `${y}px`
    guest.style.transform = 'translateX(-50%)'
    if (guest.classList.contains('player-aren') && socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'move', x: (x / sceneRect.width) * 100, y: (y / sceneRect.height) * 100 }))
  })
  guest.addEventListener('pointerup', () => { dragging = false })
})
const composer = document.querySelector<HTMLElement>('.composer')!
let movingComposer = false
let composerOffsetX = 0
let composerOffsetY = 0
composer.addEventListener('pointerdown', (event) => {
  if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLButtonElement) return
  movingComposer = true
  composer.setPointerCapture(event.pointerId)
  const rect = composer.getBoundingClientRect()
  composerOffsetX = event.clientX - rect.left
  composerOffsetY = event.clientY - rect.top
  composer.style.bottom = 'auto'
  composer.style.transform = 'none'
})
composer.addEventListener('pointermove', (event) => {
  if (!movingComposer) return
  const sceneRect = scene.getBoundingClientRect()
  const rect = composer.getBoundingClientRect()
  const x = Math.max(8, Math.min(sceneRect.width - rect.width - 8, event.clientX - sceneRect.left - composerOffsetX))
  const y = Math.max(8, Math.min(sceneRect.height - rect.height - 8, event.clientY - sceneRect.top - composerOffsetY))
  composer.style.left = `${x}px`
  composer.style.top = `${y}px`
})
composer.addEventListener('pointerup', () => { movingComposer = false })
input.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); document.querySelector<HTMLFormElement>('#chat-form')!.requestSubmit() } })
document.querySelector<HTMLFormElement>('#chat-form')!.addEventListener('submit', (event) => { event.preventDefault(); const rawText = input.value.trim(); if (!rawText) return; const commandMatch = rawText.match(/^\/(d|decir|s|g|gritar|shout|me|do|e|entorno|b|ooc)\s+(.+)$/i); const command = commandMatch?.[1].toLowerCase() || 'd'; const body = commandMatch?.[2] || rawText; const safeText = body.replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[char] || char)); const commandClass = command === 'g' || command === 'gritar' || command === 'shout' ? 'role-shout' : command === 'me' ? 'role-me' : command === 'do' ? 'role-do' : command === 'e' || command === 'entorno' ? 'role-entorno' : command === 'b' || command === 'ooc' ? 'role-ooc' : 'role-say'; const prefix = commandClass === 'role-me' ? '✦ ' : commandClass === 'role-do' ? '[entorno] ' : commandClass === 'role-ooc' ? '[fuera de personaje] ' : ''; coins += 8; coinValue.textContent = String(coins); playerSpeech.replaceChildren(); playerSpeech.insertAdjacentHTML('beforeend', `<div class="message player-message new-message ${commandClass}"><p>${prefix}${safeText}</p></div>`); const latestMessage = playerSpeech.lastElementChild; window.setTimeout(() => latestMessage?.remove(), commandClass === 'role-shout' ? 9000 : 7200); if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'chat', text: `${prefix}${body}`, role: commandClass, duration: commandClass === 'role-shout' ? 'long' : 'normal' })); input.value = ''; showToast(commandClass === 'role-shout' ? 'Tu voz alcanza toda la sala' : '+8 monedas · mensaje enviado') })
document.querySelectorAll<HTMLButtonElement>('.shop-item').forEach((item) => item.addEventListener('click', () => { document.querySelector('.shop-item.selected')?.classList.remove('selected'); item.classList.add('selected'); selectedDrink = item.dataset.item || selectedDrink; document.querySelector('#buy-button')!.innerHTML = `Invitar ${selectedDrink} · ${item.dataset.cost} <span>↗</span>` }))
document.querySelector<HTMLButtonElement>('#buy-button')?.addEventListener('click', () => { const selected = document.querySelector<HTMLButtonElement>('.shop-item.selected'); if (!selected) return; const cost = Number(selected.dataset.cost); if (coins < cost) { showToast('Todavía te faltan algunas monedas'); return }; coins -= cost; coinValue.textContent = String(coins); showToast(`${selectedDrink} servido en la mesa · -${cost} monedas`) })
document.querySelector('#help-button')?.addEventListener('click', () => showToast('Habla con calma. Aquí nadie tiene que tener prisa.'))
