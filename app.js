// SUPABASE_URL, SUPABASE_KEY, supabaseClient y TABLA ahora viven en config.js
 
// Las 35 Tareas predefinidas
const TAREAS_DEFAULT = [
  "Análisis especificaciones cliente", "Anidado de ficheros 3000's", "AOYV", "Comida",
  "Descanso 20'", "Descanso 30'", "Espera de nueva tarea", "Generación .e2", "Generación .e3",
  "Generación de lotes de planchas", "Generación de previas", "Generación de secuencias de corte",
  "Maquillaje .e2 1000's", "Maquillaje .e2 2000's", "Maquillaje .e2 3000's", "Maquillaje .e2 4000's",
  "Maquillaje .e2 6000's", "Maquillaje de UA", "Maquillaje de UL", "Modificación planos GR",
  "Modificaciones en planos", "Plano previas", "Problemas red en servidores cliente",
  "Productos intermedios", "Programación", "Reunión por Teams", "Reinstalación software", "Revisión de comentarios", "Revisión de paneles",
  "Revisión de unidades abiertas UA", "Revisión de unidades lineales UL", "Revisión maquillaje 1000's",
  "Revisión maquillaje 2000's", "Revisión maquillaje 3000's", "Revisión maquillaje 4000's",
  "Revisión maquillaje 6000's", "Solicitada nueva tarea"
];
 
// Los 12 Proyectos predefinidos
const PROYECTOS_DEFAULT = [
  "ABAC", "BAC2", "BLOR", "COM", "DES", "FOR", "INFO", "INT", "MAN", "NAV", "PROG", "VAC"
];
 
// Cargar desde LocalStorage si existen o usar los por defecto
let configData = {
  tareas: JSON.parse(localStorage.getItem('cfg_tareas')) || TAREAS_DEFAULT,
  proyectos: JSON.parse(localStorage.getItem('cfg_proyectos')) || PROYECTOS_DEFAULT
};
 
let tipoConfigActual = '';
let idiomaActual = 'es';
let tareasCargadasCache = [];
 
// DIAS_SEMANA, MESES, formatearFechaISO, obtenerFechaHoyISO,
// obtenerJornadaTeoricaMinutos y obtenerDescansoMinutos viven ahora en
// config.js (compartidos con informes.js y Semana.js, para que no se
// desincronicen entre páginas).
 
function actualizarTituloConDia(titulo) {
  const hoy = new Date();
  const nombreDia = DIAS_SEMANA[idiomaActual][hoy.getDay()];
  const nombreMes = MESES[idiomaActual][hoy.getMonth()];
  const dia = hoy.getDate();
  const anio = hoy.getFullYear();
 
  const fechaTexto = (idiomaActual === 'en')
    ? `${nombreDia}, ${nombreMes} ${dia}, ${anio}`
    : `${nombreDia} ${dia} de ${nombreMes} de ${anio}`;
 
  document.getElementById('txt-titulo').textContent = `${titulo}, ${fechaTexto}`;
}
 
document.addEventListener('DOMContentLoaded', async () => {
  poblarSelects();
  actualizarTituloConDia('REGHOR');
 
  const inputFecha = document.getElementById('fecha');
  if (inputFecha) {
    inputFecha.addEventListener('change', () => cargarTareas());
  }
 
  if (supabaseClient) {
    await cargarTareas();
  } else {
    document.getElementById('tabla-body').innerHTML = '<div class="tabla-msg" style="color:red;">⚠️ Error al inicializar Supabase.</div>';
  }
});
 
/**
 * Consulta la última fecha registrada en Supabase si el input está vacío
 */
async function obtenerUltimaFechaDesdeSupabase() {
  try {
    const { data, error } = await supabaseClient
      .from(TABLA)
      .select('fecha')
      .order('id', { ascending: false })
      .limit(1);
 
    if (!error && data && data.length > 0 && data[0].fecha) {
      let raw = String(data[0].fecha).trim();
      if (raw.includes('T')) raw = raw.split('T')[0];
      if (raw.includes(' ')) raw = raw.split(' ')[0];
      return raw;
    }
  } catch (e) {
    console.error("Error al obtener la última fecha de Supabase:", e);
  }
 
  return obtenerFechaHoyISO();
}
 
function ordenarLista(array) {
  return array.sort((a, b) => a.localeCompare(b, idiomaActual, { sensitivity: 'base' }));
}
 
function poblarSelects() {
  const selTarea = document.getElementById('tarea');
  const selProyecto = document.getElementById('proyecto');
 
  configData.tareas = ordenarLista(configData.tareas);
  configData.proyectos = ordenarLista(configData.proyectos);
 
  if (selTarea) {
    selTarea.innerHTML = configData.tareas.map(t => `<option value="${t}">${t}</option>`).join('');
    sincronizarComentario();
  }
 
  if (selProyecto) {
    selProyecto.innerHTML = configData.proyectos.map(p => `<option value="${p}">${p}</option>`).join('');
    if (configData.proyectos.includes('BAC2')) {
      selProyecto.value = 'BAC2';
    }
  }
}
 
function sincronizarComentario() {
  const selTarea = document.getElementById('tarea');
  const inputComentario = document.getElementById('comentario');
  if (selTarea && inputComentario && selTarea.value) {
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
  configData[tipoConfigActual] = ordenarLista(configData[tipoConfigActual]);
 
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
  if (val && !configData[tipoConfigActual].includes(val)) {
    configData[tipoConfigActual].push(val);
    configData[tipoConfigActual] = ordenarLista(configData[tipoConfigActual]);
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
 
async function cargarTareas() {
  const tablaBody = document.getElementById('tabla-body');
  tablaBody.innerHTML = '<div class="tabla-msg">Cargando datos desde Supabase...</div>';
 
  const inputFecha = document.getElementById('fecha');
  let fechaFiltroStr = inputFecha ? inputFecha.value.trim() : '';
 
  if (!fechaFiltroStr) {
    fechaFiltroStr = await obtenerUltimaFechaDesdeSupabase();
    if (inputFecha) {
      inputFecha.value = fechaFiltroStr;
    }
  }
 
  try {
    const { data: tareas, error } = await supabaseClient
      .from(TABLA)
      .select('*')
      .ilike('fecha', `%${fechaFiltroStr}%`);
 
    if (error) {
      console.error("Error al cargar registros:", error);
      tablaBody.innerHTML = `<div class="tabla-msg" style="color:red;">Error Supabase: ${error.message}</div>`;
      actualizarResumenHoras([], fechaFiltroStr);
      return;
    }
 
    if (!tareas || tareas.length === 0) {
      tablaBody.innerHTML = `<div class="tabla-msg">No existen registros guardados para la fecha ${fechaFiltroStr}.</div>`;
      actualizarResumenHoras([], fechaFiltroStr);
      return;
    }
 
    tareas.sort((a, b) => (a.id || 0) - (b.id || 0));
    tareasCargadasCache = tareas;
 
    tablaBody.innerHTML = tareas.map(item => {
      let rawF = String(item.fecha || '').trim();
      let fDisplay = rawF.includes('T') ? rawF.split('T')[0] : rawF.split(' ')[0];
 
      return `
        <div class="tabla-grid-row tabla-row" ondblclick="cargarParaEditar(${item.id})" title="Doble clic para editar este registro">
          <div>${fDisplay}</div>
          <div>${item.tarea || ''}</div>
          <div>${item.proyecto || ''}</div>
          <div>${item.bloque || ''}</div>
          <div>${item.horainicio || ''}</div>
          <div>${item.horafin || ''}</div>
          <div>${item.comentario || ''}</div>
          <div>${item.notas || ''}</div>
          <div><strong>${calcularDuracion(item.horainicio, item.horafin)}</strong></div>
          <div class="acciones-cell">
            <button type="button" class="btn-mini" onclick="event.stopPropagation(); cargarParaEditar(${item.id})">✏️ Editar</button>
            <button type="button" class="btn-mini" onclick="event.stopPropagation(); cargarParaDuplicar(${item.id})" title="Usa este registro como base para crear uno nuevo">📋 Duplicar</button>
            <button type="button" class="btn-mini" onclick="event.stopPropagation(); borrarTarea(${item.id})">🗑️ Eliminar</button>
          </div>
        </div>
      `;
    }).join('');
 
    actualizarResumenHoras(tareas, fechaFiltroStr);
 
  } catch(err) {
    console.error("Error inesperado en cargarTareas:", err);
    tablaBody.innerHTML = `<div class="tabla-msg" style="color:red;">Error al procesar la solicitud.</div>`;
    actualizarResumenHoras([], fechaFiltroStr);
  }
}
 
/**
 * Vuelca los datos de un registro guardado en el formulario de entrada.
 * No toca el campo oculto tarea-id: quien llama decide si el envío
 * resultante debe actualizar (editar) o crear un registro nuevo (duplicar).
 */
function poblarFormularioDesdeRegistro(registro) {
  let rawF = String(registro.fecha || '').trim();
  let fDisplay = rawF.includes('T') ? rawF.split('T')[0] : rawF.split(' ')[0];
 
  document.getElementById('fecha').value = fDisplay;
  document.getElementById('tarea').value = registro.tarea || '';
  document.getElementById('proyecto').value = registro.proyecto || '';
  document.getElementById('bloque').value = registro.bloque || '';
  document.getElementById('horainicio').value = registro.horainicio || '';
  document.getElementById('horafin').value = registro.horafin || '';
  document.getElementById('comentario').value = registro.comentario || '';
  document.getElementById('notas').value = registro.notas || '';
}
 
function cargarParaEditar(id) {
  const registro = tareasCargadasCache.find(t => t.id === id);
  if (!registro) return;
 
  poblarFormularioDesdeRegistro(registro);
  document.getElementById('tarea-id').value = registro.id;
 
  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.textContent = TEXTOS_INDEX[idiomaActual].actualizar;
  btnGuardar.style.backgroundColor = '#ffc107';
  btnGuardar.style.color = '#000';
  document.getElementById('btn-cancelar').style.display = 'inline-block';
}
 
/**
 * Carga un registro existente en el formulario pero SIN su id, de modo que
 * al guardar se cree un registro nuevo en la base de datos en lugar de
 * actualizar el original (útil para repetir una tarea similar).
 */
function cargarParaDuplicar(id) {
  const registro = tareasCargadasCache.find(t => t.id === id);
  if (!registro) return;
 
  poblarFormularioDesdeRegistro(registro);
  document.getElementById('tarea-id').value = '';
 
  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.textContent = TEXTOS_INDEX[idiomaActual].guardar;
  btnGuardar.style.backgroundColor = '#28a745';
  btnGuardar.style.color = '#fff';
  document.getElementById('btn-cancelar').style.display = 'inline-block';
 
  document.getElementById('horainicio').focus();
}
 
function resetearFormulario() {
  document.getElementById('tarea-id').value = '';
  document.getElementById('bloque').value = '';
  document.getElementById('horainicio').value = '';
  document.getElementById('horafin').value = '';
  document.getElementById('comentario').value = '';
  document.getElementById('notas').value = '';
 
  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.textContent = TEXTOS_INDEX[idiomaActual].guardar;
  btnGuardar.style.backgroundColor = '#28a745';
  btnGuardar.style.color = '#fff';
  document.getElementById('btn-cancelar').style.display = 'none';
 
  sincronizarComentario();
}
 
document.getElementById('tarea-form').addEventListener('submit', async (e) => {
  e.preventDefault();
 
  const id = document.getElementById('tarea-id').value;
  const fechaStr = document.getElementById('fecha').value.trim();
  const horaInicio = document.getElementById('horainicio').value;
  const horaFin = document.getElementById('horafin').value;
 
  if (horaInicio && horaFin && horaFin < horaInicio) {
    alert('❌ Error: La Hora Fin no puede ser anterior a la Hora Inicio.');
    return;
  }
 
  const registro = {
    fecha: fechaStr,
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
      response = await supabaseClient.from(TABLA).update(registro).eq('id', id);
    } else {
      response = await supabaseClient.from(TABLA).insert([registro]);
    }
 
    if (response.error) {
      alert('Error de Supabase: ' + response.error.message);
    } else {
      resetearFormulario();
      cargarTareas();
    }
  } catch (err) {
    alert('Error de red al conectar con Supabase.');
  }
});
 
async function borrarTarea(id) {
  if (confirm('¿Eliminar este registro?')) {
    await supabaseClient.from(TABLA).delete().eq('id', id);
    cargarTareas();
  }
}
 
function actualizarResumenHoras(listaTareas, fechaStr) {
  let totalMinutosReales = 0;
 
  listaTareas.forEach(item => {
    totalMinutosReales += obtenerMinutosDuracion(item.horainicio, item.horafin);
  });
 
  // Descuento de 00:30 (lunes a jueves, periodo 1 sept - 30 jun) sobre las
  // horas realmente trabajadas. El balance de horas extra, al calcularse a
  // partir de este total, hereda automáticamente el mismo descuento.
  if (totalMinutosReales > 0) {
    const descanso = obtenerDescansoMinutos(fechaStr);
    totalMinutosReales = Math.max(0, totalMinutosReales - descanso);
  }
 
  const minutosTeoricos = obtenerJornadaTeoricaMinutos(fechaStr);
  const balanceMinutos = totalMinutosReales - minutosTeoricos;
 
  document.getElementById('total-teorica').textContent = formatearMinutosAHoras(minutosTeoricos);
  document.getElementById('total-duracion').textContent = formatearMinutosAHoras(totalMinutosReales);
 
  const elBalance = document.getElementById('total-balance');
  const signoStr = balanceMinutos > 0 ? '+' : '';
  elBalance.textContent = `${signoStr}${formatearMinutosAHoras(balanceMinutos)}`;
 
  elBalance.className = balanceMinutos > 0 ? 'saldo-positivo' : (balanceMinutos < 0 ? 'saldo-negativo' : 'saldo-neutro');
}
 
const TEXTOS_INDEX = {
  es: {
    titulo: 'REGHOR', fecha: 'Fecha', tarea: 'Tarea', proyecto: 'Proyecto', bloque: 'Bloque',
    horainicio: 'Hora inicio', horafin: 'Hora fin', comentario: 'Comentario', notas: 'Notas',
    acciones: 'Acciones', listado: 'Listado de Tareas', informes: '📊 Informes', graficos: '📈 Gráficos', semana: '📅 Registro Semana',
    guardar: 'Guardar', actualizar: 'Actualizar', cancelar: 'Cancelar',
    teorica: 'Jornada Teórica del Día:', total: 'Total Horas Trabajadas:', balance: 'Balance / Horas Extra:'
  },
  gl: {
    titulo: 'REGHOR', fecha: 'Data', tarea: 'Tarefa', proyecto: 'Proxecto', bloque: 'Bloque',
    horainicio: 'Hora inicio', horafin: 'Hora fin', comentario: 'Comentario', notas: 'Notas',
    acciones: 'Accións', listado: 'Listaxe de Tarefas', informes: '📊 Informes', graficos: '📈 Gráficas', semana: '📅 Rexistro Semana',
    guardar: 'Gardar', actualizar: 'Actualizar', cancelar: 'Cancelar',
    teorica: 'Xornada Teórica do Día:', total: 'Total Horas Traballadas:', balance: 'Balance / Horas Extra:'
  },
  en: {
    titulo: 'REGHOR', fecha: 'Date', tarea: 'Task', proyecto: 'Project', bloque: 'Block',
    horainicio: 'Start Time', horafin: 'End Time', comentario: 'Comment', notas: 'Notes',
    acciones: 'Actions', listado: 'Task List', informes: '📊 Reports', graficos: '📈 Charts', semana: '📅 Week Log',
    guardar: 'Save', actualizar: 'Update', cancelar: 'Cancel',
    teorica: 'Theoretical Day Hours:', total: 'Total Hours Worked:', balance: 'Balance / Overtime:'
  }
};
 
function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = TEXTOS_INDEX[lang];
 
  actualizarTituloConDia(t.titulo);
  document.getElementById('lbl-fecha').textContent = t.fecha;
  document.getElementById('lbl-tarea').textContent = t.tarea;
  document.getElementById('lbl-proyecto').textContent = t.proyecto;
  document.getElementById('lbl-bloque').textContent = t.bloque;
  document.getElementById('lbl-horainicio').textContent = t.horainicio;
  document.getElementById('lbl-horafin').textContent = t.horafin;
  document.getElementById('lbl-comentario').textContent = t.comentario;
  document.getElementById('lbl-notas').textContent = t.notas;
  document.getElementById('txt-listado').textContent = t.listado;
  document.getElementById('btn-informes').textContent = t.informes;
  document.getElementById('btn-graficos').textContent = t.graficos;
  document.getElementById('btn-semana').textContent = t.semana;
  document.getElementById('btn-cancelar').textContent = t.cancelar;
 
  const idEditando = document.getElementById('tarea-id').value;
  document.getElementById('btn-guardar').textContent = idEditando ? t.actualizar : t.guardar;
 
  document.getElementById('txt-teorica-label').textContent = t.teorica;
  document.getElementById('txt-total-label').textContent = t.total;
  document.getElementById('txt-balance-label').textContent = t.balance;
 
  document.getElementById('th-fecha').textContent = t.fecha;
  document.getElementById('th-tarea').textContent = t.tarea;
  document.getElementById('th-proyecto').textContent = t.proyecto;
  document.getElementById('th-bloque').textContent = t.bloque;
  document.getElementById('th-inicio').textContent = t.horainicio;
  document.getElementById('th-fin').textContent = t.horafin;
  document.getElementById('th-duracion').textContent = (lang === 'en') ? 'Duration' : 'Duración';
  document.getElementById('th-comentario').textContent = t.comentario;
  document.getElementById('th-notas').textContent = t.notas;
  document.getElementById('th-acciones').textContent = t.acciones;
 
  poblarSelects();
}