/* Chuletada - clave del cajero.
 * En config.js se guarda solo el "hash" de la clave (no la clave). Si CLAVE_HASH está vacío, no se pide clave.
 * Límite: protege la pantalla del cajero, no la base de Firebase (ver README). */
(function () {
  const C = window.CHU_CONFIG || {};
  const H = String(C.CLAVE_HASH || "").trim().toLowerCase();
  const K = "chu_auth";
  const ls = { get: k => { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } },
               set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const Chu = (window.Chu = window.Chu || {});

  async function hash(texto) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("chuletada-clave|" + texto));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  }
  Chu.hashClave = hash;

  if (!H) return; // sin clave configurada: todo funciona como antes

  const autenticado = () => ls.get(K) === H;
  // Si quedó guardado "cajero" de antes pero este dispositivo no ha puesto la clave, se saca de ahí.
  if (ls.get("chu_role") === "c" && !autenticado()) ls.set("chu_role", "");

  function mostrarCaja() {
    let b = document.getElementById("clavebox");
    if (!b) {
      b = document.createElement("div");
      b.id = "clavebox"; b.style.marginTop = "10px";
      b.innerHTML = '<input id="clavein" type="password" placeholder="Clave del cajero" autocomplete="current-password">' +
                    '<button class="btn p full" id="clavego" type="button">Entrar</button><p class="muted" id="clavemsg"></p>';
      document.getElementById("lcash").parentNode.appendChild(b);
      document.getElementById("clavego").onclick = entrar;
      document.getElementById("clavein").onkeydown = e => { if (e.key === "Enter") entrar(); };
    }
    document.getElementById("clavein").focus();
  }
  async function entrar() {
    const inp = document.getElementById("clavein"), msg = document.getElementById("clavemsg");
    msg.textContent = "Verificando…";
    try {
      if ((await hash(inp.value)) === H) {
        ls.set(K, H); inp.value = ""; msg.textContent = "";
        document.getElementById("lcash").click(); // ahora sí deja pasar
      } else { msg.textContent = "Clave incorrecta."; inp.select(); }
    } catch (e) { msg.textContent = "Este navegador no puede verificar la clave. Abre el link con https."; }
  }

  document.addEventListener("click", ev => {
    const t = ev.target && ev.target.closest ? ev.target.closest("#lcash,#swap") : null;
    if (!t) return;
    if (t.id === "swap") { ls.set(K, ""); return; } // al cambiar de usuario hay que volver a poner la clave
    if (autenticado()) return;
    ev.stopPropagation(); ev.preventDefault();
    mostrarCaja();
  }, true);
})();
