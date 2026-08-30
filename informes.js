const SUPABASE_URL = 'https://oppieocootkgddhazikw.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_6_pEKDfVrdKKuewB_qn_cw_fzNXPjT-';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const TABLA = 'obras';

document.addEventListener('DOMContentLoaded', () => {
  cargarInforme();
});

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('btn-theme').textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
}

function cerrarPestana() {
  window.close();
}

async function cargarInforme() {
  if (!supabaseClient) return;

  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  let query = supabaseClient.from(TABLA).select('*').order('fecha', { ascending: false });

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);

  const { data, error } = await query;

  if (error) {
    console.error("Error al cargar datos:", error);
    return;
  }

  const tbody = document.getElementById('tabla-informe-body');
  tbody.innerHTML = '';

  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.fecha || ''}</td>
      <td>${item.tarea || ''}</td>
      <td>${item.proyecto || ''}</td>
      <td>${item.bloque || ''}</td>
      <td>${item.horainicio || ''}</td>
      <td>${item.horafin || ''}</td>
      <td>${calcularDuracion(item.horainicio, item.horafin)}</td>
      <td>${item.comentario || ''}</td>
      <td>${item.notas || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

function calcularDuracion(inicio, fin) {
  if (!inicio || !fin) return '00:00';
  const [hIni, mIni] = inicio.split(':').map(Number);
  const [hFin, mFin] = fin.split(':').map(Number);
  let dif = (hFin * 60 + mFin) - (hIni * 60 + mIni);
  if (dif < 0) dif += 1440;
  const hh = String(Math.floor(dif / 60)).padStart(2, '0');
  const mm = String(dif % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}