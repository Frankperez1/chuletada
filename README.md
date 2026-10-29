# Chuletada – control de tarjetas y caja (web)

Página estática para GitHub Pages. Todos los archivos están en la raíz del repositorio.
Guarda en el celular y sincroniza con Firebase Realtime Database cuando hay internet;
sin internet queda en cola y se envía sola al volver la conexión.

- `index.html` la página · `app.js` dibuja la pantalla · `api-local.js` lógica en el navegador
- `sync.js` sincronización con Firebase · `config.js` URL de Firebase · `styles.css` diseño
- `sw.js` guarda la página para abrirla sin internet (si cambias archivos, sube el número `V`)
- `firebase-rules.json` reglas para pegar en Firebase
