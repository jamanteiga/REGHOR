const SUPABASE_URL = 'https://oppieocootkgddhazikw.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_6_pEKDfVrdKKuewB_qn_cw_fzNXPjT-';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const TABLA = 'obras';
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Establecer por defecto el mes actual en el rango de fechas
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  
  document.getElementById('filtro-desde').value = primerDia.toISOString().split('T')[0];
  document.getElementById('filtro-hasta').value = hoy.toISOString().split('T')[0];

  generarGrafico();
});

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('btn-theme').textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
  
  // Volver a renderizar el gráfico para actualizar los colores del texto si cambia de tema
  if (chartInstance) {
    generarGrafico();
  }
}

async function generarGrafico() {
  if (!supabaseClient) return;

  const agruparPor = document.getElementById('filtro-agrupar').value; // 'proyecto' o 'tarea'
  const tipoGrafico = document.getElementById('filtro-tipo-grafico').value;
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  let query = supabaseClient.from(TABLA).select('*');

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error al obtener datos para el gráfico:", error);
    return;
  }

  // Agrupar y sumar minutos
  const acumulado = {};

  data.forEach(item => {
    const clave = item[agruparPor] || 'Sin especificar';
    const minutos = obtenerMinutosDuracion(item.horainicio, item.horafin);
    
    if (!acumulado[clave]) {
      acumulado[clave] = 0;
    }
    acumulado[clave] += minutos;
  });

  // Convertir minutos a horas decimales para representación en el gráfico
  const etiquetas = Object.keys(acumulado);
  const horasValores = etiquetas.map(clave => (acumulado[clave] / 60).toFixed(2));

  renderizarChart(etiquetas, horasValores, tipoGrafico, agruparPor);
}

function renderizarChart(labels, dataValues, tipo, campoAgrupado) {
  const ctx = document.getElementById('miGrafico').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  const coloresBase = [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
    '#6610f2', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
  ];

  const esOscuro = document.body.classList.contains('dark-mode');
  const colorTexto = esOscuro ? '#e0e0e0' : '#333333';

  chartInstance = new Chart(ctx, {
    type: tipo,
    data: {
      labels: labels,
      datasets: [{
        label: `Horas por ${campoAgrupado.toUpperCase()}`,
        data: dataValues,
        backgroundColor: coloresBase.slice(0, labels.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: colorTexto }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.label}: ${context.raw} horas`;
            }
          }
        }
      },
      scales: (tipo === 'bar') ? {
        y: {
          ticks: { color: colorTexto },
          title: { display: true, text: 'Horas Trabadas', color: colorTexto }
        },
        x: {
          ticks: { color: colorTexto }
        }
      } : {}
    }
  });
}

function obtenerMinutosDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 0;
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  let dif = (hFin * 60 + mFin) - (hIni * 60 + mIni);
  return dif < 0 ? dif + 1440 : dif;
}