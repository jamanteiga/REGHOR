const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU-ANON-KEY-PUBLICA';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
const TABLA = 'obras';

const tareasDefecto = ['Revisión de planos', 'Hormigonado', 'Inspección', 'Mediciones'];
const proyectosDefecto = ['Reforma Centro', 'Obra Norte', 'Mantenimiento General'];

let configData = {
  tareas: JSON.parse(localStorage.getItem('cfg_tareas')) || tareasDefecto,
  proyectos: JSON.parse(localStorage.getItem('cfg_proyectos')) || proyectosDefecto
};

let tipoConfigActual = '';
let idiomaActual = 'es';

document.addEventListener('DOMContentLoaded', () => {
  establecerFechaHoy();
  poblarSelects();
  
  if (supabaseClient) {
    cargarTareas();
  }
});

function establecerFechaHoy() {
  const inputFecha = document.getElementById('fecha');
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  inputFecha.value = `${year}-${month}-${day}`;
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('btn-theme').textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
}

// Rellenar selects y ordenar Tareas alfabéticamente
function poblarSelects() {
  const selTarea = document.getElementById('tarea');
  const selProyecto = document.getElementById('proyecto');
  
  // Ordenar alfabéticamente la lista de tareas
  configData.tareas.sort((a, b) => a.localeCompare(b, idiomaActual, { sensitivity: 'base' }));

  if (selTarea) {
    selTarea.innerHTML = configData.tareas.map(t => `<option value="${t}">${t}</option>`).join('');
    sincronizarComentario(); // Copiar la primera tarea en el comentario por defecto
  }
  if (selProyecto) {
    selProyecto.innerHTML = configData.proyectos.map(p => `<option value="${p}">${p}</option>`).join('');
  }
}

// Copia automáticamente el texto de Tarea a Comentario
function sincronizarComentario() {
  const selTarea = document.getElementById('tarea');
  const inputComentario = document.getElementById('comentario');
  if (selTarea && inputComentario) {
    inputComentario.value = selTarea.value;
  }
}

function abrirConfig(tipo) {
  tipoConfigActual = tipo;
  document.getElementById('modal-titulo').textContent = `Configurar ${tipo}`;
  renderListaConfig();
  document.getElementById('modal-config').style.display = 'flex';
}

function cerrarConfig() {
  document.getElementById('modal-config').style.display = 'none';
}

function renderListaConfig() {
  const ul = document.getElementById('lista-config');
  ul.innerHTML = configData[tipoConfigActual].map((item, idx) => `
    <li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
      <span>${item}</span>
      <button type="button" class="btn-mini" onclick="eliminarOpcionConfig(${idx})">🗑️</button>
    </li>
  `).join('');
}

function agregarOpcionConfig() {
  const input = document.getElementById('nuevo-valor-config');
  const val = input.value.trim();
  if (val) {
    configData[tipoConfigActual].push(val);
    localStorage.setItem(`cfg_${tipoConfigActual}`, JSON.stringify(configData[tipoConfigActual]));
    input.value = '';
    renderListaConfig();
    poblarSelects();
  }
}

function eliminarOpcionConfig(idx) {
  configData[tipoConfigActual].splice(idx, 1);
  localStorage.setItem(`cfg_${tipoConfigActual}`, JSON.stringify(configData[tipoConfigActual]));
  renderListaConfig();
  poblarSelects();
}

function setHoraActual(inputId) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById(inputId).value = `${hh}:${mm}`;
}

async function copiarHoraFinAnterior() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from(TABLA)
    .select('horafin')
    .order('id', { ascending: false })
    .limit(1);

  if (!error && data && data.length > 0 && data[0].horafin) {
    document.getElementById('horainicio').value = data[0].horafin;
  } else {
    alert('No se encontró ninguna hora fin registrada.');
  }
}

function filtrarGrafico(criterio) {
  alert(`Criterio de visualización seleccionado: ${criterio}`);
}

async function cargarTareas() {
  const tablaBody = document.getElementById('tabla-body');
  tablaBody.innerHTML = '<tr><td colspan="10">Cargando datos...</td></tr>';
  const hoyStr = document.getElementById('fecha').value;

  let { data: tareas, error } = await supabaseClient
    .from(TABLA)
    .select('*')
    .eq('fecha', hoyStr)
    .order('id', { ascending: false });

  if (!error && (!tareas || tareas.length === 0)) {
    const res = await supabaseClient
      .from(TABLA)
      .select('*')
      .order('id', { ascending: false })
      .limit(15);
    tareas = res.data;
    error = res.error;
  }

  if (error) {
    tablaBody.innerHTML = `<tr><td colspan="10">Error de conexión: ${error.message}</td></tr>`;
    return;
  }

  if (!tareas || tareas.length === 0) {
    tablaBody.innerHTML = '<tr><td colspan="10">No existen registros guardados.</td></tr>';
    return;
  }

  tablaBody.innerHTML = tareas.map(item => `
    <tr>
      <td>${item.fecha || ''}</td>
      <td>${item.tarea || ''}</td>
      <td>${item.proyecto || ''}</td>
      <td>${item.bloque || ''}</td>
      <td>${item.horainicio || ''}</td>
      <td>${item.horafin || ''}</td>
      <td><strong>${calcularDuracion(item.horainicio, item.horafin)}</strong></td>
      <td>${item.comentario || ''}</td>
      <td>${item.notas || ''}</td>
      <td>
        <button class="btn-mini" onclick="borrarTarea(${item.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('tarea-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabaseClient) return;

  const registro = {
    fecha: document.getElementById('fecha').value,
    tarea: document.getElementById('tarea').value,
    proyecto: document.getElementById('proyecto').value,
    bloque: document.getElementById('bloque').value,
    horainicio: document.getElementById('horainicio').value,
    horafin: document.getElementById('horafin').value,
    comentario: document.getElementById('comentario').value,
    notas: document.getElementById('notas').value
  };

  const { error } = await supabaseClient.from(TABLA).insert([registro]);

  if (error) {
    alert('Error al insertar: ' + error.message);
  } else {
    document.getElementById('notas').value = '';
    sincronizarComentario();
    cargarTareas();
  }
});

async function borrarTarea(id) {
  if (confirm('¿Eliminar este registro?')) {
    await supabaseClient.from(TABLA).delete().eq('id', id);
    cargarTareas();
  }
}

function calcularDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return "00:00";
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  let dif = (hFin * 60 + mFin) - (hIni * 60 + mIni);
  if (dif < 0) dif += 1440;
  return `${String(Math.floor(dif / 60)).padStart(2, '0')}:${String(dif % 60).padStart(2, '0')}`;
}

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = {
    es: { titulo: 'Registro de Obras y Tareas', fecha: 'Fecha', tarea: 'Tarea', proyecto: 'Proyecto', listado: 'Listado de Tareas', graficos: '📊 Gráficos ▾', guardar: 'Guardar' },
    gl: { titulo: 'Rexistro de Obras e Tarefas', fecha: 'Data', tarea: 'Tarefa', proyecto: 'Proxecto', listado: 'Listaxe de Tarefas', graficos: '📊 Gráficos ▾', guardar: 'Gardar' }
  }[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('lbl-fecha').textContent = t.fecha;
  document.getElementById('lbl-tarea').textContent = t.tarea;
  document.getElementById('lbl-proyecto').textContent = t.proyecto;
  document.getElementById('txt-listado').textContent = t.listado;
  document.getElementById('btn-graficos').textContent = t.graficos;
  document.getElementById('btn-guardar').textContent = t.guardar;

  document.getElementById('th-fecha').textContent = t.fecha;
  document.getElementById('th-tarea').textContent = t.tarea;
  document.getElementById('th-proyecto').textContent = t.proyecto;

  poblarSelects(); // Reordenar alfabéticamente según las normas del idioma seleccionado
}