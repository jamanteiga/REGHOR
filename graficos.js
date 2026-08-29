const SUPABASE_URL = 'https://oppieocootkgddhazikw.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_6_pEKDfVrdKKuewB_qn_cw_fzNXPjT-';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const TABLA = 'obras';
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  setPeriodo('mes');
  generarGrafico();
});

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('btn-theme').textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
  
  if (chartInstance) {
    generarGrafico();
  }
}

// Configuración rápida de fechas: Día, Semana actual o Mes actual
function setPeriodo(tipo) {
  const hoy = new Date();
  const desdeInput = document.getElementById('filtro-desde');
  const hastaInput = document.getElementById('filtro-hasta');

  const formatearFecha = (d) => {
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
  };

  if (tipo === 'dia') {
    desdeInput.value = formatearFecha(hoy);
    hastaInput.value = formatearFecha(hoy);
  } else if (tipo === 'semana') {
    const diaSemana = hoy.getDay();
    const diffLunes = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    const lunes = new Date(hoy.setDate(diffLunes));
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    desdeInput.value = formatearFecha(lunes);
    hastaInput.value = formatearFecha(domingo);
  } else if (tipo === 'mes') {
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    desdeInput.value = formatearFecha(primerDia);
    hastaInput.value = formatearFecha(ultimoDia);
  }
}

async function generarGrafico() {
  if (!supabaseClient) return;

  const agruparPor = document.getElementById('filtro-agrupar').value;
  const tipoGrafico = document.getElementById('filtro-tipo-grafico').value;
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  const filtroTareaTexto = document.getElementById('filtro-tarea-texto').value.trim();

  let query = supabaseClient.from(TABLA).select('*');

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error al obtener datos:", error);
    return;
  }

  // Preparar Regex para el comodín de Tarea (*)
  let regexTarea = null;
  if (filtroTareaTexto) {
    const patronEspecial = filtroTareaTexto.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
    const patronRegex = '^' + patronEspecial.replace(/\*/g, '.*') + '$';
    regexTarea = new RegExp(patronRegex, 'i');
  }

  const acumulado = {};

  data.forEach(item => {
    const nombreTarea = item.tarea || '';

    // Filtrar por tarea si hay búsqueda con comodín
    if (regexTarea && !regexTarea.test(nombreTarea)) {
      return;
    }

    // Determinar la clave de agrupación
    let clave = '';
    const proy = item.proyecto || 'Sin Proyecto';
    const bloq = item.bloque || 'Sin Bloque';

    if (agruparPor === 'proyecto') {
      clave = proy;
    } else if (agruparPor === 'proyecto_bloque') {
      clave = `${proy} / ${bloq}`;
    } else if (agruparPor === 'proyecto_tarea') {
      clave = `${proy} / ${nombreTarea}`;
    } else if (agruparPor === 'tarea') {
      clave = nombreTarea || 'Sin Tarea';
    }

    const minutos = obtenerMinutosDuracion(item.horainicio, item.horafin);

    if (!acumulado[clave]) {
      acumulado[clave] = 0;
    }
    acumulado[clave] += minutos;
  });

  const etiquetas = Object.keys(acumulado);
  const horasValores = etiquetas.map(k => (acumulado[k] / 60).toFixed(2));

  renderizarChart(etiquetas, horasValores, tipoGrafico, agruparPor);
}

function renderizarChart(labels, dataValues, tipo, modoAgrupacion) {
  const ctx = document.getElementById('miGrafico').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  const coloresBase = [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
    '#6610f2', '#e83e8c', '#fd7e14', '#20c997', '#6c757d',
    '#343a40', '#00d2d3', '#ff9f43', '#ee5253', '#10ac84'
  ];

  const esOscuro = document.body.classList.contains('dark-mode');
  const colorTexto = esOscuro ? '#e0e0e0' : '#333333';

  chartInstance = new Chart(ctx, {
    type: tipo,
    data: {
      labels: labels,
      datasets: [{
        label: `Horas (${modoAgrupacion})`,
        data: dataValues,
        backgroundColor: coloresBase.slice(0, Math.max(labels.length, 15)),
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
              return ` ${context.label}: ${context.raw} hrs`;
            }
          }
        }
      },
      scales: (tipo === 'bar') ? {
        y: {
          ticks: { color: colorTexto },
          title: { display: true, text: 'Horas Trabajadas', color: colorTexto }
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