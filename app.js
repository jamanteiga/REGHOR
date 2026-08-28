const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU-ANON-KEY-PUBLICA';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLA = 'obras';

// Listas de configuración (Persistidas en localStorage)
let configData = {
  tareas: JSON.parse(localStorage.getItem('cfg_tareas')) || ['Revisión de planos', 'Hormigonado', 'Inspección'],
  proyectos: JSON.parse(localStorage.getItem('cfg_proyectos')) || ['Reforma Centro', 'Obra Norte', 'Mantenimiento']
};

let tipoConfigActual = '';
let idiomaActual = 'es';

const traducciones = {
  es: {
    titulo: 'Registro de Obras y Tareas',
    graficos: 'Visualización / Gráficos',
    agrupar: 'Agrupar por:',
    fecha: 'Fecha', tarea: 'Tarea', proyecto: 'Proyecto', bloque: 'Bloque',
    horainicio: 'Hora Inicio', horafin: 'Hora Fin', comentario: 'Comentario', notas: 'Notas',
    guardar: 'Guardar Tarea', listado: 'Listado de Tareas', acciones: 'Acciones', duracion: 'Duración'
  },
  gl: {
    titulo: 'Rexistro de Obras e Tascas',
    graficos: 'Visualización / Gráficos',
    agrupar: 'Agrupar por:',
    fecha: 'Data', tarea: 'Tasca', proyecto: 'Proxecto', bloque: 'Bloque',
    horainicio: 'Hora Inicio', horafin: 'Hora Fin', comentario: 'Comentario', notas: 'Notas',
    guardar: 'Gardar Tasca', listado: 'Listaxe de Tascas', acciones: 'Accións', duracion: 'Duración'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // 8. Fecha por defecto en el día actual (YYYY-MM-DD)
  document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
  
  poblarSelects();
  cargarTareas();
});

// 1. Idioma
function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = traducciones[lang];
  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('txt-graficos').textContent = t.graficos;
  document.getElementById('lbl-agrupar').textContent = t.agrupar;
  document.getElementById('lbl-fecha').textContent = t.fecha;
  document.getElementById('lbl-tarea').textContent = t.tarea;
  document.getElementById('lbl-proyecto').textContent = t.proyecto;
  document.getElementById('lbl-bloque').textContent = t.bloque;
  document.getElementById('lbl-horainicio').textContent = t.horainicio;
  document.getElementById('lbl-horafin').textContent = t.horafin;
  document.getElementById('lbl-comentario').textContent = t.comentario;
  document.getElementById('lbl-notas').textContent = t.notas;
  document.getElementById('btn-guardar').textContent = t.guardar;
  document.getElementById('txt-listado').textContent = t.listado;
  
  document.getElementById('th-fecha').textContent = t.fecha;
  document.getElementById('th-tarea').textContent = t.tarea;
  document.getElementById('th-proyecto').textContent = t.proyecto;
  document.getElementById('th-bloque').textContent = t.bloque;
  document.getElementById('th-inicio').textContent = 'Inicio';
  document.getElementById('th-fin').textContent = 'Fin';
  document.getElementById('th-duracion').textContent = t.duracion;
  document.getElementById('th-comentario').textContent = t.comentario;
  document.getElementById('th-notas').textContent = t.notas;
  document.getElementById('th-acciones').textContent = t.acciones;
}

// 2. Modo Claro / Oscuro
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('btn-theme').textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
}

// 4 y 5. Llenar Selects desde configuración
function poblarSelects() {
  const selTarea = document.getElementById('tarea');
  const selProyecto = document.getElementById('proyecto');
  
  selTarea.innerHTML = configData.tareas.map(t => `<option value="${t}">${t}</option>`).join('');
  selProyecto.innerHTML = configData.proyectos.map(p => `<option value="${p}">${p}</option>`).join('');
}

// 6. Ventana emergente Modal +config
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
    <li style="display:flex; justify-content:space-between; margin-bottom:5px;">
      <span>${item}</span>
      <button type="button" onclick="eliminarOpcionConfig(${idx})">🗑️</button>
    </li>
  `).join('');
}

function agregarOpcionConfig() {
  const val = document.getElementById('nuevo-valor-config').value.trim();
  if (val) {
    configData[tipoConfigActual].push(val);
    localStorage.setItem(`cfg_${tipoConfigActual}`, JSON.stringify(configData[tipoConfigActual]));
    document.getElementById('nuevo-valor-config').value = '';
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

// 7. Botones "Ahora" y "Copia"
function setHoraActual(inputId) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById(inputId).value = `${hh}:${mm}`;
}

async function copiarHoraFinAnterior() {
  const { data } = await supabase.from(TABLA).select('horafin').order('id', { ascending: false }).limit(1);
  if (data && data.length > 0 && data[0].horafin) {
    document.getElementById('horainicio').value = data[0].horafin;
  }
}

// 3. Menú de gráfico
function renderizarGrafico() {
  const tipo = document.getElementById('tipo-grafico').value;
  document.getElementById('contenedor-grafico').textContent = `Agrupación por [${tipo}] lista para integrar con librería de gráficos (ej: Chart.js).`;
}

// Operaciones CRUD Supabase
async function cargarTareas() {
  const { data: tareas, error } = await supabase.from(TABLA).select('*').order('fecha', { ascending: false });
  const tablaBody = document.getElementById('tabla-body');
  
  if (error || !tareas) {
    tablaBody.innerHTML = '<tr><td colspan="10">Sin datos.</td></tr>';
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
        <button onclick="borrarTarea(${item.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

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

  await supabase.from(TABLA).insert([registro]);
  cargarTareas();
});

async function borrarTarea(id) {
  if (confirm('¿Eliminar registro?')) {
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