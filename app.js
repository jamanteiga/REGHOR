// Configuración de conexión directa a Supabase
const SUPABASE_URL = 'https://oppieocootkgddhazikw.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_6_pEKDfVrdKKuewB_qn_cw_fzNXPjT-';

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const TABLA = 'obras';

const TAREAS_DEFAULT = [
  "Análisis especificaciones cliente",
  "Anidado de ficheros 3000's",
  "AOYV",
  "Comida",
  "Descanso 20'",
  "Descanso 30'",
  "Espera de nueva tarea",
  "Generación .e2",
  "Generación .e3",
  "Generación de lotes de planchas",
  "Generación de previas",
  "Generación de secuencias de corte",
  "Maquillaje .e2 1000's",
  "Maquillaje .e2 2000's",
  "Maquillaje .e2 3000's",
  "Maquillaje .e2 4000's",
  "Maquillaje .e2 6000's",
  "Maquillaje de UA",
  "Maquillaje de UL",
  "Modificación planos GR",
  "Modificaciones en planos",
  "Plano previas",
  "Problemas red en servidores cliente",
  "Productos intermedios",
  "Reinstalación software",
  "Revisión de comentarios",
  "Revisión de paneles",
  "Revisión de unidades abiertas UA",
  "Revisión de unidades lineales UL",
  "Revisión maquillaje 1000's",
  "Revisión maquillaje 2000's",
  "Revisión maquillaje 3000's",
  "Revisión maquillaje 4000's",
  "Revisión maquillaje 6000's",
  "Solicitada nueva tarea"
];

const PROYECTOS_DEFAULT = [
  "ABAC",
  "BAC2",
  "BLOR",
  "COM",
  "DES",
  "FOR",
  "INFO",
  "INT",
  "MAN",
  "NAV",
  "PROG",
  "VAC"
];

let configData = {
  tareas: JSON.parse(localStorage.getItem('cfg_tareas')) || TAREAS_DEFAULT,
  proyectos: JSON.parse(localStorage.getItem('cfg_proyectos')) || PROYECTOS_DEFAULT
};

let tipoConfigActual = '';
let idiomaActual = 'es';
let tareasCargadasCache = [];

document.addEventListener('DOMContentLoaded', () => {
  establecerFechaHoy();
  poblarSelects();
  
  if (supabaseClient) {
    cargarTareas();
  } else {
    document.getElementById('tabla-body').innerHTML = '<tr><td colspan="10" style="color:red;">⚠️ Error al inicializar la librería de Supabase.</td></tr>';
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
  configData.proyectos.sort((a, b) => a.localeCompare(b, idiomaActual, { sensitivity: 'base' }));

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
  if (!supabaseClient) return;
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
      tablaBody.innerHTML = `<tr><td colspan="10" style="color:red;">Error de base de datos: ${error.message}</td></tr>`;
      actualizarTotalHoras([]);
      return;
    }

    if (!tareas || tareas.length === 0) {
      tablaBody.innerHTML = '<tr><td colspan="10">No existen registros guardados.</td></tr>';
      actualizarTotalHoras([]);
      return;
    }

    tareasCargadasCache = tareas;

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
          <button class="btn-mini" onclick="cargarParaEditar(${item.id})">Editar</button>
          <button class="btn-mini" onclick="borrarTarea(${item.id})">Eliminar</button>
        </td>
      </tr>
    `).join('');

    actualizarTotalHoras(tareas);

  } catch(err) {
    tablaBody.innerHTML = `<tr><td colspan="10" style="color:red;">Error de conexión (TypeError: Failed to fetch). Verifica que la tabla '${TABLA}' existe en Supabase y permite lectura pública.</td></tr>`;
    actualizarTotalHoras([]);
  }
}

// Cargar un registro existente en el formulario para modificarlo
function cargarParaEditar(id) {
  const registro = tareasCargadasCache.find(t => t.id === id);
  if (!registro) return;

  document.getElementById('tarea-id').value = registro.id;
  document.getElementById('fecha').value = registro.fecha || '';
  document.getElementById('tarea').value = registro.tarea || '';
  document.getElementById('proyecto').value = registro.proyecto || '';
  document.getElementById('bloque').value = registro.bloque || '';
  document.getElementById('horainicio').value = registro.horainicio || '';
  document.getElementById('horafin').value = registro.horafin || '';
  document.getElementById('comentario').value = registro.comentario || '';
  document.getElementById('notas').value = registro.notas || '';

  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.textContent = (idiomaActual === 'gl') ? 'Actualizar' : 'Actualizar';
  btnGuardar.style.backgroundColor = '#ffc107';
  btnGuardar.style.color = '#000';
  document.getElementById('btn-cancelar').style.display = 'inline-block';
}

function resetearFormulario() {
  document.getElementById('tarea-id').value = '';
  document.getElementById('bloque').value = '';
  document.getElementById('horainicio').value = '';
  document.getElementById('horafin').value = '';
  document.getElementById('comentario').value = '';
  document.getElementById('notas').value = '';

  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.textContent = (idiomaActual === 'gl') ? 'Gardar' : 'Guardar';
  btnGuardar.style.backgroundColor = '#28a745';
  btnGuardar.style.color = '#fff';
  document.getElementById('btn-cancelar').style.display = 'none';

  sincronizarComentario();
}

document.getElementById('tarea-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('tarea-id').value;
  const horaInicio = document.getElementById('horainicio').value;
  const horaFin = document.getElementById('horafin').value;

  // Validación 1: Hora fin previa a hora inicio
  if (horaInicio && horaFin && horaFin < horaInicio) {
    alert('❌ Error: La Hora Fin no puede ser anterior a la Hora Inicio.');
    return;
  }

  // Validación 2: Duración superior a 8:30 horas (510 minutos)
  const duracionMinutos = obtenerMinutosDuracion(horaInicio, horaFin);
  if (duracionMinutos > 510) {
    const confirmar = confirm(`⚠️ Atención: La duración registrada es de ${calcularDuracion(horaInicio, horaFin)} (más de 8h 30m). ¿Confirmas que los datos son correctos?`);
    if (!confirmar) return;
  }

  const registro = {
    fecha: document.getElementById('fecha').value,
    tarea: document.getElementById('tarea').value,
    proyecto: document.getElementById('proyecto').value,
    bloque: document.getElementById('bloque').value,
    horainicio: horaInicio,
    horafin: horaFin,
    comentario: document.getElementById('comentario').value,
    notas: document.getElementById('notas').value
  };

  try {
    let response;
    if (id) {
      // Acción UPDATE si se está editando
      response = await supabaseClient.from(TABLA).update(registro).eq('id', id);
    } else {
      // Acción INSERT si es un registro nuevo
      response = await supabaseClient.from(TABLA).insert([registro]);
    }

    if (response.error) {
      alert('Error de Supabase: ' + response.error.message);
    } else {
      resetearFormulario();
      cargarTareas();
    }
  } catch (err) {
    alert('Error de red al conectar con Supabase. Asegúrate de tener conexión a Internet.');
  }
});

async function borrarTarea(id) {
  if (confirm('¿Eliminar este registro?')) {
    await supabaseClient.from(TABLA).delete().eq('id', id);
    cargarTareas();
  }
}

function obtenerMinutosDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 0;
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  let dif = (hFin * 60 + mFin) - (hIni * 60 + mIni);
  return dif < 0 ? dif + 1440 : dif;
}

function calcularDuracion(horaInicio, horaFin) {
  const dif = obtenerMinutosDuracion(horaInicio, horaFin);
  return `${String(Math.floor(dif / 60)).padStart(2, '0')}:${String(dif % 60).padStart(2, '0')}`;
}

function actualizarTotalHoras(listaTareas) {
  let totalMinutos = 0;

  listaTareas.forEach(item => {
    totalMinutos += obtenerMinutosDuracion(item.horainicio, item.horafin);
  });

  const hh = String(Math.floor(totalMinutos / 60)).padStart(2, '0');
  const mm = String(totalMinutos % 60).padStart(2, '0');
  
  document.getElementById('total-duracion').textContent = `${hh}:${mm}`;
}

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = {
    es: { titulo: 'REGHOR', fecha: 'Fecha', tarea: 'Tarea', proyecto: 'Proyecto', listado: 'Listado de Tareas', graficos: '📊 Gráficos ▾', guardar: 'Guardar', actualizar: 'Actualizar', total: 'Total Horas Registradas:' },
    gl: { titulo: 'REGHOR', fecha: 'Data', tarea: 'Tarefa', proyecto: 'Proxecto', listado: 'Listaxe de Tarefas', graficos: '📊 Gráficos ▾', guardar: 'Gardar', actualizar: 'Actualizar', total: 'Total Horas Rexistradas:' }
  }[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('lbl-fecha').textContent = t.fecha;
  document.getElementById('lbl-tarea').textContent = t.tarea;
  document.getElementById('lbl-proyecto').textContent = t.proyecto;
  document.getElementById('txt-listado').textContent = t.listado;
  document.getElementById('btn-graficos').textContent = t.graficos;
  
  const idEditando = document.getElementById('tarea-id').value;
  document.getElementById('btn-guardar').textContent = idEditando ? t.actualizar : t.guardar;
  document.getElementById('txt-total-label').textContent = t.total;

  document.getElementById('th-fecha').textContent = t.fecha;
  document.getElementById('th-tarea').textContent = t.tarea;
  document.getElementById('th-proyecto').textContent = t.proyecto;

  poblarSelects();
}