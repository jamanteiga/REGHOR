// --- ESTADO Y DATOS INICIALES ---
let listaProyectos = ["ABAC", "BAC2", "BLOR", "COM", "DES", "FOR", "INFO", "INT", "MAN", "NAV", "PROG", "VAC"];

let listaTareas = [
  "Revisión de unidades lineales UL",
  "Revisión de unidades abiertas UA",
  "Reunión por Teams",
  "Generación .e2",
  "Generación .e3",
  "AOYV",
  "Descanso 20'",
  "Maquillaje planchas 1000s",
  "Maquillaje planchas 3000s",
  "Generación de previas",
  "Maquillaje perfiles 4000s",
  "Maquillaje perfiles 6000s",
  "Anidado perfiles 4000s",
  "Anidado perfiles 6000s",
  "Anidado planchas 1000s",
  "Anidado planchas 3000s",
  "Generación de lotes de planchas",
  "Comida",
  "Funcionamiento de FNest",
  "Funcionamiento de FDesign",
  "Funcionamiento de FBuilder",
  "Funcionamiento de FHull",
  "Generación productos intermedios",
  "Píldora de ciberseguridad"
];

let tareas = [];
let chart = null;
let modoModal = 'proyectos';
let tipoGraficoActual = 'proyecto'; // 'proyecto', 'proyecto-bloque', 'tarea', 'evolucion'
let idiomaActual = 'es';

// --- DICCIONARIO DE TRADUCCIÓN (ESPAÑOL / GALEGO) ---
const i18n = {
  es: {
    darkOn: "Modo Claro",
    darkOff: "Modo Oscuro",
    nuevaTarea: "Nueva Tarea",
    editarTarea: "Editar Tarea",
    guardar: "+ Guardar",
    actualizar: "Actualizar",
    fecha: "Fecha",
    tarea: "Tarea",
    proyecto: "Proyecto",
    bloque: "Bloque",
    hinicio: "H. Inicio",
    hfin: "H. Fin",
    comentario: "Comentario",
    notas: "Notas",
    duracion: "Duración",
    acciones: "Acciones",
    registros: "Registros",
    totalJornada: "Total filtrado:",
    graficos: "Gráficos",
    grafProyecto: "Por proyecto",
    grafProyectoBloque: "Por Proyecto-Bloque",
    grafTarea: "Por Tareas",
    grafEvolucion: "Evolución por Fecha (Barras)",
    rangoDia: "Día actual",
    rangoSemana: "Esta semana",
    rangoMes: "Este mes",
    rangoTodo: "Todo el histórico",
    horasBloque: "Horas por Bloque",
    todosProyectos: "Todos los proyectos",
    todasTareas: "Todas las tareas",
    limpiarFiltros: "Limpiar",
    alertVacios: "Por favor, rellena los campos resaltados en rojo antes de guardar.",
    confirmBorrar: "¿Estás seguro de que deseas eliminar este registro?"
  },
  gl: {
    darkOn: "Modo Claro",
    darkOff: "Modo Escuro",
    nuevaTarea: "Nova Tarefa",
    editarTarea: "Editar Tarefa",
    guardar: "+ Gardar",
    actualizar: "Actualizar",
    fecha: "Data",
    tarea: "Tarefa",
    proyecto: "Proxecto",
    bloque: "Bloque",
    hinicio: "H. Inicio",
    hfin: "H. Fin",
    comentario: "Comentario",
    notas: "Notas",
    duracion: "Duración",
    acciones: "Accións",
    registros: "Rexistros",
    totalJornada: "Total filtrado:",
    graficos: "Gráficos",
    grafProyecto: "Por proxecto",
    grafProyectoBloque: "Por Proxecto-Bloque",
    grafTarea: "Por Tarefas",
    grafEvolucion: "Evolución por Data (Barras)",
    rangoDia: "Día actual",
    rangoSemana: "Esta semana",
    rangoMes: "Este mes",
    rangoTodo: "Todo o histórico",
    horasBloque: "Horas por Bloque",
    todosProyectos: "Tódolos proxectos",
    todasTareas: "Tódalas tarefas",
    limpiarFiltros: "Limpar",
    alertVacios: "Por favor, enche os campos resaltados en vermello antes de gardar.",
    confirmBorrar: "Estás seguro de que queres eliminar este rexistro?"
  }
};

// --- MODO OSCURO ---
const btnDarkMode = document.getElementById('btn-dark-mode');
const txtDarkMode = document.getElementById('txt-dark-mode');
const htmlRoot = document.getElementById('html-root');

btnDarkMode.addEventListener('click', () => {
  htmlRoot.classList.toggle('dark');
  const isDark = htmlRoot.classList.contains('dark');
  txtDarkMode.textContent = isDark ? i18n[idiomaActual].darkOn : i18n[idiomaActual].darkOff;
});

// --- CAMBIO DE IDIOMA ---
document.getElementById('btn-lang-es').addEventListener('click', () => cambiarIdioma('es'));
document.getElementById('btn-lang-gl').addEventListener('click', () => cambiarIdioma('gl'));

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = i18n[lang];

  // Traducir etiquetas estáticas
  txtDarkMode.textContent = htmlRoot.classList.contains('dark') ? t.darkOn : t.darkOff;
  document.getElementById('txt-menu-graficos').textContent = t.graficos;
  
  const isEditing = document.getElementById('edit-index').value !== "-1";
  document.getElementById('lbl-nueva-tarea').textContent = isEditing ? t.editarTarea : t.nuevaTarea;
  document.getElementById('btn-guardar').textContent = isEditing ? t.actualizar : t.guardar;

  document.getElementById('lbl-fecha').textContent = t.fecha;
  document.getElementById('lbl-tarea').textContent = t.tarea;
  document.getElementById('lbl-proyecto').textContent = t.proyecto;
  document.getElementById('lbl-bloque').textContent = t.bloque;
  document.getElementById('lbl-hinicio').textContent = t.hinicio;
  document.getElementById('lbl-hfin').textContent = t.hfin;
  document.getElementById('lbl-comentario').textContent = t.comentario;
  document.getElementById('lbl-notas').textContent = t.notas;
  document.getElementById('lbl-duracion').textContent = t.duracion;

  document.getElementById('lbl-registros').textContent = t.registros;
  document.getElementById('lbl-total-jornada').textContent = t.totalJornada;
  document.getElementById('lbl-horas-bloque').textContent = t.horasBloque;
  document.getElementById('btn-limpiar-filtros').textContent = t.limpiarFiltros;

  // Encabezados de Tabla
  document.getElementById('th-fecha').textContent = t.fecha;
  document.getElementById('th-tarea').textContent = t.tarea;
  document.getElementById('th-proyecto').textContent = t.proyecto;
  document.getElementById('th-bloque').textContent = t.bloque;
  document.getElementById('th-inicio').textContent = t.hinicio;
  document.getElementById('th-fin').textContent = t.hfin;
  document.getElementById('th-comentario').textContent = t.comentario;
  document.getElementById('th-notas').textContent = t.notas;
  document.getElementById('th-duracion').textContent = t.duracion;
  document.getElementById('th-acciones').textContent = t.acciones;

  // Traducir selectores de menú
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });

  renderFiltrosSelects();
  renderTabla();
}

// Cargar fecha actual
function setFechaDefecto() {
  const inputFecha = document.getElementById('fecha');
  if (inputFecha && !inputFecha.value) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    inputFecha.value = `${yyyy}-${mm}-${dd}`;
  }
}

// Renderizar Select Proyectos
function renderProyectosSelect() {
  const select = document.getElementById('proyecto');
  if (!select) return;
  const valPrevio = select.value;
  select.innerHTML = '';
  listaProyectos.forEach(proj => {
    const opt = document.createElement('option');
    opt.value = proj;
    opt.textContent = proj;
    select.appendChild(opt);
  });
  select.value = valPrevio && listaProyectos.includes(valPrevio) ? valPrevio : (listaProyectos.includes("BAC2") ? "BAC2" : listaProyectos[0]);
}

// Renderizar Select Tareas
function renderTareasSelect() {
  const select = document.getElementById('tarea');
  if (!select) return;
  const valPrevio = select.value;
  select.innerHTML = '';
  listaTareas.forEach(tar => {
    const opt = document.createElement('option');
    opt.value = tar;
    opt.textContent = tar;
    select.appendChild(opt);
  });
  if (valPrevio && listaTareas.includes(valPrevio)) select.value = valPrevio;
}

// Rellenar Opciones de los Filtros de Tabla
function renderFiltrosSelects() {
  const selProj = document.getElementById('filtro-proyecto');
  const selTar = document.getElementById('filtro-tarea');
  
  const currProj = selProj.value;
  const currTar = selTar.value;

  selProj.innerHTML = `<option value="">${i18n[idiomaActual].todosProyectos}</option>`;
  listaProyectos.forEach(p => {
    selProj.innerHTML += `<option value="${p}">${p}</option>`;
  });
  selProj.value = currProj;

  selTar.innerHTML = `<option value="">${i18n[idiomaActual].todasTareas}</option>`;
  listaTareas.forEach(t => {
    selTar.innerHTML += `<option value="${t}">${t}</option>`;
  });
  selTar.value = currTar;
}

// Calcular Duración HH:mm
function calcularDuracion() {
  const hInicio = document.getElementById('hora-inicio').value;
  const hFin = document.getElementById('hora-fin').value;
  const inputDuracion = document.getElementById('duracion');

  if (hInicio && hFin) {
    const [h1, m1] = hInicio.split(':').map(Number);
    const [h2, m2] = hFin.split(':').map(Number);

    let minInicio = h1 * 60 + m1;
    let minFin = h2 * 60 + m2;

    if (minFin >= minInicio) {
      let diff = minFin - minInicio;
      let horas = Math.floor(diff / 60);
      let minutos = diff % 60;
      inputDuracion.value = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    } else {
      inputDuracion.value = "Error";
    }
  } else {
    inputDuracion.value = "";
  }
}

// Botones Auxiliares de Horas
document.getElementById('btn-hora-actual').addEventListener('click', () => {
  const ahora = new Date();
  const hh = String(ahora.getHours()).padStart(2, '0');
  const mm = String(ahora.getMinutes()).padStart(2, '0');
  document.getElementById('hora-fin').value = `${hh}:${mm}`;
  calcularDuracion();
});

document.getElementById('btn-usar-ultima-fin').addEventListener('click', () => {
  if (tareas.length > 0) {
    const ultimaTarea = tareas[tareas.length - 1];
    if (ultimaTarea.horaFin) {
      document.getElementById('hora-inicio').value = ultimaTarea.horaFin;
      calcularDuracion();
    }
  }
});

document.getElementById('hora-inicio').addEventListener('change', calcularDuracion);
document.getElementById('hora-fin').addEventListener('change', calcularDuracion);

// --- TABLA, FILTROS Y EDICIÓN ---
const filtroFecha = document.getElementById('filtro-fecha');
const filtroProyecto = document.getElementById('filtro-proyecto');
const filtroTarea = document.getElementById('filtro-tarea');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

[filtroFecha, filtroProyecto, filtroTarea].forEach(el => {
  el.addEventListener('change', () => renderTabla());
});

btnLimpiarFiltros.addEventListener('click', () => {
  filtroFecha.value = '';
  filtroProyecto.value = '';
  filtroTarea.value = '';
  renderTabla();
});

// Renderizar Tabla con Filtros y Totales
function renderTabla() {
  const tbody = document.getElementById('tabla-registros');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  let totalMinutosFiltrados = 0;

  const fFecha = filtroFecha.value;
  const fProj = filtroProyecto.value;
  const fTar = filtroTarea.value;

  // Filtrado de la lista
  const tareasFiltradas = tareas.filter(t => {
    if (fFecha && t.fecha !== fFecha) return false;
    if (fProj && t.proyecto !== fProj) return false;
    if (fTar && t.tarea !== fTar) return false;
    return true;
  });

  tareasFiltradas.slice().reverse().forEach((t) => {
    // Sumar duración si es válida
    if (t.duracion && t.duracion !== 'Error') {
      const [h, m] = t.duracion.split(':').map(Number);
      totalMinutosFiltrados += (h * 60) + m;
    }

    const indexReal = tareas.indexOf(t);
    const tr = document.createElement('tr');
    tr.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
    tr.innerHTML = `
      <td class="p-2 border-b dark:border-gray-700">${t.fecha}</td>
      <td class="p-2 border-b dark:border-gray-700 font-medium">${t.tarea}</td>
      <td class="p-2 border-b dark:border-gray-700"><span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded">${t.proyecto}</span></td>
      <td class="p-2 border-b dark:border-gray-700">${t.bloque || '-'}</td>
      <td class="p-2 border-b dark:border-gray-700">${t.horaInicio}</td>
      <td class="p-2 border-b dark:border-gray-700">${t.horaFin || '-'}</td>
      <td class="p-2 border-b dark:border-gray-700 text-gray-600 dark:text-gray-400">${t.comentario || '-'}</td>
      <td class="p-2 border-b dark:border-gray-700 text-gray-600 dark:text-gray-400">${t.notas || '-'}</td>
      <td class="p-2 border-b dark:border-gray-700 font-bold">${t.duracion || '-'}</td>
      <td class="p-2 border-b dark:border-gray-700 text-center">
        <button onclick="prepararEdicion(${indexReal})" class="text-blue-600 dark:text-blue-400 hover:underline mr-2">✏️</button>
        <button onclick="eliminarRegistro(${indexReal})" class="text-red-600 dark:text-red-400 hover:underline">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Mostrar Total de la jornada filtrada
  const horasTot = Math.floor(totalMinutosFiltrados / 60);
  const minTot = totalMinutosFiltrados % 60;
  document.getElementById('total-horas-jornada').textContent = 
    `${String(horasTot).padStart(2, '0')}:${String(minTot).padStart(2, '0')}h`;
}

// Cargar datos en el formulario para editar
window.prepararEdicion = function(index) {
  const t = tareas[index];
  document.getElementById('edit-index').value = index;
  document.getElementById('fecha').value = t.fecha;
  document.getElementById('tarea').value = t.tarea;
  document.getElementById('proyecto').value = t.proyecto;
  document.getElementById('bloque').value = t.bloque;
  document.getElementById('hora-inicio').value = t.horaInicio;
  document.getElementById('hora-fin').value = t.horaFin;
  document.getElementById('comentario').value = t.comentario;
  document.getElementById('notas').value = t.notas;
  document.getElementById('duracion').value = t.duracion;

  document.getElementById('lbl-nueva-tarea').textContent = i18n[idiomaActual].editarTarea;
  document.getElementById('btn-guardar').textContent = i18n[idiomaActual].actualizar;
  document.getElementById('btn-cancelar-edit').classList.remove('hidden');
};

// Cancelar modo edición
document.getElementById('btn-cancelar-edit').addEventListener('click', resetearFormulario);

function resetearFormulario() {
  document.getElementById('edit-index').value = "-1";
  document.getElementById('lbl-nueva-tarea').textContent = i18n[idiomaActual].nuevaTarea;
  document.getElementById('btn-guardar').textContent = i18n[idiomaActual].guardar;
  document.getElementById('btn-cancelar-edit').classList.add('hidden');
  
  document.getElementById('comentario').value = '';
  document.getElementById('notas').value = '';
  document.getElementById('hora-fin').value = '';
  document.getElementById('duracion').value = '';
  setFechaDefecto();
}

// Eliminar Registro
window.eliminarRegistro = function(index) {
  if (confirm(i18n[idiomaActual].confirmBorrar)) {
    tareas.splice(index, 1);
    renderTabla();
    actualizarGraficoSiVisible();
  }
};

// Formulario Submit (Crear o Editar)
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const camposObligatorios = ['fecha', 'tarea', 'proyecto', 'hora-inicio', 'hora-fin'];
  let formularioValido = true;

  camposObligatorios.forEach(id => {
    const elemento = document.getElementById(id);
    elemento.classList.remove('border-red-500', 'bg-red-50');
    if (!elemento.value.trim()) {
      elemento.classList.add('border-red-500', 'bg-red-50');
      formularioValido = false;
    }
  });

  if (!formularioValido) {
    alert(i18n[idiomaActual].alertVacios);
    return;
  }

  const editIndex = parseInt(document.getElementById('edit-index').value);

  const nuevaTarea = {
    fecha: document.getElementById('fecha').value,
    tarea: document.getElementById('tarea').value,
    proyecto: document.getElementById('proyecto').value,
    bloque: document.getElementById('bloque').value,
    horaInicio: document.getElementById('hora-inicio').value,
    horaFin: document.getElementById('hora-fin').value,
    comentario: document.getElementById('comentario').value,
    notas: document.getElementById('notas').value,
    duracion: document.getElementById('duracion').value
  };

  if (editIndex >= 0) {
    tareas[editIndex] = nuevaTarea;
  } else {
    tareas.push(nuevaTarea);
  }

  const horaFinActual = nuevaTarea.horaFin;
  resetearFormulario();

  if (horaFinActual) {
    document.getElementById('hora-inicio').value = horaFinActual;
  }

  renderTabla();
  actualizarGraficoSiVisible();
});

document.querySelectorAll('#task-form input, #task-form select').forEach(elemento => {
  elemento.addEventListener('input', function() {
    this.classList.remove('border-red-500', 'bg-red-50');
  });
});

// --- MENÚ Y GRÁFICOS ---
const dropdownMenu = document.getElementById('dropdown-menu-graficos');
const panelGrafico = document.getElementById('panel-grafico');
const tituloGrafico = document.getElementById('titulo-grafico');
const contenedorBloques = document.getElementById('contenedor-resumen-bloques');
const listaResumenBloques = document.getElementById('lista-resumen-bloques');
const filtroRangoGrafico = document.getElementById('filtro-rango-grafico');

document.getElementById('btn-menu-graficos').addEventListener('click', () => dropdownMenu.classList.toggle('hidden'));
document.getElementById('btn-ocultar-grafico').addEventListener('click', () => panelGrafico.classList.add('hidden'));

document.getElementById('opcion-por-proyecto').addEventListener('click', () => {
  tipoGraficoActual = 'proyecto';
  abrirGrafico(i18n[idiomaActual].grafProyecto, true);
});

document.getElementById('opcion-por-proyecto-bloque').addEventListener('click', () => {
  tipoGraficoActual = 'proyecto-bloque';
  abrirGrafico(i18n[idiomaActual].grafProyectoBloque, false);
});

document.getElementById('opcion-por-tarea').addEventListener('click', () => {
  tipoGraficoActual = 'tarea';
  abrirGrafico(i18n[idiomaActual].grafTarea, false);
});

document.getElementById('opcion-evolucion').addEventListener('click', () => {
  tipoGraficoActual = 'evolucion';
  abrirGrafico(i18n[idiomaActual].grafEvolucion, false);
});

filtroRangoGrafico.addEventListener('change', () => actualizarGraficoSiVisible());

function abrirGrafico(titulo, mostrarBloques) {
  dropdownMenu.classList.add('hidden');
  panelGrafico.classList.remove('hidden');
  tituloGrafico.textContent = `${i18n[idiomaActual].graficos}: ${titulo}`;
  contenedorBloques.classList.toggle('hidden', !mostrarBloques);
  actualizarGraficoSiVisible();
}

function actualizarGraficoSiVisible() {
  if (panelGrafico.classList.contains('hidden')) return;

  // Filtrar tareas por rango temporal
  const rango = filtroRangoGrafico.value;
  const hoyStr = new Date().toISOString().split('T')[0];
  const ahora = new Date();

  const tareasGrafico = tareas.filter(t => {
    if (rango === 'dia') return t.fecha === hoyStr;
    if (rango === 'semana') {
      const d = new Date(t.fecha);
      const diffDias = (ahora - d) / (1000 * 60 * 60 * 24);
      return diffDias >= 0 && diffDias <= 7;
    }
    if (rango === 'mes') {
      return t.fecha.startsWith(hoyStr.substring(0, 7));
    }
    return true; // todo
  });

  if (tipoGraficoActual === 'proyecto') {
    generarGraficoCircular(tareasGrafico, t => t.proyecto);
    generarResumenBloquesConColores(tareasGrafico);
  } else if (tipoGraficoActual === 'proyecto-bloque') {
    generarGraficoCircular(tareasGrafico, t => `${t.proyecto} (${t.bloque || '-'})`);
  } else if (tipoGraficoActual === 'tarea') {
    generarGraficoCircular(tareasGrafico, t => t.tarea);
  } else if (tipoGraficoActual === 'evolucion') {
    generarGraficoEvolucionBarras(tareasGrafico);
  }
}

function generarGraficoCircular(lista, fnClave) {
  const canvas = document.getElementById('myChart');
  const ctx = canvas.getContext('2d');
  
  const datos = {};
  lista.forEach(t => {
    if (t.duracion && t.duracion !== 'Error') {
      const [h, m] = t.duracion.split(':').map(Number);
      const totalHoras = h + (m / 60);
      const clave = fnClave(t);
      datos[clave] = (datos[clave] || 0) + totalHoras;
    }
  });

  renderChart(ctx, 'doughnut', Object.keys(datos), Object.values(datos).map(v => v.toFixed(2)));
}

function generarGraficoEvolucionBarras(lista) {
  const canvas = document.getElementById('myChart');
  const ctx = canvas.getContext('2d');
  
  const datosPorFecha = {};
  lista.forEach(t => {
    if (t.duracion && t.duracion !== 'Error') {
      const [h, m] = t.duracion.split(':').map(Number);
      const totalHoras = h + (m / 60);
      datosPorFecha[t.fecha] = (datosPorFecha[t.fecha] || 0) + totalHoras;
    }
  });

  // Ordenar fechas cronológicamente
  const fechasOrdenadas = Object.keys(datosPorFecha).sort();
  const valores = fechasOrdenadas.map(f => datosPorFecha[f].toFixed(2));

  renderChart(ctx, 'bar', fechasOrdenadas, valores);
}

function renderChart(ctx, type, labels, data) {
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: 'Horas',
        data: data,
        backgroundColor: type === 'bar' ? '#3b82f6' : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: type !== 'bar' } }
    }
  });
}

function generarResumenBloquesConColores(lista) {
  listaResumenBloques.innerHTML = '';
  const horasPorBloque = {};

  lista.forEach(t => {
    if (t.duracion && t.duracion !== 'Error') {
      const [h, m] = t.duracion.split(':').map(Number);
      const totalHoras = h + (m / 60);
      const bloqueNombre = t.bloque ? t.bloque.trim() : 'Sin Bloque';
      horasPorBloque[bloqueNombre] = (horasPorBloque[bloqueNombre] || 0) + totalHoras;
    }
  });

  const entradas = Object.entries(horasPorBloque);
  if (entradas.length === 0) {
    listaResumenBloques.innerHTML = '<span class="text-xs text-gray-400">Sin datos</span>';
    return;
  }

  const valores = entradas.map(e => e[1]);
  const maxHoras = Math.max(...valores);
  const minHoras = Math.min(...valores);

  entradas.forEach(([bloque, horas]) => {
    let colorClass = "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800";

    if (horas === maxHoras && maxHoras !== minHoras) {
      colorClass = "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800 font-bold";
    } else if (horas === minHoras && maxHoras !== minHoras) {
      colorClass = "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold";
    }

    const item = document.createElement('div');
    item.className = `px-2.5 py-1 rounded border text-xs ${colorClass}`;
    item.innerHTML = `${bloque}: <span>${horas.toFixed(2)}h</span>`;
    listaResumenBloques.appendChild(item);
  });
}

// Modal Configuración Tareas/Proyectos
const modal = document.getElementById('modal-config');

document.getElementById('btn-gestionar-proyectos').addEventListener('click', () => {
  modoModal = 'proyectos';
  document.getElementById('modal-titulo').textContent = 'Gestionar Lista de Proyectos';
  renderListaModal();
  modal.classList.remove('hidden');
});

document.getElementById('btn-gestionar-tareas').addEventListener('click', () => {
  modoModal = 'tareas';
  document.getElementById('modal-titulo').textContent = 'Gestionar Lista de Tareas';
  renderListaModal();
  modal.classList.remove('hidden');
});

document.getElementById('btn-cerrar-modal').addEventListener('click', () => modal.classList.add('hidden'));

function renderListaModal() {
  const ul = document.getElementById('lista-gestor');
  if (!ul) return;
  ul.innerHTML = '';
  const lista = modoModal === 'proyectos' ? listaProyectos : listaTareas;

  lista.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = "flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700";
    li.innerHTML = `
      <span>${item}</span>
      <button onclick="eliminarItemModal(${idx})" class="text-red-500 hover:text-red-700 font-bold text-xs">Eliminar</button>
    `;
    ul.appendChild(li);
  });
}

window.eliminarItemModal = function(idx) {
  if (modoModal === 'proyectos') {
    listaProyectos.splice(idx, 1);
    renderProyectosSelect();
  } else {
    listaTareas.splice(idx, 1);
    renderTareasSelect();
  }
  renderListaModal();
  renderFiltrosSelects();
};

document.getElementById('btn-add-item').addEventListener('click', () => {
  const input = document.getElementById('nuevo-item-input');
  const val = input.value.trim();

  if (val) {
    if (modoModal === 'proyectos') {
      const projVal = val.toUpperCase();
      if (!listaProyectos.includes(projVal)) {
        listaProyectos.push(projVal);
        renderProyectosSelect();
      }
    } else {
      if (!listaTareas.includes(val)) {
        listaTareas.push(val);
        renderTareasSelect();
      }
    }
    renderListaModal();
    renderFiltrosSelects();
    input.value = '';
  }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  setFechaDefecto();
  renderProyectosSelect();
  renderTareasSelect();
  renderFiltrosSelects();
  renderTabla();
});