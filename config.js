// Configuración de la Chuletada.
window.CHU_CONFIG = {
  FIREBASE_URL: "https://chuletada-4ff4b-default-rtdb.firebaseio.com",
  RAIZ: "chuletada",   // nodo dentro de la base (usa otro nombre por cada evento para no mezclar datos)
  CADA_SEG: 10,        // cada cuántos segundos sincroniza (solo si la pantalla está visible)
  CLAVE_HASH: ""       // código de la clave del cajero (se genera en clave.html). Vacío = sin clave.
};
