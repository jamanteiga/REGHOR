const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU-ANON-KEY-PUBLICA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLA = 'obras';

// Valores por defecto iniciales si localStorage está vacío
const tareasDefecto = ['Revisión de planos', 'Hormigonado', 'Inspección', 'Mediciones'];
const proyectosDefecto = ['Reforma Centro', 'Obra Norte', 'Mantenimiento General'];

let configData = {
  tareas: JSON.parse(localStorage.getItem('cfg_tareas')) || tareasDefecto,
  proyectos: JSON.parse(localStorage.getItem('cfg_proyectos')) || proyectosDefecto
};

let tipoConfigActual = '';

document.addEventListener('DOMContentLoaded', () => {
  establecerFechaHoy();
  poblarSelects();
  cargarTareas();
});

// 8. Establece la fecha del día actual por defecto
function establecerFechaHoy() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  document.getElementById('fecha').value = `${year}-${month}-${day}`;
}

// 2. Alternancia Modo Claro / Oscuro
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('btn-theme').textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
}

// 4 y 5. Rellenar selectores de Tarea y Proyecto
function poblarSelects() {
  const selTarea = document.getElementById('tarea');
  const selProyecto = document.getElementById('proyecto');
  
  selTarea.innerHTML = configData.tareas.map(t => `<option value="${t}">${t}</option>`).join('');
  selProyecto.innerHTML = configData.proyectos.map(p => `<option value="${p}">${p}</option>`).join('');
}

// 6. Funciones de la ventana emergente +config
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

// 7. Acciones Hora Inicio y Hora Fin (Ahora / Copia)
function setHoraActual(inputId) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById(inputId).value = `${hh}:${mm}`;
}

async function copiarHoraFinAnterior() {
  // Consulta el último registro introducido en la base de datos
  const { data, error } = await supabase
    .from(TABLA)
    .select('horafin')
    .order('id', { ascending: false })
    .limit(1);

  if (!error && data && data.length > 0 && data[0].horafin) {
    document.getElementById('horainicio').value = data[0].horafin;
  } else {
    alert('No se encontró ninguna hora fin anterior registrada.');
  }
}

// 3. Menú de Gráficos
function filtrarGrafico(criterio) {
  alert(`Filtrando gráfico por: ${criterio}`);
}

// Cargar tareas desde Supabase
async function cargarTareas() {
  const tablaBody = document.getElementById('tabla-body');
  tablaBody.innerHTML = '<tr><td colspan="10">Cargando datos...</td></tr>';

  const hoyStr = document.getElementById('fecha').value;

  // Intenta consultar los registros del día actual
  let { data: tareas, error } = await supabase
    .from(TABLA)
    .select('*')
    .eq('fecha', hoyStr)
    .order('id', { ascending: false });

  // Si no hay registros hoy, recupera los últimos datos existentes en la base de datos
  if (!error && (!tareas || tareas.length === 0)) {
    const res = await supabase
      .from(TABLA)
      .select('*')
      .order('id', { ascending: false })
      .limit(10);
    tareas = res.data;
    error = res.error;
  }

  if (error || !tareas || tareas.length === 0) {
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

// Guardar Registro
document.getElementById('tarea-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
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

  const { error } = await supabase.from(TABLA).insert([registro]);

  if (error) {
    alert('Error al insertar: ' + error.message);
  } else {
    document.getElementById('comentario').value = '';
    document.getElementById('notas').value = '';
    cargarTareas();
  }
});

async function borrarTarea(id) {
  if (confirm('¿Seguro que deseas eliminar este registro?')) {
    await supabase.from(TABLA).delete().eq('id', id);
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

// 1. Traducciones Idioma
function cambiarIdioma(lang) {
  const t = {
    es: { titulo: 'Registro de Obras y Tareas', fecha: 'Fecha', tarea: 'Tarea', proyecto: 'Proyecto', listado: 'Listado de Tareas' },
    gl: { titulo: 'Rexistro de Obras e Tascas', fecha: 'Data', tarea: 'Tasca', proyecto: 'Proxecto', listado: 'Listaxe de Tascas' }
  }[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('lbl-fecha').textContent = t.fecha;
  document.getElementById('lbl-tarea').textContent = t.tarea;
  document.getElementById('lbl-proyecto').textContent = t.proyecto;
  document.getElementById('txt-listado').textContent = t.listado;
}