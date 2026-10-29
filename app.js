// Solo dibuja y llama a la API de app.py. Las reglas (estados, totales, importación) están en Python.
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = (n) => 'S/ ' + Number(n || 0).toFixed(2);
const ls = { get: (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
let role = ls.get('chu_role'), me = ls.get('chu_me'), tab = 's', filtro = 'todas', wipe = false, timer = null;

async function api(path, body) {
  const r = await fetch(path, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
}
const typing = () => document.activeElement && document.activeElement.matches('.row input,td input');
const debounce = (fn, ms = 400) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

async function stats() {
  const s = await api('/api/stats' + (role === 's' ? '?seller=' + encodeURIComponent(me) : ''));
  $('stats').innerHTML = `<div>Tarjetas<b>${s.tarjetas}</b></div><div class="g">Pagadas<b>${s.pagadas}</b></div>` +
    `<div class="r">Entregadas sin pagar<b>${s.entregadas_sin_pagar}</b></div><div class="g">Cobrado<b>${money(s.cobrado)}</b></div>`;
}
const rowCash = (f) => `<div class="row ${f.estado}"><span class="n">#${f.n}</span><span class="i">${f.name ? 'Entregada a ' + esc(f.name) : '<i>Sin entregar</i>'}<small>Vendedor: ${esc(f.seller) || '—'}</small></span>` +
  `<span class="badge ${f.estado}">${f.paid ? 'PAGADO' : 'NO PAGADO'}</span><button class="btn" data-tg="${f.n}" data-paid="${f.paid ? 0 : 1}">${f.paid ? 'Anular' : 'Marcar pagado'}</button></div>`;

async function rSeller() {
  const d = await api(`/api/cards?seller=${encodeURIComponent(me)}&limit=500&q=${encodeURIComponent($('sq').value)}`);
  $('sl').innerHTML = d.cards.map((f) => `<div class="row ${f.estado}"><span class="n">#${f.n}</span>` +
    `<input type="text" data-nm="${f.n}" value="${esc(f.name)}" placeholder="Entregada a…">` +
    `<button class="btn ${f.paid ? 'ok' : ''}" data-tg="${f.n}" data-paid="${f.paid ? 0 : 1}">${f.paid ? '✔ Pagó' : 'No pagó'}</button></div>`).join('') || '<p class="muted">Sin resultados.</p>';
}
async function rCash() {
  if (tab === 's') {
    $('chips').innerHTML = [['todas', 'Todas'], ['pagadas', 'Pagadas'], ['no_pagadas', 'No pagadas'], ['entregadas_sin_pagar', 'Entregadas sin pagar'], ['sin_entregar', 'Sin entregar']]
      .map(([k, l]) => `<button class="btn ${filtro === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('');
    const d = await api(`/api/cards?q=${encodeURIComponent($('q').value)}&filtro=${filtro}`);
    $('res').innerHTML = d.cards.map(rowCash).join('') + (d.total > 50 ? `<p class="muted">Mostrando 50 de ${d.total}. Escribe más para afinar.</p>` : '') || '<p class="muted">Sin resultados.</p>';
  }
  if (tab === 'v' && !typing()) {
    const d = await api('/api/resumen');
    $('vt').innerHTML = '<tr><th>Vendedor</th><th>Desde</th><th>Hasta</th><th>Pagó</th><th>Sin pagar</th><th>Reporte</th></tr>' + d.filas.map((s, i) =>
      `<tr data-i="${i}"><td><input type="text" data-k="name" value="${esc(s.name)}"></td><td><input class="sm" type="number" data-k="from_n" value="${s.from_n}"></td>` +
      `<td><input class="sm" type="number" data-k="to_n" value="${s.to_n}"></td><td style="color:var(--ok)"><b>${s.pagadas}</b></td><td style="color:var(--no)"><b>${s.sin_pagar}</b></td><td>${s.reporte ? '✔' : '<span class="muted">sin datos</span>'}</td></tr>`).join('');
  }
  if (tab === 'i' && !typing()) $('pr').value = (await api('/api/sellers')).price;
}
async function render() {
  $('login').classList.toggle('hide', !!role);
  $('app').classList.toggle('hide', !role);
  $('swap').classList.toggle('hide', !role);
  clearInterval(timer);
  if (!role) return;
  $('v-seller').classList.toggle('hide', role !== 's');
  $('v-cash').classList.toggle('hide', role !== 'c');
  if (role === 's') $('sdl').href = '/api/export?seller=' + encodeURIComponent(me);
  const go = async () => { try { await stats(); if (role === 's') { if (!typing()) await rSeller(); } else await rCash(); } catch (e) { $('foot').textContent = 'Error: ' + e.message; } };
  await go();
  timer = setInterval(() => { if (!typing() && document.visibilityState === 'visible') go(); }, 5000); // se refresca solo
}
async function setPaid(n, paid) { await api('/api/card', { n, paid: !!paid }); render(); }

(async () => {
  const d = await api('/api/sellers');
  $('lsel').innerHTML = d.sellers.map((s) => `<option value="${esc(s.name)}">${esc(s.name)} (${s.from_n}–${s.to_n})</option>`).join('');
  render();
})();
$('lseller').onclick = () => { role = 's'; me = $('lsel').value; ls.set('chu_role', role); ls.set('chu_me', me); render(); };
$('lcash').onclick = () => { role = 'c'; ls.set('chu_role', role); render(); };
$('swap').onclick = () => { role = ''; ls.set('chu_role', ''); render(); };
document.querySelector('.tabs').onclick = (e) => {
  const t = e.target.dataset.t; if (!t) return; tab = t;
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
  ['s', 'v', 'i'].forEach((x) => $('c-' + x).classList.toggle('hide', x !== t)); render();
};
document.body.onclick = (e) => {
  const d = e.target.dataset;
  if (d.tg) setPaid(+d.tg, +d.paid);
  if (d.f) { filtro = d.f; render(); }
};
const saveName = debounce(async (n, name) => { await api('/api/card', { n, name }); stats(); });
const saveSellers = debounce(async () => {
  const rows = [...document.querySelectorAll('#vt tr[data-i]')].map((tr) => ({ name: tr.querySelector('[data-k=name]').value, from_n: +tr.querySelector('[data-k=from_n]').value, to_n: +tr.querySelector('[data-k=to_n]').value }));
  await api('/api/sellers', { sellers: rows });
});
document.body.oninput = (e) => {
  const t = e.target;
  if (t.dataset.nm) saveName(+t.dataset.nm, t.value);
  if (t.id === 'sq') rSeller(); if (t.id === 'q') rCash();
  if (t.closest('#vt')) saveSellers();
  if (t.id === 'pr') api('/api/price', { price: +t.value || 0 });
};
$('scopy').onclick = async () => {
  const txt = await (await fetch('/api/export?texto=1&seller=' + encodeURIComponent(me))).text();
  $('sta').value = txt; $('sta').classList.remove('hide'); $('sta').select();
  let ok = false; try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) { try { ok = document.execCommand('copy'); } catch (e2) {} }
  $('smsg').textContent = ok ? 'Copiado ✔ Pégalo en WhatsApp.' : 'Selecciona el texto y cópialo.';
};
$('bimp').onclick = async () => {
  let text = $('ita').value;
  for (const f of $('ifile').files) text += '\n' + await f.text();
  try { const r = await api('/api/import', { text }); $('imsg').textContent = r.respaldos ? `✔ ${r.respaldos} respaldo(s): ` + r.detalle.map((x) => `${x.de} (${x.actualizadas})`).join(', ') + (r.no_validos ? ` · ${r.no_validos} no válido(s)` : '') : 'No se encontró ningún respaldo válido.'; $('ita').value = ''; $('ifile').value = ''; render(); }
  catch (e) { $('imsg').textContent = e.message; }
};
$('bwipe').onclick = async () => {
  if (!wipe) { wipe = true; $('bwipe').textContent = '¿Seguro? Pulsa otra vez'; return; }
  await api('/api/reset', {}); wipe = false; $('bwipe').textContent = 'Borrar todo lo registrado'; render();
};
