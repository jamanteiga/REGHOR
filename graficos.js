// SUPABASE_URL, SUPABASE_KEY, supabaseClient, TABLA, crearRegexFiltro,
// obtenerMinutosDuracion, formatearFechaISO, toggleTheme y cerrarPestana
// ahora viven en config.js

let miChart = null;
let idiomaActual = 'es';

const TEXTOS_GRAFICOS = {
  es: {
    titulo: '📈 Análisis Gráfico de Tiempos', cerrar: '❌ Cerrar', rangoRapido: 'Rango Rápido',
    ayer: 'Ayer', hoy: 'Hoy', semana: 'Semana', semanaAnterior: 'Semana anterior', mes: 'Mes', mesAnterior: 'Mes anterior', mesSelector: 'Mes', desde: 'Desde Fecha', hasta: 'Hasta Fecha',
    proyecto: 'Proyecto (*)', tarea: 'Tarea (*)', bloque: 'Bloque (*)', comentarios: 'Comentarios (*)',
    agruparPor: 'Agrupar por', optProyecto: 'Proyecto', optTarea: 'Tarea', optBloque: 'Bloque', optFecha: 'Fecha',
    tipoGrafico: 'Tipo de Gráfico', optBar: 'Barras', optLine: 'Línea', optArea: 'Área', optPie: 'Tarta', optDoughnut: 'Rosco',
    actualizar: 'Actualizar Gráfico', rendimiento: '📊 Rendimiento de Jornada', entradaSalida: '🕒 Entrada / Salida (tabla)', entradaSalidaGrafico: '📶 Entrada / Salida (gráfico)',
    entradaSalidaGraficoTitulo: 'Horario de entrada y salida', entradaSalidaGraficoEje: 'Hora del día',
    colFecha: 'Fecha', colDia: 'Día', colEntrada: 'Entrada', colSalida: 'Salida', colDuracion: 'Duración',
    sinDatosRango: 'No hay registros en el periodo seleccionado.',
    diasCortos: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    calendarioMensual: '🗓️ Calendario mensual', cierrePdf: '🧾 Cierre mensual (PDF)',
    calendarioTitulo: 'Calendario mensual', calendarioSeleccionaMes: '❌ Selecciona un Mes (o un rango Desde/Hasta dentro de un mismo mes) para ver el calendario.',
    leyendaCumplido: 'Jornada cumplida', leyendaExceso: 'Por encima de la teórica', leyendaDeficit: 'Por debajo de la teórica', leyendaNeutro: 'Sin jornada (fin de semana/festivo)',
    pdfSinMes: '❌ Selecciona un Mes (o un rango Desde/Hasta) antes de generar el cierre.',
    pdfSinLibreria: '⚠️ No se pudo cargar la librería de generación de PDF. Comprueba la conexión a internet y vuelve a intentarlo.',
    pdfCierreTitulo: 'REGHOR — Cierre mensual', pdfGenerado: 'Generado', pdfColReales: 'Reales', pdfColTeoricas: 'Teóricas', pdfColBalance: 'Balance',
    pdfTotalesProyecto: 'Totales por proyecto', pdfProyecto: 'Proyecto', pdfHoras: 'Horas',
    pdfTotalTrabajadas: 'Total horas trabajadas', pdfTotalTeoricas: 'Total jornada teórica', pdfBalance: 'Balance'
  },
  gl: {
    titulo: '📈 Análise Gráfica de Tempos', cerrar: '❌ Pechar', rangoRapido: 'Intervalo Rápido',
    ayer: 'Onte', hoy: 'Hoxe', semana: 'Semana', semanaAnterior: 'Semana anterior', mes: 'Mes', mesAnterior: 'Mes anterior', mesSelector: 'Mes', desde: 'Desde Data', hasta: 'Ata Data',
    proyecto: 'Proxecto (*)', tarea: 'Tarefa (*)', bloque: 'Bloque (*)', comentarios: 'Comentarios (*)',
    agruparPor: 'Agrupar por', optProyecto: 'Proxecto', optTarea: 'Tarefa', optBloque: 'Bloque', optFecha: 'Data',
    tipoGrafico: 'Tipo de Gráfico', optBar: 'Barras', optLine: 'Liña', optArea: 'Área', optPie: 'Torta', optDoughnut: 'Rosca',
    actualizar: 'Actualizar Gráfico', rendimiento: '📊 Rendemento da Xornada', entradaSalida: '🕒 Entrada / Saída (táboa)', entradaSalidaGrafico: '📶 Entrada / Saída (gráfico)',
    entradaSalidaGraficoTitulo: 'Horario de entrada e saída', entradaSalidaGraficoEje: 'Hora do día',
    colFecha: 'Data', colDia: 'Día', colEntrada: 'Entrada', colSalida: 'Saída', colDuracion: 'Duración',
    sinDatosRango: 'Non hai rexistros no período seleccionado.',
    diasCortos: ['Lun', 'Mar', 'Mér', 'Xov', 'Ven', 'Sáb', 'Dom'],
    calendarioMensual: '🗓️ Calendario mensual', cierrePdf: '🧾 Peche mensual (PDF)',
    calendarioTitulo: 'Calendario mensual', calendarioSeleccionaMes: '❌ Selecciona un Mes (ou un intervalo Desde/Ata dentro dun mesmo mes) para ver o calendario.',
    leyendaCumplido: 'Xornada cumprida', leyendaExceso: 'Por riba da teórica', leyendaDeficit: 'Por debaixo da teórica', leyendaNeutro: 'Sen xornada (fin de semana/festivo)',
    pdfSinMes: '❌ Selecciona un Mes (ou un intervalo Desde/Ata) antes de xerar o peche.',
    pdfSinLibreria: '⚠️ Non se puido cargar a libraría de xeración de PDF. Comproba a conexión a internet e vólveo intentar.',
    pdfCierreTitulo: 'REGHOR — Peche mensual', pdfGenerado: 'Xerado', pdfColReales: 'Reais', pdfColTeoricas: 'Teóricas', pdfColBalance: 'Balance',
    pdfTotalesProyecto: 'Totais por proxecto', pdfProyecto: 'Proxecto', pdfHoras: 'Horas',
    pdfTotalTrabajadas: 'Total horas traballadas', pdfTotalTeoricas: 'Total xornada teórica', pdfBalance: 'Balance'
  },
  en: {
    titulo: '📈 Time Chart Analysis', cerrar: '❌ Close', rangoRapido: 'Quick Range',
    ayer: 'Yesterday', hoy: 'Today', semana: 'Week', semanaAnterior: 'Last week', mes: 'Month', mesAnterior: 'Last month', mesSelector: 'Month', desde: 'From Date', hasta: 'To Date',
    proyecto: 'Project (*)', tarea: 'Task (*)', bloque: 'Block (*)', comentarios: 'Comments (*)',
    agruparPor: 'Group by', optProyecto: 'Project', optTarea: 'Task', optBloque: 'Block', optFecha: 'Date',
    tipoGrafico: 'Chart Type', optBar: 'Bar', optLine: 'Line', optArea: 'Area', optPie: 'Pie', optDoughnut: 'Doughnut',
    actualizar: 'Update Chart', rendimiento: '📊 Workday Performance', entradaSalida: '🕒 Check-in / Check-out (table)', entradaSalidaGrafico: '📶 Check-in / Check-out (chart)',
    entradaSalidaGraficoTitulo: 'Check-in and check-out times', entradaSalidaGraficoEje: 'Time of day',
    colFecha: 'Date', colDia: 'Day', colEntrada: 'Check-in', colSalida: 'Check-out', colDuracion: 'Duration',
    sinDatosRango: 'No records in the selected period.',
    diasCortos: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    calendarioMensual: '🗓️ Monthly calendar', cierrePdf: '🧾 Monthly closing (PDF)',
    calendarioTitulo: 'Monthly calendar', calendarioSeleccionaMes: '❌ Select a Month (or a From/To range within a single month) to view the calendar.',
    leyendaCumplido: 'Hours met', leyendaExceso: 'Above theoretical hours', leyendaDeficit: 'Below theoretical hours', leyendaNeutro: 'No workday (weekend/holiday)',
    pdfSinMes: '❌ Select a Month (or a From/To range) before generating the closing report.',
    pdfSinLibreria: '⚠️ Could not load the PDF generation library. Check your internet connection and try again.',
    pdfCierreTitulo: 'REGHOR — Monthly closing', pdfGenerado: 'Generated', pdfColReales: 'Actual', pdfColTeoricas: 'Theoretical', pdfColBalance: 'Balance',
    pdfTotalesProyecto: 'Totals by project', pdfProyecto: 'Project', pdfHoras: 'Hours',
    pdfTotalTrabajadas: 'Total hours worked', pdfTotalTeoricas: 'Total theoretical hours', pdfBalance: 'Balance'
  }
};

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = TEXTOS_GRAFICOS[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('btn-cerrar').textContent = t.cerrar;
  document.getElementById('lbl-rango-rapido').textContent = t.rangoRapido;
  document.getElementById('btn-ayer').textContent = t.ayer;
  document.getElementById('btn-hoy').textContent = t.hoy;
  document.getElementById('btn-semana').textContent = t.semana;
  document.getElementById('btn-semana-anterior').textContent = t.semanaAnterior;
  document.getElementById('btn-mes').textContent = t.mes;
  document.getElementById('btn-mes-anterior').textContent = t.mesAnterior;
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
  document.getElementById('btn-entrada-salida').textContent = t.entradaSalida;
  const btnEntradaSalidaGrafico = document.getElementById('btn-entrada-salida-grafico');
  if (btnEntradaSalidaGrafico) btnEntradaSalidaGrafico.textContent = t.entradaSalidaGrafico;
  document.getElementById('th-fecha').textContent = t.colFecha;
  document.getElementById('th-dia').textContent = t.colDia;
  document.getElementById('th-entrada').textContent = t.colEntrada;
  document.getElementById('th-salida').textContent = t.colSalida;
  document.getElementById('th-duracion').textContent = t.colDuracion;

  const btnCalendario = document.getElementById('btn-calendario');
  const btnCierrePdf = document.getElementById('btn-cierre-pdf');
  if (btnCalendario) btnCalendario.textContent = t.calendarioMensual;
  if (btnCierrePdf) btnCierrePdf.textContent = t.cierrePdf;

  const leyendaCumplido = document.getElementById('leyenda-cumplido');
  const leyendaExceso = document.getElementById('leyenda-exceso');
  const leyendaDeficit = document.getElementById('leyenda-deficit');
  const leyendaNeutro = document.getElementById('leyenda-neutro');
  if (leyendaCumplido) leyendaCumplido.textContent = t.leyendaCumplido;
  if (leyendaExceso) leyendaExceso.textContent = t.leyendaExceso;
  if (leyendaDeficit) leyendaDeficit.textContent = t.leyendaDeficit;
  if (leyendaNeutro) leyendaNeutro.textContent = t.leyendaNeutro;

  poblarSelectorMesesGraficos();

  // Si la tabla de Entrada/Salida ya estaba generada, se vuelve a pintar
  // para que sus filas (día de la semana, "sin datos") usen el idioma
  // recién seleccionado sin tener que pulsar otra vez el botón.
  const contenedorTabla = document.getElementById('contenedor-tabla-entrada-salida');
  if (contenedorTabla && contenedorTabla.style.display !== 'none') {
    generarTablaEntradaSalida();
  }
  // Igual que la tabla Entrada/Salida: si el calendario ya estaba generado,
  // se vuelve a pintar en el idioma nuevo.
  const contenedorCalendario = document.getElementById('contenedor-calendario');
  if (contenedorCalendario && contenedorCalendario.style.display !== 'none') {
    generarCalendarioMensual();
  }
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

// tipo: 'hoy' | 'ayer' | 'semana' | 'semana_anterior' | 'mes' | 'mes_anterior' (calcularRangoFechas vive en config.js).
function establecerRango(tipo) {
  const { desde, hasta } = calcularRangoFechas(tipo);
  document.getElementById('filtro-desde').value = desde;
  document.getElementById('filtro-hasta').value = hasta;
  const selMes = document.getElementById('filtro-mes-graficos');
  if (selMes) selMes.value = '';

  generarGrafico();
}

/** Alterna entre el lienzo del gráfico, la tabla de Entrada/Salida y el calendario mensual (vistas excluyentes). */
function mostrarVista(vista) {
  document.getElementById('contenedor-grafico').style.display = (vista === 'grafico') ? 'block' : 'none';
  document.getElementById('contenedor-tabla-entrada-salida').style.display = (vista === 'tabla') ? 'block' : 'none';
  document.getElementById('contenedor-calendario').style.display = (vista === 'calendario') ? 'block' : 'none';
}

/**
 * Determina el mes (1er y último día) sobre el que trabajan el Calendario
 * mensual y el Cierre mensual en PDF: si hay un mes elegido en el
 * desplegable "Mes" se usa ese; si no, se toma el mes de la fecha "Desde"
 * actual (o el mes en curso si tampoco hay nada puesto). Devuelve
 * {desde, hasta, anio, mes0 (0-indexado), etiqueta}.
 */
function obtenerMesSeleccionado() {
  const selMes = document.getElementById('filtro-mes-graficos');
  const meses = MESES[idiomaActual] || MESES.es;
  let anio, mes0;

  if (selMes && selMes.value) {
    const [a, m] = selMes.value.split('-').map(Number);
    anio = a; mes0 = m - 1;
  } else {
    const desdeActual = document.getElementById('filtro-desde').value;
    const base = desdeActual ? parsearFechaLocal(desdeActual) : new Date();
    anio = base.getFullYear(); mes0 = base.getMonth();
  }

  const desde = formatearFechaISO(new Date(anio, mes0, 1));
  const hasta = formatearFechaISO(new Date(anio, mes0 + 1, 0));
  const etiqueta = `${meses[mes0].charAt(0).toUpperCase() + meses[mes0].slice(1)} ${anio}`;
  return { desde, hasta, anio, mes0, etiqueta };
}

/**
 * Vista de calendario mensual: una celda por día del mes seleccionado (ver
 * obtenerMesSeleccionado), coloreada según el balance de ese día frente a
 * su jornada teórica (obtenerJornadaTeoricaMinutos/obtenerDescansoMinutos,
 * en config.js -el mismo criterio que usa index.html para el balance del
 * día-). No usa obtenerJornadaTeoricaAjustada (el ajuste especial del
 * viernes): para una vista mensual de un vistazo basta con la jornada
 * teórica fija de cada día.
 */
async function generarCalendarioMensual() {
  if (!supabaseClient) return;

  const { desde, hasta, etiqueta } = obtenerMesSeleccionado();
  const t = TEXTOS_GRAFICOS[idiomaActual] || TEXTOS_GRAFICOS.es;

  const { data, error } = await supabaseClient
    .from(TABLA)
    .select('fecha,horainicio,horafin')
    .gte('fecha', desde)
    .lte('fecha', hasta);

  if (error) {
    console.error('Error al recuperar datos para el calendario:', error);
    return;
  }

  const minutosPorFecha = {};
  (data || []).forEach(item => {
    let f = String(item.fecha || '').trim();
    if (f.includes('T')) f = f.split('T')[0];
    if (f.includes(' ')) f = f.split(' ')[0];
    if (!f) return;
    minutosPorFecha[f] = (minutosPorFecha[f] || 0) + obtenerMinutosDuracion(item.horainicio, item.horafin);
  });

  const inicioMes = parsearFechaLocal(desde);
  const finMes = parsearFechaLocal(hasta);
  const hoyStr = obtenerFechaHoyISO();

  // Huecos vacíos antes del día 1, para que el calendario empiece en lunes
  // (getDay(): 0=domingo..6=sábado -> se reindexa para que 0=lunes).
  const huecosIniciales = (inicioMes.getDay() + 6) % 7;

  let celdas = '';
  for (let i = 0; i < huecosIniciales; i++) {
    celdas += '<div class="calendario-celda calendario-celda-vacia"></div>';
  }

  for (let d = new Date(inicioMes); d <= finMes; d.setDate(d.getDate() + 1)) {
    const fStr = formatearFechaISO(d);
    const minutosBrutos = minutosPorFecha[fStr] || 0;
    const teorico = obtenerJornadaTeoricaMinutos(fStr);
    const reales = minutosBrutos > 0 ? Math.max(0, minutosBrutos - obtenerDescansoMinutos(fStr)) : 0;
    const balance = reales - teorico;

    let clase = 'cal-neutro';
    let textoHoras = '';
    if (teorico === 0) {
      clase = 'cal-neutro';
      textoHoras = reales > 0 ? formatearHorasComoHMM(reales / 60) : '';
    } else if (fStr > hoyStr) {
      clase = 'cal-pendiente';
    } else if (Math.abs(balance) <= 15) {
      clase = 'cal-cumplido';
      textoHoras = formatearHorasComoHMM(reales / 60);
    } else if (balance > 15) {
      clase = 'cal-exceso';
      textoHoras = formatearHorasComoHMM(reales / 60);
    } else {
      clase = 'cal-deficit';
      textoHoras = formatearHorasComoHMM(reales / 60);
    }

    const balanceTexto = (teorico > 0 && fStr <= hoyStr)
      ? `${balance >= 0 ? '+' : ''}${formatearHorasComoHMM(balance / 60)}`
      : '';

    celdas += `
      <div class="calendario-celda ${clase}" title="${fStr}">
        <span class="cal-dia-num">${d.getDate()}</span>
        <span class="cal-horas">${textoHoras}</span>
        ${balanceTexto ? `<span class="cal-balance"><br>${balanceTexto}</span>` : ''}
      </div>
    `;
  }

  const nombresDias = t.diasCortos.map(nombre => `<div class="calendario-dia-nombre">${nombre}</div>`).join('');

  document.getElementById('txt-calendario-titulo').textContent = `${t.calendarioTitulo}: ${etiqueta}`;
  document.getElementById('calendario-grid').innerHTML = nombresDias + celdas;

  mostrarVista('calendario');
}

/**
 * Cierre mensual en PDF: genera un PDF con el resumen diario (Entrada,
 * Salida, horas reales/teóricas/balance) y los totales por proyecto del mes
 * seleccionado (ver obtenerMesSeleccionado), usando jsPDF + el plugin
 * autoTable (cargados en graficos.html). No depende del gráfico ni de la
 * tabla Entrada/Salida en pantalla: vuelve a consultar Supabase con el
 * mismo criterio que usa esa tabla.
 */
async function generarCierreMensualPDF() {
  if (!supabaseClient) return;

  if (typeof window.jspdf === 'undefined') {
    const t0 = TEXTOS_GRAFICOS[idiomaActual] || TEXTOS_GRAFICOS.es;
    alert(t0.pdfSinLibreria);
    return;
  }

  const { desde, hasta, etiqueta } = obtenerMesSeleccionado();
  const t = TEXTOS_GRAFICOS[idiomaActual] || TEXTOS_GRAFICOS.es;

  const btn = document.getElementById('btn-cierre-pdf');
  if (btn) { btn.disabled = true; }

  try {
    const { data, error } = await supabaseClient
      .from(TABLA)
      .select('fecha,proyecto,horainicio,horafin')
      .gte('fecha', desde)
      .lte('fecha', hasta);

    if (error) {
      alert('Error de Supabase: ' + error.message);
      return;
    }

    const porFecha = {};
    const porProyecto = {};
    (data || []).forEach(item => {
      let f = String(item.fecha || '').trim();
      if (f.includes('T')) f = f.split('T')[0];
      if (f.includes(' ')) f = f.split(' ')[0];
      if (!f) return;

      if (!porFecha[f]) porFecha[f] = { entrada: null, salida: null, minutos: 0 };
      if (item.horainicio && (porFecha[f].entrada === null || item.horainicio < porFecha[f].entrada)) porFecha[f].entrada = item.horainicio;
      if (item.horafin && (porFecha[f].salida === null || item.horafin > porFecha[f].salida)) porFecha[f].salida = item.horafin;

      const minutos = obtenerMinutosDuracion(item.horainicio, item.horafin);
      porFecha[f].minutos += minutos;

      const p = item.proyecto || '—';
      porProyecto[p] = (porProyecto[p] || 0) + minutos;
    });

    const fechasOrdenadas = Object.keys(porFecha).sort();
    let totalReales = 0, totalTeoricas = 0;

    const filasDias = fechasOrdenadas.map(f => {
      const info = porFecha[f];
      const teorico = obtenerJornadaTeoricaMinutos(f);
      const reales = info.minutos > 0 ? Math.max(0, info.minutos - obtenerDescansoMinutos(f)) : 0;
      totalReales += reales;
      totalTeoricas += teorico;
      const balance = reales - teorico;
      const d = parsearFechaLocal(f);
      const nombreDia = t.diasCortos[(d.getDay() + 6) % 7];
      return [
        formatearFechaDDMMYYYY(f), nombreDia,
        info.entrada || '--:--', info.salida || '--:--',
        formatearHorasComoHMM(reales / 60), formatearHorasComoHMM(teorico / 60),
        `${balance >= 0 ? '+' : ''}${formatearHorasComoHMM(balance / 60)}`
      ];
    });

    const filasProyecto = Object.keys(porProyecto).sort().map(p => [p, formatearHorasComoHMM(porProyecto[p] / 60)]);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(15);
    doc.text(`${t.pdfCierreTitulo}: ${etiqueta}`, 14, 16);
    doc.setFontSize(9);
    doc.text(`${t.pdfGenerado}: ${new Date().toLocaleString()}`, 14, 22);

    doc.autoTable({
      startY: 27,
      head: [[t.colFecha, t.colDia, t.colEntrada, t.colSalida, t.pdfColReales, t.pdfColTeoricas, t.pdfColBalance]],
      body: filasDias,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 123, 255] }
    });

    let y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(t.pdfTotalesProyecto, 14, y);
    doc.autoTable({
      startY: y + 4,
      head: [[t.pdfProyecto, t.pdfHoras]],
      body: filasProyecto,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [23, 162, 184] }
    });

    y = doc.lastAutoTable.finalY + 10;
    const balanceTotal = totalReales - totalTeoricas;
    doc.setFontSize(10);
    doc.text(
      `${t.pdfTotalTrabajadas}: ${formatearHorasComoHMM(totalReales / 60)}    ${t.pdfTotalTeoricas}: ${formatearHorasComoHMM(totalTeoricas / 60)}    ${t.pdfBalance}: ${balanceTotal >= 0 ? '+' : ''}${formatearHorasComoHMM(balanceTotal / 60)}`,
      14, y
    );

    doc.save(`reghor_cierre_${desde}_a_${hasta}.pdf`);
  } catch (e) {
    console.error('Error al generar el cierre mensual en PDF:', e);
    alert('Error inesperado al generar el PDF.');
  } finally {
    if (btn) { btn.disabled = false; }
  }
}

async function generarGrafico() {
  if (!supabaseClient) return;
  mostrarVista('grafico');

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
  mostrarVista('grafico');

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

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY'. */
function formatearFechaDDMMYYYY(fechaISO) {
  const partes = String(fechaISO).split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaISO;
}

/**
 * Tabla de Entrada/Salida por día para el rango Desde/Hasta seleccionado
 * (los mismos campos que usan el gráfico normal y los botones rápidos de
 * arriba, así que vale tanto para "ayer" como para la semana/mes actual o
 * anterior, o cualquier periodo a medida). Por cada fecha con registros:
 * Entrada = la hora de inicio más temprana del día, Salida = la hora de fin
 * más tardía -mismo criterio que ya usa el resumen semanal de
 * Registro Semana (Semana.html/Semana.js)-, y Duración = la suma de la
 * duración de todas las tareas de ese día (bruta, sin descontar descansos).
 * No aplica los filtros de texto (Proyecto/Tarea/Bloque/Comentarios): es un
 * resumen de jornada, no un desglose por tarea.
 */
/**
 * Consulta Supabase y agrega por fecha (entrada = hora de inicio más
 * temprana del día, salida = hora de fin más tardía, minutos = suma de la
 * duración de todas las tareas) para el rango [desde, hasta]. Compartido
 * por la tabla y el gráfico de Entrada/Salida, para no repetir la misma
 * consulta y agregación dos veces.
 */
async function obtenerResumenEntradaSalida(desde, hasta) {
  const { data, error } = await supabaseClient
    .from(TABLA)
    .select('fecha,horainicio,horafin')
    .gte('fecha', desde)
    .lte('fecha', hasta);

  if (error) return { error, porFecha: {} };

  const porFecha = {};
  (data || []).forEach(item => {
    let f = String(item.fecha || '').trim();
    if (f.includes('T')) f = f.split('T')[0];
    if (f.includes(' ')) f = f.split(' ')[0];
    if (!f) return;

    if (!porFecha[f]) porFecha[f] = { entrada: null, salida: null, minutos: 0 };

    if (item.horainicio && (porFecha[f].entrada === null || item.horainicio < porFecha[f].entrada)) {
      porFecha[f].entrada = item.horainicio;
    }
    if (item.horafin && (porFecha[f].salida === null || item.horafin > porFecha[f].salida)) {
      porFecha[f].salida = item.horafin;
    }
    porFecha[f].minutos += obtenerMinutosDuracion(item.horainicio, item.horafin);
  });

  return { error: null, porFecha };
}

async function generarTablaEntradaSalida() {
  if (!supabaseClient) return;

  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  if (!desde || !hasta) {
    alert('❌ Selecciona una fecha "Desde" y una fecha "Hasta".');
    return;
  }

  const { error, porFecha } = await obtenerResumenEntradaSalida(desde, hasta);
  if (error) {
    console.error('Error al recuperar datos para Entrada/Salida:', error);
    return;
  }

  const t = TEXTOS_GRAFICOS[idiomaActual] || TEXTOS_GRAFICOS.es;
  const fechasOrdenadas = Object.keys(porFecha).sort();
  const tbody = document.getElementById('cuerpo-tabla-entrada-salida');

  if (fechasOrdenadas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${t.sinDatosRango}</td></tr>`;
  } else {
    tbody.innerHTML = fechasOrdenadas.map(f => {
      const info = porFecha[f];
      const d = parsearFechaLocal(f);
      // getDay(): 0=domingo..6=sábado -> se reindexa para que 0=lunes, igual que DIAS_CORTOS.
      const nombreDia = t.diasCortos[(d.getDay() + 6) % 7];
      return `<tr>
        <td>${formatearFechaDDMMYYYY(f)}</td>
        <td>${nombreDia}</td>
        <td>${info.entrada || '--:--'}</td>
        <td>${info.salida || '--:--'}</td>
        <td>${formatearHorasComoHMM(info.minutos / 60)}</td>
      </tr>`;
    }).join('');
  }

  mostrarVista('tabla');
}

/** 'HH:MM' -> horas en decimal (p.ej. '07:30' -> 7.5). null si no hay valor. */
function horaADecimal(horaStr) {
  if (!horaStr) return null;
  const [h, m] = horaStr.split(':').map(Number);
  return h + m / 60;
}

/**
 * Gráfico (barras "flotantes": una columna por día, desde la hora de
 * Entrada hasta la hora de Salida) del horario de entrada/salida en el
 * rango Desde/Hasta seleccionado -los mismos campos que ya usan la tabla de
 * Entrada/Salida y el gráfico normal, así que vale para cualquiera de los
 * filtros rápidos (día/semana/mes, actual o anterior) o un rango a medida-.
 * Un único color (igual que el resto de la identidad de REGHOR): no hace
 * falta leyenda porque solo hay una serie y el título ya la nombra.
 */
async function generarGraficoEntradaSalida() {
  if (!supabaseClient) return;

  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  if (!desde || !hasta) {
    alert('❌ Selecciona una fecha "Desde" y una fecha "Hasta".');
    return;
  }

  const t = TEXTOS_GRAFICOS[idiomaActual] || TEXTOS_GRAFICOS.es;
  const { error, porFecha } = await obtenerResumenEntradaSalida(desde, hasta);
  if (error) {
    console.error('Error al recuperar datos para el gráfico de Entrada/Salida:', error);
    return;
  }

  const fechasOrdenadas = Object.keys(porFecha).sort();
  if (fechasOrdenadas.length === 0) {
    alert(t.sinDatosRango);
    return;
  }

  const etiquetas = fechasOrdenadas.map(f => {
    const d = parsearFechaLocal(f);
    const nombreDia = t.diasCortos[(d.getDay() + 6) % 7];
    return `${formatearFechaCorta(f)} ${nombreDia}`;
  });
  const rangos = fechasOrdenadas.map(f => {
    const info = porFecha[f];
    const entradaDec = horaADecimal(info.entrada);
    const salidaDec = horaADecimal(info.salida);
    return [entradaDec === null ? 0 : entradaDec, salidaDec === null ? (entradaDec === null ? 0 : entradaDec) : salidaDec];
  });

  mostrarVista('grafico');
  renderizarChartEntradaSalida(etiquetas, rangos, fechasOrdenadas, porFecha);
}

/**
 * Dibuja el gráfico de barras flotantes de Entrada/Salida en el mismo
 * <canvas> que el resto de gráficos (ver mostrarVista). Serie única -> un
 * solo color (el azul de identidad de REGHOR) y sin leyenda, con el título
 * del eje ya indicando qué se ve; el tooltip da la hora exacta de entrada,
 * salida y la duración de la jornada de ese día.
 */
function renderizarChartEntradaSalida(labels, rangos, fechasISO, porFecha) {
  const canvas = document.getElementById('miGrafico');
  const ctx = canvas.getContext('2d');

  if (miChart) {
    miChart.destroy();
  }

  const t = TEXTOS_GRAFICOS[idiomaActual] || TEXTOS_GRAFICOS.es;
  const colorBase = '#007bff';

  miChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: t.entradaSalidaGraficoTitulo,
        data: rangos,
        backgroundColor: 'rgba(0, 123, 255, 0.55)',
        borderColor: colorBase,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => items[0].label,
            label: (context) => {
              const fISO = fechasISO[context.dataIndex];
              const info = porFecha[fISO];
              const duracion = formatearHorasComoHMM((info.minutos || 0) / 60);
              return [
                `${t.colEntrada}: ${info.entrada || '--:--'}`,
                `${t.colSalida}: ${info.salida || '--:--'}`,
                `${t.colDuracion}: ${duracion}`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          min: 4,
          max: 22,
          ticks: {
            stepSize: 2,
            callback: (valor) => `${String(Math.floor(valor)).padStart(2, '0')}:00`
          },
          title: { display: true, text: t.entradaSalidaGraficoEje },
          grid: { color: 'rgba(128, 128, 128, 0.15)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
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
