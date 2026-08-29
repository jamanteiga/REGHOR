const SUPABASE_URL = 'https://oppieocootkgddhazikw.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_6_pEKDfVrdKKuewB_qn_cw_fzNXPjT-';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const TABLA = 'obras';
const PROYECTOS_DEFAULT = [
  "ABAC", "BAC2", "BLOR", "COM", "DES", "FOR", "INFO", "INT", "MAN", "NAV", "PROG", "VAC"
];

document.addEventListener('DOMContentLoaded', () => {
  poblarProyectos();
  evaluarParametrosURL();
});

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('btn-theme').textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
}

function poblarProyectos() {
  const select = document.getElementById('filtro-proyecto');
  const proys = JSON.parse(localStorage.getItem('cfg_proyectos')) || PROYECTOS_DEFAULT;
  proys.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });
}

function evaluarParametrosURL() {
  const params = new URLSearchParams(window.location.search);
  const tipo = params.get('tipo');

  if (tipo) {
    if (['dia', 'semana', 'mes', 'trimestre'].includes(tipo)) {
      document.getElementById('filtro-periodo').value = tipo;
      aplicarPeriodoRapido(tipo);
    } else {
      ejecutarFiltro();
    }
  } else {
    ejecutarFiltro();
  }
}

function aplicarPeriodoRapido(tipo) {
  const hoy = new Date();
  let desde = new Date();
  let hasta = new Date();

  if (tipo === 'dia') {
    // Mantener 'desde' y 'hasta' en la fecha actual
  } else if (tipo === 'semana') {
    const day = hoy.getDay() || 7;
    desde.setDate(hoy.getDate() - day + 1);
  } else if (tipo === 'mes') {
    desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  } else if (tipo === 'trimestre') {
    const quarterMonth = Math.floor(hoy.getMonth() / 3) * 3;
    desde = new Date(hoy.getFullYear(), quarterMonth, 1);
    hasta = new Date(hoy.getFullYear(), quarterMonth + 3, 0);
  }

  if (tipo) {
    document.getElementById('filtro-desde').value = desde.toISOString().split('T')[0];
    document.getElementById('filtro-hasta').value = hasta.toISOString().split('T')[0];
  }

  ejecutarFiltro();
}

async function ejecutarFiltro() {
  if (!supabaseClient) return;

  const proyecto = document.getElementById('filtro-proyecto').value;
  const bloque = document.getElementById('filtro-bloque').value.trim();
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  let query = supabaseClient.from(TABLA).select('*');

  if (proyecto) query = query.eq('proyecto', proyecto);
  if (bloque) query = query.ilike('bloque', `%${bloque}%`);
  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);

  const { data, error } = await query.order('fecha', { ascending: false });

  const body = document.getElementById('tabla-body-filtros');
  if (error || !data || data.length === 0) {
    body.innerHTML = '<tr><td colspan="9">No se encontraron registros para los filtros seleccionados.</td></tr>';
    document.getElementById('total-duracion-filtro').textContent = '00:00';
    return;
  }

  let totalMinutos = 0;
  body.innerHTML = data.map(item => {
    const mins = obtenerMinutosDuracion(item.horainicio, item.horafin);
    totalMinutos += mins;
    let rawF = String(item.fecha || '').trim();
    let fDisplay = rawF.includes('T') ? rawF.split('T')[0] : rawF.split(' ')[0];

    return `
      <tr>
        <td>${fDisplay}</td>
        <td>${item.tarea || ''}</td>
        <td>${item.proyecto || ''}</td>
        <td>${item.bloque || ''}</td>
        <td>${item.horainicio || ''}</td>
        <td>${item.horafin || ''}</td>
        <td><strong>${formatearMinutos(mins)}</strong></td>
        <td>${item.comentario || ''}</td>
        <td>${item.notas || ''}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('total-duracion-filtro').textContent = formatearMinutos(totalMinutos);
}

function obtenerMinutosDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 0;
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  let dif = (hFin * 60 + mFin) - (hIni * 60 + mIni);
  return dif < 0 ? dif + 1440 : dif;
}

function formatearMinutos(totalMinutos) {
  const hh = String(Math.floor(totalMinutos / 60)).padStart(2, '0');
  const mm = String(totalMinutos % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}