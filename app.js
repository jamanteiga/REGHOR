// PEGA AQUÍ LA URL Y LA ANON KEY DE TU SUPABASE
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co'; 
const SUPABASE_KEY = 'TU-ANON-KEY-PUBLICA';

let supabaseClient = null;

if (window.supabase && !SUPABASE_URL.includes('TU-PROYECTO')) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const TABLA = 'obras';

let configData = {
  tareas: JSON.parse(localStorage.getItem('cfg_tareas')) || [],
  proyectos: JSON.parse(localStorage.getItem('cfg_proyectos')) || []
};

let tipoConfigActual = '';
let idiomaActual = 'es';

document.addEventListener('DOMContentLoaded', () => {
  establecerFechaHoy();
  poblarSelects();
  
  if (supabaseClient) {
    cargarTareas();
  } else {
    document.getElementById('tabla-body').innerHTML = '<tr><td colspan="10" style="color:red;">⚠️ Falta configurar la URL y la Anon Key de Supabase en app.js</td></tr>';
  }
});

window.addEventListener('click', (e) => {
  if (!e.target.matches('#btn-graficos')) {
    const dropdown = document.getElementById('dropdown-graficos-container');
    if (dropdown && dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  }
});

function toggleDropdownGraficos(e) {
  e.stopPropagation();
  document.getElementById('dropdown-graficos-container').classList.toggle('show');
}

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

function poblarSelects() {
  const selTarea = document.getElementById('tarea');
  const selProyecto = document.getElementById('proyecto');
  
  configData.tareas.sort((a, b) => a.localeCompare(b, idiomaActual, { sensitivity: 'base' }));

  if (selTarea) {
    selTarea.innerHTML = configData.tareas.length > 0 
      ? configData.tareas.map(t => `<option value="${t}">${t}</option>`).join('')
      : '<option value="">-- Añade tareas con +config --</option>';
    sincronizarComentario();
  }
  if (selProyecto) {
    selProyecto.innerHTML = configData.proyectos.length > 0
      ? configData.proyectos.map(p => `<option value="${p}">${p}</option>`).join('')
      : '<option value="">-- Añade proyectos con +config --</option>';
  }
}

function sincronizarComentario() {
  const selTarea = document.getElementById('tarea');
  const inputComentario = document.getElementById('comentario');
  if (selTarea && inputComentario && selTarea.value && !selTarea.value.includes('--')) {
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
  if (!supabaseClient) {
    alert("Supabase no está configurado.");
    return;
  }
  try {
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
  } catch(e) {
    alert("Error de conexión al consultar Supabase.");
  }
}

function filtrarGrafico(criterio) {
  alert(`Criterio de visualización seleccionado: ${criterio}`);
  document.getElementById('dropdown-graficos-container').classList.remove('show');
}

async function cargarTareas() {
  const tablaBody = document.getElementById('tabla-body');
  tablaBody.innerHTML = '<tr><td colspan="10">Cargando datos...</td></tr>';
  const hoyStr = document.getElementById('fecha').value;

  try {
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
  } catch(err) {
    tablaBody.innerHTML = `<tr><td colspan="10">Error de red (Failed to fetch). Revisa tus datos de Supabase.</td></tr>`;
  }
}

document.getElementById('tarea-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!supabaseClient) {
    alert('Introduce primero la URL y la Anon Key válidas en app.js para poder guardar.');
    return;
  }

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

  try {
    const { error } = await supabaseClient.from(TABLA).insert([registro]);

    if (error) {
      alert('Error de Supabase: ' + error.message);
    } else {
      document.getElementById('notas').value = '';
      sincronizarComentario();
      cargarTareas();
    }
  } catch (err) {
    alert('Error al conectar con Supabase. Revisa las credenciales en app.js.');
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

  poblarSelects();
}