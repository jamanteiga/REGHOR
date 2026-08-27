// Datos iniciales simulados (mientras conectamos Supabase)
let tareas = [
  { fecha: '2026-08-25', categoria: 'Proyecto A', descripcion: 'Diseño de interfaz', horas: 3 },
  { fecha: '2026-08-26', categoria: 'Proyecto B', descripcion: 'Reunión de avance', horas: 1.5 },
  { fecha: '2026-08-27', categoria: 'Proyecto A', descripcion: 'Corrección de errores', horas: 2 }
];

let chart;

// Inicializar Gráfico
function initChart() {
  const ctx = document.getElementById('myChart').getContext('2d');
  
  // Agrupar horas por categoría
  const categorias = {};
  tareas.forEach(t => {
    categorias[t.categoria] = (categorias[t.categoria] || 0) + parseFloat(t.horas);
  });

  chart = new Chart(ctx, {
    type: 'pie', // Puede ser 'bar', 'doughnut', etc.
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        label: 'Horas',
        data: Object.values(categorias),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }]
    }
  });
}

// Capturar el envío del formulario
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const nuevaTarea = {
    fecha: document.getElementById('fecha').value,
    categoria: document.getElementById('categoria').value,
    descripcion: document.getElementById('descripcion').value,
    horas: document.getElementById('horas').value
  };

  tareas.push(nuevaTarea);
  
  // Actualizar gráfico y limpiar formulario
  chart.destroy();
  initChart();
  e.target.reset();
});

// Arrancar al cargar la página
window.onload = initChart;