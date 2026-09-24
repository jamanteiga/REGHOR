// SUPABASE_URL, SUPABASE_KEY, supabaseClient, TABLA, crearRegexFiltro,
// obtenerMinutosDuracion, formatearFechaISO, toggleTheme y cerrarPestana
// ahora viven en config.js

let miChart = null;
let idiomaActual = 'es';

const TEXTOS_GRAFICOS = {
  es: {
    titulo: '📈 Análisis Gráfico de Tiempos', cerrar: '❌ Cerrar', rangoRapido: 'Rango Rápido',
    hoy: 'Hoy', semana: 'Semana', semanaAnterior: 'Semana anterior', mes: 'Mes', mesSelector: 'Mes', desde: 'Desde Fecha', hasta: 'Hasta Fecha',
    proyecto: 'Proyecto (*)', tarea: 'Tarea (*)', bloque: 'Bloque (*)', comentarios: 'Comentarios (*)',
    agruparPor: 'Agrupar por', optProyecto: 'Proyecto', optTarea: 'Tarea', optBloque: 'Bloque', optFecha: 'Fecha',
    tipoGrafico: 'Tipo de Gráfico', optBar: 'Barras', optLine: 'Línea', optArea: 'Área', optPie: 'Tarta', optDoughnut: 'Rosco',
    actualizar: 'Actualizar Gráfico', rendimiento: '📊 Rendimiento de Jornada'
  },
  gl: {
    titulo: '📈 Análise Gráfica de Tempos', cerrar: '❌ Pechar', rangoRapido: 'Intervalo Rápido',
    hoy: 'Hoxe', semana: 'Semana', semanaAnterior: 'Semana anterior', mes: 'Mes', mesSelector: 'Mes', desde: 'Desde Data', hasta: 'Ata Data',
    proyecto: 'Proxecto (*)', tarea: 'Tarefa (*)', bloque: 'Bloque (*)', comentarios: 'Comentarios (*)',
    agruparPor: 'Agrupar por', optProyecto: 'Proxecto', optTarea: 'Tarefa', optBloque: 'Bloque', optFecha: 'Data',
    tipoGrafico: 'Tipo de Gráfico', optBar: 'Barras', optLine: 'Liña', optArea: 'Área', optPie: 'Torta', optDoughnut: 'Rosca',
    actualizar: 'Actualizar Gráfico', rendimiento: '📊 Rendemento da Xornada'
  },
  en: {
    titulo: '📈 Time Chart Analysis', cerrar: '❌ Close', rangoRapido: 'Quick Range',
    hoy: 'Today', semana: 'Week', semanaAnterior: 'Last week', mes: 'Month', mesSelector: 'Month', desde: 'From Date', hasta: 'To Date',
    proyecto: 'Project (*)', tarea: 'Task (*)', bloque: 'Block (*)', comentarios: 'Comments (*)',
    agruparPor: 'Group by', optProyecto: 'Project', optTarea: 'Task', optBloque: 'Block', optFecha: 'Date',
    tipoGrafico: 'Chart Type', optBar: 'Bar', optLine: 'Line', optArea: 'Area', optPie: 'Pie', optDoughnut: 'Doughnut',
    actualizar: 'Update Chart', rendimiento: '📊 Workday Performance'
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
  document.getElementById('btn-semana-anterior').textContent = t.semanaAnterior;
  document.getElementById('btn-mes').textContent = t.mes;
  document.getElementById('lbl-mes-graficos').textContent = t.mesSelector;
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
  document.getElementById('btn-rendimiento').textContent = t.rendimiento;

  poblarSelectorMesesGraficos();
}

document.addEventListener('DOMContentLoaded', () => {
  poblarSelectorMesesGraficos();
  establecerRango('mes');
});

/**
 * Rellena el desplegable "Mes" con todos los meses de enero al mes actual
 * (ambos incluidos) del año en curso, en el idioma activo -igual que en
 * index.html-, para poder fijar el rango a un mes cualquiera de este año
 * sin tener que teclear Desde/Hasta a mano.
 */
function poblarSelectorMesesGraficos() {
  const sel = document.getElementById('filtro-mes-graficos');
  if (!sel) return;

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mesActual = hoy.getMonth(); // 0-indexado
  const meses = MESES[idiomaActual] || MESES.es;

  const valorPrevio = sel.value;
  let opciones = '<option value="">--</option>';
  for (let m = 0; m <= mesActual; m++) {
    const valor = `${anio}-${String(m + 1).padStart(2, '0')}`;
    const etiqueta = meses[m].charAt(0).toUpperCase() + meses[m].slice(1);
    opciones += `<option value="${valor}">${etiqueta}</option>`;
  }
  sel.innerHTML = opciones;
  if (valorPrevio) sel.value = valorPrevio;
}

/** Fija Desde/Hasta al mes elegido en el desplegable (del 1 al último día de ese mes) y refresca el gráfico normal. */
function aplicarFiltroMesGraficos() {
  const valor = document.getElementById('filtro-mes-graficos').value; // 'YYYY-MM'
  if (!valor) return;
  const [anio, mes] = valor.split('-').map(Number);
  document.getElementById('filtro-desde').value = formatearFechaISO(new Date(anio, mes - 1, 1));
  document.getElementById('filtro-hasta').value = formatearFechaISO(new Date(anio, mes, 0));
  generarGrafico();
}

// tipo: 'hoy' | 'semana' | 'semana_anterior' | 'mes' (calcularRangoFechas vive en config.js).
function establecerRango(tipo) {
  const { desde, hasta } = calcularRangoFechas(tipo);
  document.getElementById('filtro-desde').value = desde;
  document.getElementById('filtro-hasta').value = hasta;
  const selMes = document.getElementById('filtro-mes-graficos');
  if (selMes) selMes.value = '';

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
      // Corregido: la columna en Supabase se llama 'comentario' (sin 's'),
      // no 'comentarios'. Con el filtro leyendo el campo equivocado, el
      // filtro de Comentarios nunca encontraba coincidencias reales.
      const comentario = item.comentario || '';

      if (regexProyecto && !regexProyecto.test(proyecto)) return;
      if (regexTarea && !regexTarea.test(tarea)) return;
      if (regexBloque && !regexBloque.test(bloque)) return;
      if (regexComentarios && !regexComentarios.test(comentario)) return;

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

/** 'YYYY-MM-DD' -> 'DD/MM' (etiquetas cortas del gráfico de rendimiento). */
function formatearFechaCorta(fechaISO) {
  const partes = String(fechaISO).split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}` : fechaISO;
}

/**
 * % de rendimiento (horas en los proyectos de buque -BLOR o BAC2, ver
 * PROYECTOS_RENDIMIENTO en config.js- entre la jornada teórica de cada día,
 * ver calcularPorcentajeRendimiento en config.js) por cada día laborable
 * del rango Desde/Hasta seleccionado -sirve tanto para un único día como
 * para una semana (actual o anterior), un mes (actual o cualquier otro del
 * año en curso, con el selector "Mes") o cualquier rango de fechas a
 * medida, ya que el rango lo fijan los mismos campos Desde/Hasta que usan
 * los botones rápidos y el selector de mes de más arriba-. Los fines de
 * semana y festivos (sin jornada teórica) no generan punto en el gráfico.
 * No tiene en cuenta los filtros de texto (Proyecto/Tarea/Bloque/
 * Comentarios): el rendimiento se define siempre igual (BLOR+BAC2 frente
 * al resto). Se dibuja con el mismo "Tipo de Gráfico" (barras/línea/área/
 * tarta/rosco) que el gráfico normal.
 */
async function generarGraficoRendimiento() {
  if (!supabaseClient) return;

  // Este botón depende de PROYECTOS_RENDIMIENTO/calcularPorcentajeRendimiento,
  // añadidos a config.js. Si ese fichero no se actualizó junto con graficos.js
  // (reemplazo parcial de ficheros), avisamos claramente en vez de romper con
  // un ReferenceError poco comprensible.
  if (typeof PROYECTOS_RENDIMIENTO === 'undefined' || typeof calcularPorcentajeRendimiento !== 'function') {
    alert('⚠️ No se puede calcular el rendimiento: falta actualizar config.js (parece una versión antigua). Comprueba que todos los ficheros de la app se han reemplazado juntos.');
    return;
  }

  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  const tipoGrafico = document.getElementById('tipo-grafico').value;

  if (!desde || !hasta) {
    alert('❌ Selecciona una fecha "Desde" y una fecha "Hasta" para calcular el rendimiento.');
    return;
  }

  const { data, error } = await supabaseClient
    .from(TABLA)
    .select('fecha,proyecto,horainicio,horafin')
    .gte('fecha', desde)
    .lte('fecha', hasta);

  if (error) {
    console.error('Error al recuperar datos para el rendimiento:', error);
    return;
  }

  const minutosRendimientoPorFecha = {};
  (data || []).forEach(item => {
    if (!PROYECTOS_RENDIMIENTO.includes(item.proyecto)) return;
    let f = String(item.fecha || '').trim();
    if (f.includes('T')) f = f.split('T')[0];
    if (f.includes(' ')) f = f.split(' ')[0];
    minutosRendimientoPorFecha[f] = (minutosRendimientoPorFecha[f] || 0) + obtenerMinutosDuracion(item.horainicio, item.horafin);
  });

  const etiquetas = [];
  const valores = [];
  const inicio = parsearFechaLocal(desde);
  const fin = parsearFechaLocal(hasta);
  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const fStr = formatearFechaISO(d);
    const pct = calcularPorcentajeRendimiento(minutosRendimientoPorFecha[fStr] || 0, fStr);
    if (pct === null) continue; // Fin de semana/festivo: no aplica.
    etiquetas.push(formatearFechaCorta(fStr));
    valores.push(parseFloat(pct.toFixed(1)));
  }

  renderizarChart(etiquetas, valores, tipoGrafico, 'fecha', {
    datasetLabel: '% Rendimiento (BLOR+BAC2)',
    yTitle: '% Rendimiento',
    formatoTooltip: (valor) => `${valor}%`
  });
}

/** Convierte horas en decimal (p.ej. 1.5) al formato h:mm (p.ej. "1:30"). */
function formatearHorasComoHMM(horasDecimal) {
  const totalMin = Math.round((horasDecimal || 0) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/**
 * Dibuja el gráfico. `opciones` permite reutilizar esta misma función para
 * series que no son "horas por criterio" (p.ej. el % de rendimiento por
 * fecha): datasetLabel (leyenda), yTitle (título eje Y) y formatoTooltip
 * (cómo formatear cada valor en el tooltip). Si se omite, se comporta
 * exactamente igual que antes (horas totales, formateadas como h:mm).
 */
function renderizarChart(labels, data, tipo, criterio, opciones) {
  const cfg = Object.assign({
    datasetLabel: `Horas por ${criterio.toUpperCase()}`,
    yTitle: 'Horas Totales',
    formatoTooltip: (valor) => formatearHorasComoHMM(valor)
  }, opciones || {});

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
    label: cfg.datasetLabel,
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
              return ` ${context.label || ''}: ${cfg.formatoTooltip(context.raw)}`;
            }
          }
        }
      },
      scales: ['pie', 'doughnut'].includes(tipo) ? {} : {
        y: {
          beginAtZero: true,
          title: { display: true, text: cfg.yTitle }
        },
        x: {
          title: { display: true, text: criterio.toUpperCase() }
        }
      }
    }
  });
}
