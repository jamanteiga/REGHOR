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

// Cargar fecha actual
function setFechaDefecto() {
  const inputFecha = document.getElementById('fecha');
  if (inputFecha) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    inputFecha.value = `${yyyy}-${mm}-${dd}`;
  }
}

// Renderizar Proyectos
function renderProyectosSelect() {
  const select = document.getElementById('proyecto');
  if (!select) return;
  select.innerHTML = '';
  listaProyectos.forEach(proj => {
    const opt = document.createElement('option');
    opt.value = proj;
    opt.textContent = proj;
    select.appendChild(opt);
  });
  if (listaProyectos.includes("BAC2")) {
    select.value = "BAC2";
  }
}

// Renderizar Tareas
function renderTareasSelect() {
  const select = document.getElementById('tarea');
  if (!select) return;
  select.innerHTML = '';
  listaTareas.forEach(tar => {
    const opt = document.createElement('option');
    opt.value = tar;
    opt.textContent = tar;
    select.appendChild(opt);
  });
}

// Calcular Duración
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

// Renderizar Tabla
function renderTabla() {
  const tbody = document.getElementById('tabla-registros');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  tareas.slice().reverse().forEach(t => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-gray-50";
    tr.innerHTML = `
      <td class="p-2 border-b">${t.fecha}</td>
      <td class="p-2 border-b font-medium">${t.tarea}</td>
      <td class="p-2 border-b"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">${t.proyecto}</span></td>
      <td class="p-2 border-b">${t.bloque || '-'}</td>
      <td class="p-2 border-b">${t.horaInicio}</td>
      <td class="p-2 border-b">${t.horaFin || '-'}</td>
      <td class="p-2 border-b text-gray-600">${t.comentario || '-'}</td>
      <td class="p-2 border-b text-gray-600">${t.notas || '-'}</td>
      <td class="p-2 border-b font-bold">${t.duracion || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// --- LÓGICA DE GRÁFICOS Y MENÚ ---
const dropdownMenu = document.getElementById('dropdown-menu-graficos');
const panelGrafico = document.getElementById('panel-grafico');
const tituloGrafico = document.getElementById('titulo-grafico');
const contenedorBloques = document.getElementById('contenedor-resumen-bloques');
const listaResumenBloques = document.getElementById('lista-resumen-bloques');

// Abrir/Cerrar desplegable del menú
document.getElementById('btn-menu-graficos').addEventListener('click', () => {
  dropdownMenu.classList.toggle('hidden');
});

// Cerrar vistas de gráfico
document.getElementById('btn-ocultar-grafico').addEventListener('click', () => {
  panelGrafico.classList.add('hidden');
});

// Opción 1: Por Proyecto
document.getElementById('opcion-por-proyecto').addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
  panelGrafico.classList.remove('hidden');
  tituloGrafico.textContent = 'Gráficos: Por Proyecto';
  contenedorBloques.classList.remove('hidden');
  
  generarGraficoPorProyecto();
  generarResumenBloquesConColores();
});

// Opción 2: Por Proyecto-Bloque
document.getElementById('opcion-por-proyecto-bloque').addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
  panelGrafico.classList.remove('hidden');
  tituloGrafico.textContent = 'Gráficos: Por Proyecto - Bloque';
  contenedorBloques.classList.add('hidden');
  
  generarGraficoPorProyectoBloque();
});

// Generar Gráficos
function generarGraficoPorProyecto() {
  const canvas = document.getElementById('myChart');
  const ctx = canvas.getContext('2d');
  
  const datos = {};
  tareas.forEach(t => {
    if (t.duracion && t.duracion !== 'Error') {
      const [h, m] = t.duracion.split(':').map(Number);
      const totalHoras = h + (m / 60);
      datos[t.proyecto] = (datos[t.proyecto] || 0) + totalHoras;
    }
  });

  renderChart(ctx, Object.keys(datos), Object.values(datos).map(v => v.toFixed(2)));
}

function generarGraficoPorProyectoBloque() {
  const canvas = document.getElementById('myChart');
  const ctx = canvas.getContext('2d');
  
  const datos = {};
  tareas.forEach(t => {
    if (t.duracion && t.duracion !== 'Error') {
      const [h, m] = t.duracion.split(':').map(Number);
      const totalHoras = h + (m / 60);
      const clave = `${t.proyecto} (${t.bloque || 'Sin Bloque'})`;
      datos[clave] = (datos[clave] || 0) + totalHoras;
    }
  });

  renderChart(ctx, Object.keys(datos), Object.values(datos).map(v => v.toFixed(2)));
}

function renderChart(ctx, labels, data) {
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Horas',
        data: data,
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
      }]
    }
  });
}

// Resumen de horas por bloque (Rojo = Máximo, Azul = Mínimo, Verde = Resto)
function generarResumenBloquesConColores() {
  listaResumenBloques.innerHTML = '';
  
  const horasPorBloque = {};
  tareas.forEach(t => {
    if (t.duracion && t.duracion !== 'Error') {
      const [h, m] = t.duracion.split(':').map(Number);
      const totalHoras = h + (m / 60);
      const bloqueNombre = t.bloque ? t.bloque.trim() : 'Sin Bloque';
      horasPorBloque[bloqueNombre] = (horasPorBloque[bloqueNombre] || 0) + totalHoras;
    }
  });

  const entradas = Object.entries(horasPorBloque);
  if (entradas.length === 0) {
    listaResumenBloques.innerHTML = '<span class="text-xs text-gray-400">Sin datos registrados</span>';
    return;
  }

  const valores = entradas.map(e => e[1]);
  const maxHoras = Math.max(...valores);
  const minHoras = Math.min(...valores);

  entradas.forEach(([bloque, horas]) => {
    let colorClass = "bg-green-100 text-green-800 border-green-300"; // Por defecto Verde

    if (horas === maxHoras && maxHoras !== minHoras) {
      colorClass = "bg-red-100 text-red-800 border-red-300 font-bold"; // Máximo Rojo
    } else if (horas === minHoras && maxHoras !== minHoras) {
      colorClass = "bg-blue-100 text-blue-800 border-blue-300 font-bold"; // Mínimo Azul
    }

    const item = document.createElement('div');
    item.className = `px-2.5 py-1 rounded border text-xs ${colorClass}`;
    item.innerHTML = `${bloque}: <span>${horas.toFixed(2)}h</span>`;
    listaResumenBloques.appendChild(item);
  });
}

// Formulario Submit con validación
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
    alert("Por favor, rellena los campos resaltados en rojo antes de guardar.");
    return;
  }

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

  tareas.push(nuevaTarea);
  const horaFinActual = nuevaTarea.horaFin;

  document.getElementById('comentario').value = '';
  document.getElementById('notas').value = '';
  document.getElementById('hora-fin').value = '';
  document.getElementById('duracion').value = '';
  
  camposObligatorios.forEach(id => {
    document.getElementById(id).classList.remove('border-red-500', 'bg-red-50');
  });

  if (horaFinActual) {
    document.getElementById('hora-inicio').value = horaFinActual;
  }

  renderTabla();
  
  // Actualizar gráficos si la vista está activa
  if (!panelGrafico.classList.contains('hidden')) {
    if (tituloGrafico.textContent.includes('Por proyecto - Bloque')) {
      generarGraficoPorProyectoBloque();
    } else {
      generarGraficoPorProyecto();
      generarResumenBloquesConColores();
    }
  }
});

// Quitar alertas al teclear
document.querySelectorAll('#task-form input, #task-form select').forEach(elemento => {
  elemento.addEventListener('input', function() {
    this.classList.remove('border-red-500', 'bg-red-50');
  });
});

// Modal Configuración
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

document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
  modal.classList.add('hidden');
});

function renderListaModal() {
  const ul = document.getElementById('lista-gestor');
  if (!ul) return;
  ul.innerHTML = '';
  const lista = modoModal === 'proyectos' ? listaProyectos : listaTareas;

  lista.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = "flex justify-between items-center p-2 hover:bg-gray-50";
    li.innerHTML = `
      <span>${item}</span>
      <button onclick="eliminarItem(${idx})" class="text-red-500 hover:text-red-700 font-bold text-xs">Eliminar</button>
    `;
    ul.appendChild(li);
  });
}

function eliminarItem(idx) {
  if (modoModal === 'proyectos') {
    listaProyectos.splice(idx, 1);
    renderProyectosSelect();
  } else {
    listaTareas.splice(idx, 1);
    renderTareasSelect();
  }
  renderListaModal();
}

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
    input.value = '';
  }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  setFechaDefecto();
  renderProyectosSelect();
  renderTareasSelect();
});