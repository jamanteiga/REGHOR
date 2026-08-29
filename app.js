// Configuración de conexión a Supabase
const SUPABASE_URL = 'https://oppieocootkgddhazikw.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_6_pEKDfVrdKKuewB_qn_cw_fzNXPjT-';

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const TABLA = 'obras';

// Las 35 Tareas predeterminadas
const TAREAS_DEFAULT = [
  "Análisis especificaciones cliente", "Anidado de ficheros 3000's", "AOYV", "Comida",
  "Descanso 20'", "Descanso 30'", "Espera de nueva tarea", "Generación .e2", "Generación .e3",
  "Generación de lotes de planchas", "Generación de previas", "Generación de secuencias de corte",
  "Maquillaje .e2 1000's", "Maquillaje .e2 2000's", "Maquillaje .e2 3000's", "Maquillaje .e2 4000's",
  "Maquillaje .e2 6000's", "Maquillaje de UA", "Maquillaje de UL", "Modificación planos GR",
  "Modificaciones en planos", "Plano previas", "Problemas red en servidores cliente",
  "Productos intermedios", "Reinstalación software", "Revisión de comentarios", "Revisión de paneles",
  "Revisión de unidades abiertas UA", "Revisión de unidades lineales UL", "Revisión maquillaje 1000's",
  "Revisión maquillaje 2000's", "Revisión maquillaje 3000's", "Revisión maquillaje 4000's",
  "Revisión maquillaje 6000's", "Solicitada nueva tarea"
];

// Los 12 Proyectos predeterminados
const PROYECTOS_DEFAULT = [
  "ABAC", "BAC2", "BLOR", "COM", "DES", "FOR", "INFO", "INT", "MAN", "NAV", "PROG", "VAC"
];

let configData = {
  tareas: TAREAS_DEFAULT,
  proyectos: PROYECTOS_DEFAULT
};

let tipoConfigActual = '';
let idiomaActual = 'es';
let tareasCargadasCache = [];

/**
 * Obtiene la fecha actual del sistema local en formato YYYY-MM-DD
 */
function obtenerFechaHoyISO() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  return new Date(hoy.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
}

document.addEventListener('DOMContentLoaded', async () => {
  poblarSelects();

  const fechaHoy = obtenerFechaHoyISO();

  // Asignar hoy al formulario principal
  const inputFecha = document.getElementById('fecha');
  if (inputFecha) {
    inputFecha.value = fechaHoy;
  }

  // Asignar hoy al filtro de búsqueda inicial
  const inputFiltroDesde = document.getElementById('filtro-fecha-desde');
  if (inputFiltroDesde) {
    inputFiltroDesde.value = fechaHoy;
  }

  if (supabaseClient) {
    await aplicarFiltros();
  } else {
    document.getElementById('tabla-body').innerHTML = '<tr><td colspan="10" style="color:red;">⚠️ Error al inicializar Supabase.</td></tr>';
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

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('btn-theme').textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
}

function ordenarLista(array) {
  return array.sort((a, b) => a.localeCompare(b, idiomaActual, { sensitivity: 'base' }));
}

function poblarSelects() {
  const selTarea = document.getElementById('tarea');
  const selProyecto = document.getElementById('proyecto');
  const selFiltroProyecto = document.getElementById('filtro-proyecto');
  
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

  if (selFiltroProyecto) {
    selFiltroProyecto.innerHTML = '<option value="">-- Todos los proyectos --</option>' + 
      configData.proyectos.map(p => `<option value="${p}">${p}</option>`).join('');
  }
}

function sincronizarComentario() {
  const selTarea = document.getElementById('tarea');
  const inputComentario = document.getElementById('comentario');
  if (selTarea && inputComentario && selTarea.value) {
    inputComentario.value = selTarea.value;
  }
}

/* --- GESTIÓN DE CONFIGURACIÓN Y OPCIONES --- */
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

function filtrarGrafico(criterio) {
  alert(`Criterio de visualización seleccionado: ${criterio}`);
  document.getElementById('dropdown-graficos-container').classList.remove('show');
}

function obtenerJornadaTeoricaMinutos(fechaStr) {
  if (!fechaStr) return 0;
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return 0;
  
  const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  const mes = fecha.getMonth() + 1;
  const diaSemana = fecha.getDay();

  if (diaSemana === 0 || diaSemana === 6) return 0;
  if (mes === 7 || mes === 8) return 435; // Verano: 7h 15m
  if (diaSemana === 5) return 420;        // Viernes: 7h 00m
  return 510;                             // Lunes a Jueves: 8h 30m
}

/* --- LOGICA DEL PANEL DE FILTROS AVANZADOS --- */

function cambiarModoFiltro() {
  const modo = document.getElementById('tipo-filtro').value;
  const inputDesde = document.getElementById('filtro-fecha-desde');
  const inputHasta = document.getElementById('filtro-fecha-hasta');
  const selProyecto = document.getElementById('filtro-proyecto');
  const inputBloque = document.getElementById('filtro-bloque');

  inputDesde.style.display = (modo === 'proyecto') ? 'none' : 'inline-block';
  inputHasta.style.display = (modo === 'rango') ? 'inline-block' : 'none';
  selProyecto.style.display = (modo === 'proyecto') ? 'inline-block' : 'none';
  inputBloque.style.display = (modo === 'proyecto') ? 'inline-block' : 'none';
}

function obtenerRangosFechaCalculados() {
  const modo = document.getElementById('tipo-filtro').value;
  const valFecha = document.getElementById('filtro-fecha-desde').value;

  if (!valFecha && modo !== 'proyecto') return { desde: null, hasta: null };

  const baseDate = new Date(valFecha + 'T00:00:00');
  const yyyy = baseDate.getFullYear();
  const mm = baseDate.getMonth(); // 0 a 11

  let desde = valFecha;
  let hasta = valFecha;

  if (modo === 'semana') {
    const dayOfWeek = baseDate.getDay() === 0 ? 7 : baseDate.getDay(); 
    const lunes = new Date(baseDate);
    lunes.setDate(baseDate.getDate() - (dayOfWeek - 1));
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    desde = lunes.toISOString().split('T')[0];
    hasta = domingo.toISOString().split('T')[0];

  } else if (modo === 'mes') {
    const primerDia = new Date(yyyy, mm, 1);
    const ultimoDia = new Date(yyyy, mm + 1, 0);
    desde = primerDia.toISOString().split('T')[0];
    hasta = ultimoDia.toISOString().split('T')[0];

  } else if (modo === 'trimestre') {
    const qTrim = Math.floor(mm / 3);
    const primerDia = new Date(yyyy, qTrim * 3, 1);
    const ultimoDia = new Date(yyyy, (qTrim + 1) * 3, 0);
    desde = primerDia.toISOString().split('T')[0];
    hasta = ultimoDia.toISOString().split('T')[0];

  } else if (modo === 'semestre') {
    const sSem = mm < 6 ? 0 : 6;
    const primerDia = new Date(yyyy, sSem, 1);
    const ultimoDia = new Date(yyyy, sSem + 6, 0);
    desde = primerDia.toISOString().split('T')[0];
    hasta = ultimoDia.toISOString().split('T')[0];

  } else if (modo === 'rango') {
    hasta = document.getElementById('filtro-fecha-hasta').value || valFecha;
  }

  return { desde, hasta };
}

async function aplicarFiltros() {
  const tablaBody = document.getElementById('tabla-body');
  tablaBody.innerHTML = '<tr><td colspan="10">Filtrando datos desde Supabase...</td></tr>';

  const modo = document.getElementById('tipo-filtro').value;
  const { desde, hasta } = obtenerRangosFechaCalculados();

  try {
    let query = supabaseClient.from(TABLA).select('*');

    if (modo !== 'proyecto' && desde && hasta) {
      if (desde === hasta) {
        // Coincidencia con ilike por seguridad sobre campos TEXT con espacios
        query = query.ilike('fecha', `%${desde}%`);
      } else {
        query = query.gte('fecha', desde).lte('fecha', hasta);
      }
    }

    if (modo === 'proyecto') {
      const proy = document.getElementById('filtro-proyecto').value;
      const bloq = document.getElementById('filtro-bloque').value.trim();

      if (proy) query = query.eq('proyecto', proy);
      if (bloq) query = query.ilike('bloque', `%${bloq}%`);
    }

    const { data: tareas, error } = await query;

    if (error) {
      console.error("Error al filtrar:", error);
      tablaBody.innerHTML = `<tr><td colspan="10" style="color:red;">Error Supabase: ${error.message}</td></tr>`;
      actualizarResumenHoras([], '');
      return;
    }

    if (!tareas || tareas.length === 0) {
      tablaBody.innerHTML = '<tr><td colspan="10">No se encontraron registros para el filtro seleccionado.</td></tr>';
      actualizarResumenHoras([], desde || '');
      return;
    }

    tareas.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)) || ((a.id || 0) - (b.id || 0)));
    tareasCargadasCache = tareas;

    tablaBody.innerHTML = tareas.map(item => {
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
          <td><strong>${calcularDuracion(item.horainicio, item.horafin)}</strong></td>
          <td>${item.comentario || ''}</td>
          <td>${item.notas || ''}</td>
          <td>
            <button class="btn-mini" onclick="cargarParaEditar(${item.id})">Editar</button>
            <button class="btn-mini" onclick="borrarTarea(${item.id})">Eliminar</button>
          </td>
        </tr>
      `;
    }).join('');

    actualizarResumenHoras(tareas, desde || obtenerFechaHoyISO());

  } catch (err) {
    console.error("Error inesperado al aplicar filtros:", err);
    tablaBody.innerHTML = '<tr><td colspan="10" style="color:red;">Error procesando la búsqueda.</td></tr>';
    actualizarResumenHoras([], '');
  }
}

function limpiarFiltros() {
  document.getElementById('tipo-filtro').value = 'dia';
  document.getElementById('filtro-fecha-desde').value = obtenerFechaHoyISO();
  document.getElementById('filtro-fecha-hasta').value = '';
  document.getElementById('filtro-proyecto').value = '';
  document.getElementById('filtro-bloque').value = '';
  cambiarModoFiltro();
  aplicarFiltros();
}

/* --- EDICIÓN Y REGISTRO DE FORMULARIO --- */

function cargarParaEditar(id) {
  const registro = tareasCargadasCache.find(t => t.id === id);
  if (!registro) return;

  let rawF = String(registro.fecha || '').trim();
  let fDisplay = rawF.includes('T') ? rawF.split('T')[0] : rawF.split(' ')[0];

  document.getElementById('tarea-id').value = registro.id;
  document.getElementById('fecha').value = fDisplay;
  document.getElementById('tarea').value = registro.tarea || '';
  document.getElementById('proyecto').value = registro.proyecto || '';
  document.getElementById('bloque').value = registro.bloque || '';
  document.getElementById('horainicio').value = registro.horainicio || '';
  document.getElementById('horafin').value = registro.horafin || '';
  document.getElementById('comentario').value = registro.comentario || '';
  document.getElementById('notas').value = registro.notas || '';

  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.textContent = 'Actualizar';
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
      aplicarFiltros();
    }
  } catch (err) {
    alert('Error de red al conectar con Supabase.');
  }
});

async function borrarTarea(id) {
  if (confirm('¿Eliminar este registro?')) {
    await supabaseClient.from(TABLA).delete().eq('id', id);
    aplicarFiltros();
  }
}

/* --- CÁLCULOS Y RESUMEN --- */

function obtenerMinutosDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 0;
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  let dif = (hFin * 60 + mFin) - (hIni * 60 + mIni);
  return dif < 0 ? dif + 1440 : dif;
}

function calcularDuracion(horaInicio, horaFin) {
  const dif = obtenerMinutosDuracion(horaInicio, horaFin);
  return formatearMinutosAHoras(dif);
}

function formatearMinutosAHoras(totalMinutos) {
  const absMin = Math.abs(totalMinutos);
  const hh = String(Math.floor(absMin / 60)).padStart(2, '0');
  const mm = String(absMin % 60).padStart(2, '0');
  const signo = totalMinutos < 0 ? '-' : '';
  return `${signo}${hh}:${mm}`;
}

function actualizarResumenHoras(listaTareas, fechaStr) {
  let totalMinutosReales = 0;

  listaTareas.forEach(item => {
    totalMinutosReales += obtenerMinutosDuracion(item.horainicio, item.horafin);
  });

  const minutosTeoricos = obtenerJornadaTeoricaMinutos(fechaStr);
  const balanceMinutos = totalMinutosReales - minutosTeoricos;

  document.getElementById('total-teorica').textContent = formatearMinutosAHoras(minutosTeoricos);
  document.getElementById('total-duracion').textContent = formatearMinutosAHoras(totalMinutosReales);
  
  const elBalance = document.getElementById('total-balance');
  const signoStr = balanceMinutos > 0 ? '+' : '';
  elBalance.textContent = `${signoStr}${formatearMinutosAHoras(balanceMinutos)}`;

  elBalance.className = balanceMinutos > 0 ? 'saldo-positivo' : (balanceMinutos < 0 ? 'saldo-negativo' : 'saldo-neutro');
}

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = {
    es: { titulo: 'REGHOR', fecha: 'Fecha', tarea: 'Tarea', proyecto: 'Proyecto', listado: 'Listado de Tareas', graficos: '📊 Gráficos ▾', guardar: 'Guardar', actualizar: 'Actualizar', teorica: 'Jornada Teórica del Día:', total: 'Total Horas Trabajadas:', balance: 'Balance / Horas Extra:' },
    gl: { titulo: 'REGHOR', fecha: 'Data', tarea: 'Tarefa', proyecto: 'Proxecto', listado: 'Listaxe de Tarefas', graficos: '📊 Gráficos ▾', guardar: 'Gardar', actualizar: 'Actualizar', teorica: 'Xornada Teórica do Día:', total: 'Total Horas Traballadas:', balance: 'Balance / Horas Extra:' }
  }[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('lbl-fecha').textContent = t.fecha;
  document.getElementById('lbl-tarea').textContent = t.tarea;
  document.getElementById('lbl-proyecto').textContent = t.proyecto;
  document.getElementById('txt-listado').textContent = t.listado;
  document.getElementById('btn-graficos').textContent = t.graficos;
  
  const idEditando = document.getElementById('tarea-id').value;
  document.getElementById('btn-guardar').textContent = idEditando ? t.actualizar : t.guardar;
  
  document.getElementById('txt-teorica-label').textContent = t.teorica;
  document.getElementById('txt-total-label').textContent = t.total;
  document.getElementById('txt-balance-label').textContent = t.balance;

  document.getElementById('th-fecha').textContent = t.fecha;
  document.getElementById('th-tarea').textContent = t.tarea;
  document.getElementById('th-proyecto').textContent = t.proyecto;

  poblarSelects();
}