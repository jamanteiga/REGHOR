// Lista inicial de Proyectos
let listaProyectos = ["ABAC", "BAC2", "BLOR", "COM", "DES", "FOR", "INFO", "INT", "MAN", "NAV", "PROG", "VAC"];

// Lista de registros cargados en memoria
let tareas = [];
let chart = null;

// Cargar la fecha actual por defecto en el input (formato YYYY-MM-DD)
function setFechaDefecto() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  document.getElementById('fecha').value = `${yyyy}-${mm}-${dd}`;
}

// Renderizar el desplegable de proyectos
function renderProyectosSelect() {
  const select = document.getElementById('proyecto');
  select.innerHTML = '';
  listaProyectos.forEach(proj => {
    const opt = document.createElement('option');
    opt.value = proj;
    opt.textContent = proj;
    select.appendChild(opt);
  });
}

// Calcular la duración en formato hh:mm
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

// Botón "Ahora" para rellenar automáticamente la hora fin
document.getElementById('btn-hora-actual').addEventListener('click', () => {
  const ahora = new Date();
  const hh = String(ahora.getHours()).padStart(2, '0');
  const mm = String(ahora.getMinutes()).padStart(2, '0');
  document.getElementById('hora-fin').value = `${hh}:${mm}`;
  calcularDuracion();
});

// Botón "Copiar" para usar la Hora Fin de la última tarea como Hora Inicio
document.getElementById('btn-usar-ultima-fin').addEventListener('click', () => {
  if (tareas.length > 0) {
    const ultimaTarea = tareas[tareas.length - 1];
    if (ultimaTarea.horaFin) {
      document.getElementById('hora-inicio').value = ultimaTarea.horaFin;
      calcularDuracion();
    }
  }
});

// Escuchar cambios en las horas para calcular la duración al instante
document.getElementById('hora-inicio').addEventListener('change', calcularDuracion);
document.getElementById('hora-fin').addEventListener('change', calcularDuracion);

// Renderizar la tabla con las tareas registradas
function renderTabla() {
  const tbody = document.getElementById('tabla-registros');
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
      <td class="p-2 border-b font-bold">${t.duracion || '-'}</td>
      <td class="p-2 border-b text-gray-600">${t.comentario || '-'}</td>
      <td class="p-2 border-b text-gray-600">${t.notas || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Actualizar gráfico Chart.js
function updateChart() {
  const ctx = document.getElementById('myChart').getContext('2d');
  
  // Agrupar minutos por proyecto
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

// Guardar tarea desde el formulario
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const nuevaTarea = {
    fecha: document.getElementById('fecha').value,
    tarea: document.getElementById('tarea').value,
    proyecto: document.getElementById('proyecto').value,
    bloque: document.getElementById('bloque').value,
    horaInicio: document.getElementById('hora-inicio').value,
    horaFin: document.getElementById('hora-fin').value,
    duracion: document.getElementById('duracion').value,
    comentario: document.getElementById('comentario').value,
    notas: document.getElementById('notas').value
  };

  tareas.push(nuevaTarea);
  
  // Limpiar campos y preparar para la siguiente tarea
  const horaFinActual = nuevaTarea.horaFin;
  document.getElementById('tarea').value = '';
  document.getElementById('comentario').value = '';
  document.getElementById('notas').value = '';
  document.getElementById('hora-fin').value = '';
  document.getElementById('duracion').value = '';
  
  // Asignar automáticamente la hora fin como nueva hora inicio
  if (horaFinActual) {
    document.getElementById('hora-inicio').value = horaFinActual;
  }

  renderTabla();
  updateChart();
});

// --- Modal de Gestión de Proyectos ---
const modal = document.getElementById('modal-proyectos');
document.getElementById('btn-gestionar-proyectos').addEventListener('click', () => {
  renderListaModalProyectos();
  modal.classList.remove('hidden');
});
document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
  modal.classList.add('hidden');
});

function renderListaModalProyectos() {
  const ul = document.getElementById('lista-proyectos-gestor');
  ul.innerHTML = '';
  listaProyectos.forEach((proj, idx) => {
    const li = document.createElement('li');
    li.className = "flex justify-between items-center p-2 hover:bg-gray-50";
    li.innerHTML = `
      <span>${proj}</span>
      <button onclick="eliminarProyecto(${idx})" class="text-red-500 hover:text-red-700 font-bold text-xs">Eliminar</button>
    `;
    ul.appendChild(li);
  });
}

function eliminarProyecto(idx) {
  listaProyectos.splice(idx, 1);
  renderProyectosSelect();
  renderListaModalProyectos();
}

document.getElementById('btn-add-proyecto').addEventListener('click', () => {
  const input = document.getElementById('nuevo-proyecto-input');
  const val = input.value.trim().toUpperCase();
  if (val && !listaProyectos.includes(val)) {
    listaProyectos.push(val);
    renderProyectosSelect();
    renderListaModalProyectos();
    input.value = '';
  }
});

// Inicialización al cargar la página
window.onload = () => {
  setFechaDefecto();
  renderProyectosSelect();
  updateChart();
};