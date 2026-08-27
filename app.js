// Listas predeterminadas
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
let modoModal = 'proyectos'; // 'proyectos' o 'tareas'

// Cargar la fecha actual en formato local
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

// Renderizar desplegable de Proyectos
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
}

// Renderizar desplegable de Tareas
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

// Botones auxiliares de horas
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

// Renderizar la tabla de registros
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

// Actualizar gráfico Chart.js
function updateChart() {
  const canvas = document.getElementById('myChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const proyectosMinutos = {};
  tareas.forEach(t => {
    if (t.duracion && t.duracion !== 'Error') {
      const [h, m] = t.duracion.split(':').map(Number);
      const totalHoras = h + (m / 60);
      proyectosMinutos[t.proyecto] = (proyectosMinutos[t.proyecto] || 0) + totalHoras;
    }
  });

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(proyectosMinutos),
      datasets: [{
        label: 'Horas',
        data: Object.values(proyectosMinutos).map(v => v.toFixed(2)),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
      }]
    }
  });
}

// Guardar tarea desde formulario
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();

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
  
  if (horaFinActual) {
    document.getElementById('hora-inicio').value = horaFinActual;
  }

  renderTabla();
  updateChart();
});

// --- Modal de Gestión Unificado ---
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
  updateChart();
});