# Publicar La Ultima Luz

El servidor esta preparado para alojarse fuera de tu red. Tus amigos entraran a una URL publica y tu ordenador no recibira conexiones.

## Opcion sencilla: Render

1. Crea un repositorio privado o publico en GitHub y sube este proyecto.
2. Entra en [render.com](https://render.com), crea una cuenta y elige **New > Web Service**.
3. Conecta el repositorio de la taberna.
4. Usa estos valores:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Environment:** `Node`
5. Pulsa **Deploy**.
6. Render te dara una URL `https://...onrender.com`. Esa es la URL que compartes.

El servidor sirve el juego y WebSocket desde el mismo dominio, por lo que en produccion usa automaticamente `wss://` y no necesita abrir el puerto 3001.

## Prueba local

```bash
npm run dev:multiplayer
```

Esto inicia Vite para desarrollo y el servidor WebSocket local. Para probar el modo produccion:

```bash
npm run build
npm run start
```

## Limitaciones actuales

La sala publica guarda jugadores en memoria. Si el servicio se reinicia, todos vuelven a entrar desde cero. El plan gratuito de algunos hosts puede dormir cuando no hay actividad. El siguiente paso seria añadir persistencia, moderacion, limite de mensajes y autenticacion antes de abrirlo a mucha gente.
