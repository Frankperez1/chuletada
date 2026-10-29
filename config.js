// Configuración de la Chuletada.
// Pega aquí la URL de tu Realtime Database de Firebase (sin "/" al final).
// Si la dejas vacía, la página funciona igual pero SOLO guarda en cada dispositivo.
window.CHU_CONFIG = {
  FIREBASE_URL: "https://chuletada-4ff4b-default-rtdb.firebaseio.com",// ej: "https://chuletada-12345-default-rtdb.firebaseio.com"
  RAIZ: "chuletada",         // nodo dentro de la base (puedes usar otro nombre por cada evento)
  CADA_SEG: 10               // cada cuántos segundos sincroniza (solo si la pantalla está visible)
};
