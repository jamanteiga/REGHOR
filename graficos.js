// SUPABASE_URL, SUPABASE_KEY, supabaseClient, TABLA, crearRegexFiltro,
// toggleTheme y cerrarPestana ahora viven en config.js

let miChart = null;
let idiomaActual = 'es';

const TEXTOS_GRAFICOS = {
  es: {
    titulo: '📈 Análisis Gráfico de Tiempos', cerrar: '❌ Cerrar', rangoRapido: 'Rango Rápido',
    hoy: 'Hoy', semana: 'Semana', mes: 'Mes', desde: 'Desde Fecha', hasta: 'Hasta Fecha',
    proyecto: 'Proyecto (*)', tarea: 'Tarea (*)', bloque: 'Bloque (*)', comentarios: 'Comentarios (*)',
    agruparPor: 'Agrupar por', optProyecto: 'Proyecto', optTarea: 'Tarea', optBloque: 'Bloque', optFecha: 'Fecha',
    tipoGrafico: 'Tipo de Gráfico', optBar: 'Barras', optLine: 'Línea', optArea: 'Área', optPie: 'Tarta', optDoughnut: 'Rosco',
    actualizar: 'Actualizar Gráfico'
  },
  gl: {
    titulo: '📈 Análise Gráfica de Tempos', cerrar: '❌ Pechar', rangoRapido: 'Intervalo Rápido',
    hoy: 'Hoxe', semana: 'Semana', mes: 'Mes', desde: 'Desde Data', hasta: 'Ata Data',
    proyecto: 'Proxecto (*)', tarea: 'Tarefa (*)', bloque: 'Bloque (*)', comentarios: 'Comentarios (*)',
    agruparPor: 'Agrupar por', optProyecto: 'Proxecto', optTarea: 'Tarefa', optBloque: 'Bloque', optFecha: 'Data',
    tipoGrafico: 'Tipo de Gráfico', optBar: 'Barras', optLine: 'Liña', optArea: 'Área', optPie: 'Torta', optDoughnut: 'Rosca',
    actualizar: 'Actualizar Gráfico'
  },
  en: {
    titulo: '📈 Time Chart Analysis', cerrar: '❌ Close', rangoRapido: 'Quick Range',
    hoy: 'Today', semana: 'Week', mes: 'Month', desde: 'From Date', hasta: 'To Date',
    proyecto: 'Project (*)', tarea: 'Task (*)', bloque: 'Block (*)', comentarios: 'Comments (*)',
    agruparPor: 'Group by', optProyecto: 'Project', optTarea: 'Task', optBloque: 'Block', optFecha: 'Date',
    tipoGrafico: 'Chart Type', optBar: 'Bar', optLine: 'Line', optArea: 'Area', optPie: 'Pie', optDoughnut: 'Doughnut',
    actualizar: 'Update Chart'
  }
};

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = TEXTOS_GRAFICOS[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('btn-cerrar').textContent = t.cerrar;
  document.getElementById('lbl-rango-rapido').textContent = t.rangoRapido;
  document.getElementById('btn-hoy').textContent = t.hoy;
  document.getElementById('btn-semana').textContent = t.semana;
  document.getElementById('btn-mes').textContent = t.mes;
  document.getElementById('lbl-desde').textContent = t.desde;
  document.getElementById('lbl-hasta').textContent = t.hasta;
  document.getElementById('lbl-proyecto').textContent = t.proyecto;
  document.getElementById('lbl-tarea').textContent = t.tarea;
  document.getElementById('lbl-bloque').textContent = t.bloque;
  document.getElementById('lbl-comentarios').textContent = t.comentarios;
  document.getElementById('lbl-agrupar-por').textContent = t.agruparPor;
  document.getElementById('opt-agrupar-proyecto').textContent = t.optProyecto;
  document.getElementById('opt-agrupar-tarea').textContent = t.optTarea;
  document.getElementById('opt-agrupar-bloque').textContent = t.optBloque;
  document.getElementById('opt-agrupar-fecha').textContent = t.optFecha;
  document.getElementById('lbl-tipo-grafico').textContent = t.tipoGrafico;
  document.getElementById('opt-tipo-bar').textContent = t.optBar;
  document.getElementById('opt-tipo-line').textContent = t.optLine;
  document.getElementById('opt-tipo-area').textContent = t.optArea;
  document.getElementById('opt-tipo-pie').textContent = t.optPie;
  document.getElementById('opt-tipo-doughnut').textContent = t.optDoughnut;
  document.getElementById('btn-actualizar').textContent = t.actualizar;
}

document.addEventListener('DOMContentLoaded', () => {
  establecerRango('mes');
});

function formatearFechaISO(fecha) {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function establecerRango(tipo) {
  const hoy = new Date();
  let desde = new Date();
  let hasta = new Date();

  if (tipo === 'hoy') {
    desde = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  } else if (tipo === 'semana') {
    const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay();
    desde = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (diaSemana - 1));
    hasta = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + 6);
  } else if (tipo === 'mes') {
    desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  }

  document.getElementById('filtro-desde').value = formatearFechaISO(desde);
  document.getElementById('filtro-hasta').value = formatearFechaISO(hasta);

  generarGrafico();
}

async function generarGrafico() {
  if (!supabaseClient) return;

  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  const campoProyecto = document.getElementById('filtro-proyecto').value;
  const campoTarea = document.getElementById('filtro-tarea').value;
  const campoBloque = document.getElementById('filtro-bloque').value;
  const campoComentarios = document.getElementById('filtro-comentarios').value;
  const agruparPor = document.getElementById('agrupar-por').value;
  const tipoGrafico = document.getElementById('tipo-grafico').value;

  const regexProyecto = crearRegexFiltro(campoProyecto);
  const regexTarea = crearRegexFiltro(campoTarea);
  const regexBloque = crearRegexFiltro(campoBloque);
  const regexComentarios = crearRegexFiltro(campoComentarios);

  let query = supabaseClient.from(TABLA).select('*').order('fecha', { ascending: true });

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);

  const { data, error } = await query;

  if (error) {
    console.error("Error al recuperar datos:", error);
    return;
  }

  const acumulado = {};

  if (data) {
    data.forEach(item => {
      const proyecto = item.proyecto || '';
      const tarea = item.tarea || '';
      const bloque = item.bloque || '';
      const comentarios = item.comentarios || '';

      if (regexProyecto && !regexProyecto.test(proyecto)) return;
      if (regexTarea && !regexTarea.test(tarea)) return;
      if (regexBloque && !regexBloque.test(bloque)) return;
      if (regexComentarios && !regexComentarios.test(comentarios)) return;

      let clave = item[agruparPor] || 'Sin Clasificar';
      const duracion = obtenerMinutosDuracion(item.horainicio, item.horafin) / 60;

      if (!acumulado[clave]) acumulado[clave] = 0;
      acumulado[clave] += duracion;
    });
  }

  const etiquetas = Object.keys(acumulado);
  const valores = Object.values(acumulado).map(v => parseFloat(v.toFixed(2)));

  renderizarChart(etiquetas, valores, tipoGrafico, agruparPor);
}

function renderizarChart(labels, data, tipo, criterio) {
  const canvas = document.getElementById('miGrafico');
  const ctx = canvas.getContext('2d');

  if (miChart) {
    miChart.destroy();
  }

  const coloresBase = [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'
  ];

  let chartType = tipo;
  let datasetConfig = {
    label: `Horas por ${criterio.toUpperCase()}`,
    data: data,
    backgroundColor: coloresBase,
    borderColor: coloresBase,
    borderWidth: 1
  };

  if (tipo === 'area') {
    chartType = 'line';
    datasetConfig.fill = true;
    datasetConfig.backgroundColor = 'rgba(0, 123, 255, 0.3)';
    datasetConfig.borderColor = '#007bff';
  } else if (tipo === 'line') {
    datasetConfig.fill = false;
    datasetConfig.borderColor = '#007bff';
    datasetConfig.backgroundColor = '#007bff';
    datasetConfig.borderWidth = 2;
    datasetConfig.tension = 0.2;
  }

  miChart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [datasetConfig]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: ['pie', 'doughnut'].includes(tipo),
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.label || ''}: ${context.raw} horas`;
            }
          }
        }
      },
      scales: ['pie', 'doughnut'].includes(tipo) ? {} : {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Horas Totales' }
        },
        x: {
          title: { display: true, text: criterio.toUpperCase() }
        }
      }
    }
  });
}
