// SUPABASE_URL, SUPABASE_KEY, supabaseClient, TABLA, crearRegexFiltro,
// obtenerMinutosDuracion, calcularDuracion, formatearMinutosAHoras,
// formatearFechaISO, obtenerFechaHoyISO, obtenerDescansoMinutos,
// toggleTheme y cerrarPestana ahora viven en config.js

let idiomaActual = 'es';

const TEXTOS_INFORME = {
  es: {
    titulo: '📊 Informes y Registros', cerrar: '❌ Cerrar', rangoRapido: 'Rango Rápido',
    hoy: 'Hoy', semanaActual: 'Semana actual', semanaAnterior: 'Semana anterior', mes: 'Mes',
    desde: 'Desde Fecha', hasta: 'Hasta Fecha', tarea: 'Tarea (*)', proyecto: 'Proyecto (*)',
    bloque: 'Bloque (*)', comentario: 'Comentario (*)', generar: 'Generar Informe',
    xlsx: '📊 Exportar XLSX', csv: '📄 Exportar CSV', pdf: '📕 Exportar PDF', thFecha: 'Fecha', thTarea: 'Tarea',
    thProyecto: 'Proyecto', thBloque: 'Bloque', thInicio: 'Hora inicio', thFin: 'Hora fin',
    thDuracion: 'Duración', thComentario: 'Comentario', thNotas: 'Notas', totalHoras: 'Total Horas:',
    anio: 'Año', balanceAnual: '📅 Balance Anual', backupJson: '💾 Backup JSON (todo)', importarJson: '📥 Importar backup',
    thbMes: 'Mes', thbTeorica: 'Jornada Teórica', thbTrabajado: 'Horas Trabajadas', thbBalance: 'Balance del Mes', thbAcumulado: 'Balance Acumulado', totalAnio: 'Total {anio}',
    balanceVacaciones: '🏖️ Vacaciones', lblDiasAnio: 'Días vacaciones/año', vacTotal: 'Días/año', vacConsumidos: 'Días consumidos', vacRestantes: 'Días restantes',
    vacImportar: '📥 Importador CSV', icsExportar: '🏖️ Exportar .ics',
    entradaSalida: '🕒 Entrada/Salida', esFecha: 'Fecha', esEntrada: 'Hora entrada', esSalida: 'Hora salida', esHorasTrabajadas: 'Horas trabajadas', esSinCerrar: 'Sin cerrar', esTotal: 'Total'
  },
  gl: {
    titulo: '📊 Informes e Rexistros', cerrar: '❌ Pechar', rangoRapido: 'Intervalo Rápido',
    hoy: 'Hoxe', semanaActual: 'Semana actual', semanaAnterior: 'Semana anterior', mes: 'Mes',
    desde: 'Desde Data', hasta: 'Ata Data', tarea: 'Tarefa (*)', proyecto: 'Proxecto (*)',
    bloque: 'Bloque (*)', comentario: 'Comentario (*)', generar: 'Xerar Informe',
    xlsx: '📊 Exportar XLSX', csv: '📄 Exportar CSV', pdf: '📕 Exportar PDF', thFecha: 'Data', thTarea: 'Tarefa',
    thProyecto: 'Proxecto', thBloque: 'Bloque', thInicio: 'Hora inicio', thFin: 'Hora fin',
    thDuracion: 'Duración', thComentario: 'Comentario', thNotas: 'Notas', totalHoras: 'Total de Horas:',
    anio: 'Ano', balanceAnual: '📅 Balance Anual', backupJson: '💾 Backup JSON (todo)', importarJson: '📥 Importar backup',
    thbMes: 'Mes', thbTeorica: 'Xornada Teórica', thbTrabajado: 'Horas Traballadas', thbBalance: 'Balance do Mes', thbAcumulado: 'Balance Acumulado', totalAnio: 'Total {anio}',
    balanceVacaciones: '🏖️ Vacacións', lblDiasAnio: 'Días vacacións/ano', vacTotal: 'Días/ano', vacConsumidos: 'Días consumidos', vacRestantes: 'Días restantes',
    vacImportar: '📥 Importador CSV', icsExportar: '🏖️ Exportar .ics',
    entradaSalida: '🕒 Entrada/Saída', esFecha: 'Data', esEntrada: 'Hora entrada', esSalida: 'Hora saída', esHorasTrabajadas: 'Horas traballadas', esSinCerrar: 'Sen pechar', esTotal: 'Total'
  },
  en: {
    titulo: '📊 Reports and Records', cerrar: '❌ Close', rangoRapido: 'Quick Range',
    hoy: 'Today', semanaActual: 'This Week', semanaAnterior: 'Last Week', mes: 'Month',
    desde: 'From Date', hasta: 'To Date', tarea: 'Task (*)', proyecto: 'Project (*)',
    bloque: 'Block (*)', comentario: 'Comment (*)', generar: 'Generate Report',
    xlsx: '📊 Export XLSX', csv: '📄 Export CSV', pdf: '📕 Export PDF', thFecha: 'Date', thTarea: 'Task',
    thProyecto: 'Project', thBloque: 'Block', thInicio: 'Start Time', thFin: 'End Time',
    thDuracion: 'Duration', thComentario: 'Comment', thNotas: 'Notes', totalHoras: 'Total Hours:',
    anio: 'Year', balanceAnual: '📅 Annual Balance', backupJson: '💾 JSON Backup (all)', importarJson: '📥 Import backup',
    thbMes: 'Month', thbTeorica: 'Theoretical Hours', thbTrabajado: 'Hours Worked', thbBalance: 'Month Balance', thbAcumulado: 'Cumulative Balance', totalAnio: 'Total {anio}',
    balanceVacaciones: '🏖️ Vacation', lblDiasAnio: 'Vacation days/year', vacTotal: 'Days/year', vacConsumidos: 'Days used', vacRestantes: 'Days left',
    vacImportar: '📥 CSV import', icsExportar: '🏖️ Export .ics',
    entradaSalida: '🕒 Clock In/Out', esFecha: 'Date', esEntrada: 'Clock in', esSalida: 'Clock out', esHorasTrabajadas: 'Hours worked', esSinCerrar: 'Not closed', esTotal: 'Total'
  }
};

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = TEXTOS_INFORME[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('btn-cerrar').textContent = t.cerrar;
  document.getElementById('lbl-rango-rapido').textContent = t.rangoRapido;
  document.getElementById('btn-hoy').textContent = t.hoy;
  document.getElementById('btn-semana-actual').textContent = t.semanaActual;
  document.getElementById('btn-semana-anterior').textContent = t.semanaAnterior;
  document.getElementById('btn-mes').textContent = t.mes;
  document.getElementById('lbl-desde').textContent = t.desde;
  document.getElementById('lbl-hasta').textContent = t.hasta;
  document.getElementById('lbl-tarea').textContent = t.tarea;
  document.getElementById('lbl-proyecto').textContent = t.proyecto;
  document.getElementById('lbl-bloque').textContent = t.bloque;
  document.getElementById('lbl-comentario').textContent = t.comentario;
  document.getElementById('btn-generar').textContent = t.generar;
  document.getElementById('btn-xlsx').textContent = t.xlsx;
  document.getElementById('btn-csv').textContent = t.csv;
  document.getElementById('btn-pdf').textContent = t.pdf;
  document.getElementById('th-fecha').textContent = t.thFecha;
  document.getElementById('th-tarea').textContent = t.thTarea;
  document.getElementById('th-proyecto').textContent = t.thProyecto;
  document.getElementById('th-bloque').textContent = t.thBloque;
  document.getElementById('th-inicio').textContent = t.thInicio;
  document.getElementById('th-fin').textContent = t.thFin;
  document.getElementById('th-duracion').textContent = t.thDuracion;
  document.getElementById('th-comentario').textContent = t.thComentario;
  document.getElementById('th-notas').textContent = t.thNotas;
  document.getElementById('txt-total-label').textContent = t.totalHoras;

  document.getElementById('lbl-anio-balance').textContent = t.anio;
  document.getElementById('btn-balance-anual').textContent = t.balanceAnual;
  document.getElementById('btn-balance-vacaciones').textContent = t.balanceVacaciones;
  document.getElementById('lbl-dias-vacaciones-anio').textContent = t.lblDiasAnio;
  document.getElementById('lbl-vac-consumidos').textContent = t.vacConsumidos;
  document.getElementById('lbl-vac-restantes').textContent = t.vacRestantes;
  document.getElementById('btn-ics').textContent = t.icsExportar;
  document.getElementById('btn-backup-json').textContent = t.backupJson;
  document.getElementById('btn-importar-json').textContent = t.importarJson;
  document.getElementById('btn-importar-csv').textContent = t.vacImportar;
  document.getElementById('thb-mes').textContent = t.thbMes;
  document.getElementById('thb-teorica').textContent = t.thbTeorica;
  document.getElementById('thb-trabajado').textContent = t.thbTrabajado;
  document.getElementById('thb-balance').textContent = t.thbBalance;
  document.getElementById('thb-acumulado').textContent = t.thbAcumulado;

  document.getElementById('btn-entrada-salida').textContent = t.entradaSalida;
  document.getElementById('thes-fecha').textContent = t.esFecha;
  document.getElementById('thes-entrada').textContent = t.esEntrada;
  document.getElementById('thes-salida').textContent = t.esSalida;
  document.getElementById('thes-horas').textContent = t.esHorasTrabajadas;
}

document.addEventListener('DOMContentLoaded', () => {
  establecerValoresPorDefecto();
  poblarSelectorAnioBalance();
  const inputDiasVac = document.getElementById('input-dias-vacaciones-anio');
  if (inputDiasVac) inputDiasVac.value = obtenerDiasVacacionesAnio();
  cargarInforme();
});

/** Rellena el desplegable de año del panel de Balance Anual: el año actual y los 6 anteriores. */
function poblarSelectorAnioBalance() {
  const sel = document.getElementById('filtro-anio-balance');
  if (!sel) return;
  const anioActual = new Date().getFullYear();
  const valorPrevio = sel.value;
  let opciones = '';
  for (let a = anioActual; a >= anioActual - 6; a--) {
    opciones += `<option value="${a}">${a}</option>`;
  }
  sel.innerHTML = opciones;
  sel.value = valorPrevio || String(anioActual);
}

function establecerValoresPorDefecto() {
  const fechaHoy = obtenerFechaHoyISO();

  document.getElementById('filtro-desde').value = fechaHoy;
  document.getElementById('filtro-hasta').value = fechaHoy;

  document.getElementById('filtro-tarea').value = '*';
  document.getElementById('filtro-proyecto').value = '*';
  document.getElementById('filtro-bloque').value = '*';
  document.getElementById('filtro-comentario').value = '*';
}

function establecerRango(tipo) {
  // El cálculo del rango (hoy/semana/semana_anterior/mes, y también
  // ayer/mes_anterior) vive ahora en config.js, compartido con los
  // filtros rápidos del propio index.html.
  const { desde, hasta } = calcularRangoFechas(tipo);

  document.getElementById('filtro-desde').value = desde;
  document.getElementById('filtro-hasta').value = hasta;

  cargarInforme();
}

async function cargarInforme() {
  if (!supabaseClient) return;

  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  const regexTarea = crearRegexFiltro(document.getElementById('filtro-tarea').value);
  const regexProyecto = crearRegexFiltro(document.getElementById('filtro-proyecto').value);
  const regexBloque = crearRegexFiltro(document.getElementById('filtro-bloque').value);
  const regexComentario = crearRegexFiltro(document.getElementById('filtro-comentario').value);

  // Supabase limita cada consulta a 1000 filas por defecto: paginamos con
  // .range() hasta traer todos los registros que cumplan el filtro de fechas.
  const TAMANO_PAGINA = 1000;
  let data = [];
  let desdeIndice = 0;

  while (true) {
    let query = supabaseClient
      .from(TABLA)
      .select('*')
      .order('fecha', { ascending: true })
      .order('horainicio', { ascending: true })
      .range(desdeIndice, desdeIndice + TAMANO_PAGINA - 1);

    if (desde) query = query.gte('fecha', desde);
    if (hasta) query = query.lte('fecha', hasta);

    const { data: pagina, error } = await query;

    if (error) {
      console.error("Error al cargar datos:", error);
      return;
    }

    data = data.concat(pagina);

    if (!pagina || pagina.length < TAMANO_PAGINA) break;
    desdeIndice += TAMANO_PAGINA;
  }

  const tbody = document.getElementById('tabla-informe-body');
  tbody.innerHTML = '';

  // Minutos brutos acumulados por fecha (solo de las filas que pasan el
  // filtro), para poder aplicar el descuento de 00:30 una vez por día —
  // el mismo criterio que usa index.html — en lugar de sumar todas las
  // filas sueltas sin distinguir a qué día pertenecen.
  const minutosPorDia = {};

  data.forEach(item => {
    const tarea = item.tarea || '';
    const proyecto = item.proyecto || '';
    const bloque = item.bloque || '';
    const comentario = item.comentario || '';

    // Evaluación del comodín '*' en los campos correspondientes
    if (regexTarea && !regexTarea.test(tarea)) return;
    if (regexProyecto && !regexProyecto.test(proyecto)) return;
    if (regexBloque && !regexBloque.test(bloque)) return;
    if (regexComentario && !regexComentario.test(comentario)) return;

    let fechaKey = String(item.fecha || '').trim();
    if (fechaKey.includes('T')) fechaKey = fechaKey.split('T')[0];
    if (fechaKey.includes(' ')) fechaKey = fechaKey.split(' ')[0];

    minutosPorDia[fechaKey] = (minutosPorDia[fechaKey] || 0) + obtenerMinutosDuracion(item.horainicio, item.horafin);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.fecha || ''}</td>
      <td>${tarea}</td>
      <td>${proyecto}</td>
      <td>${bloque}</td>
      <td>${item.horainicio || ''}</td>
      <td>${item.horafin || ''}</td>
      <td>${calcularDuracion(item.horainicio, item.horafin)}</td>
      <td>${comentario}</td>
      <td>${item.notas || ''}</td>
    `;
    tbody.appendChild(tr);
  });

  // Igual que en el registro diario (app.js): se descuentan 00:30 por cada
  // día de lunes a jueves dentro del periodo 1 sept-30 jun, para que el
  // total del informe cuadre con la suma de los "Total Horas Trabajadas"
  // diarios en vez de sumar las horas brutas sin descanso.
  let totalMinutos = 0;
  Object.keys(minutosPorDia).forEach(fechaKey => {
    let minutosDia = minutosPorDia[fechaKey];
    if (minutosDia > 0) {
      minutosDia = Math.max(0, minutosDia - obtenerDescansoMinutos(fechaKey));
    }
    totalMinutos += minutosDia;
  });

  document.getElementById('total-informe-horas').textContent = formatearMinutosAHoras(totalMinutos);
}

// Exportación a Excel nativo (.xlsx)
function exportarXLSX() {
  const tabla = document.querySelector("table");
  const filas = tabla.querySelectorAll("tr");

  if (filas.length <= 1) {
    alert("No hay datos cargados para exportar.");
    return;
  }

  const wb = XLSX.utils.table_to_book(tabla, { sheet: "Informe REGHOR" });

  const desde = document.getElementById("filtro-desde").value || "inicio";
  const hasta = document.getElementById("filtro-hasta").value || "fin";

  XLSX.writeFile(wb, `Informe_REGHOR_${desde}_a_${hasta}.xlsx`);
}

// Exportación a CSV (.csv)
function exportarCSV() {
  const tabla = document.querySelector("table");
  const filas = tabla.querySelectorAll("tr");

  if (filas.length <= 1) {
    alert("No hay datos cargados para exportar.");
    return;
  }

  let csvContent = "";

  filas.forEach((fila) => {
    const celdas = fila.querySelectorAll("th, td");
    const filaTexto = Array.from(celdas)
      .map((celda) => {
        let texto = celda.innerText.replace(/"/g, '""');
        return `"${texto}"`;
      })
      .join(";");

    csvContent += filaTexto + "\r\n";
  });

  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  const desde = document.getElementById("filtro-desde").value || "inicio";
  const hasta = document.getElementById("filtro-hasta").value || "fin";

  link.setAttribute("href", url);
  link.setAttribute("download", `Informe_REGHOR_${desde}_a_${hasta}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
}

// Exportación a PDF (jsPDF + autoTable, cargados en informes.html)
function exportarPDF() {
  const tabla = document.querySelector("table");
  const filas = tabla.querySelectorAll("tbody tr");

  if (filas.length === 0) {
    alert("No hay datos cargados para exportar.");
    return;
  }

  const t = TEXTOS_INFORME[idiomaActual];
  const desde = document.getElementById('filtro-desde').value || '-';
  const hasta = document.getElementById('filtro-hasta').value || '-';

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // El emoji inicial del título ("📊 ...") no se ve bien con la fuente por
  // defecto de jsPDF, así que se quita solo para el PDF.
  const tituloSinEmoji = t.titulo.replace(/^\S+\s+/, '');
  doc.setFontSize(14);
  doc.text(tituloSinEmoji, 40, 40);

  doc.setFontSize(10);
  let lineaFiltros = `${t.desde}: ${desde}    ${t.hasta}: ${hasta}`;

  const filtrosExtra = [
    ['filtro-tarea', t.tarea], ['filtro-proyecto', t.proyecto],
    ['filtro-bloque', t.bloque], ['filtro-comentario', t.comentario]
  ]
    .map(([id, etiqueta]) => {
      const valor = document.getElementById(id).value.trim();
      return (valor && valor !== '*') ? `${etiqueta.replace(' (*)', '')}: ${valor}` : null;
    })
    .filter(Boolean);

  if (filtrosExtra.length > 0) {
    lineaFiltros += '    ' + filtrosExtra.join('    ');
  }
  doc.text(lineaFiltros, 40, 58);

  const cabeceras = [...tabla.querySelectorAll('thead th')].map(th => th.textContent);
  const filasDatos = [...filas].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent));

  doc.autoTable({
    head: [cabeceras],
    body: filasDatos,
    foot: [[
      { content: document.getElementById('txt-total-label').textContent, colSpan: 6, styles: { halign: 'right' } },
      { content: document.getElementById('total-informe-horas').textContent, styles: { fontStyle: 'bold' } },
      '', ''
    ]],
    startY: 72,
    styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [0, 123, 255] },
    footStyles: { fillColor: [225, 238, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  doc.save(`Informe_REGHOR_${desde}_a_${hasta}.pdf`);
}

// ------------------------------------------------------------
// Exportar ausencias y vacaciones a .ics (iCalendar): un evento de día
// completo por cada fecha, dentro del rango Desde/Hasta, que tenga algún
// registro de vacaciones (proyecto VAC) o de ausencia (tareas "Ausencia no
// recuperable"/"Ausencia recuperable"). Así se pueden ver esos días en
// Google Calendar, Outlook, Apple Calendar, etc., importando el fichero.
// No depende de los filtros de texto (Tarea/Proyecto/Bloque/Comentario) de
// arriba: siempre exporta TODAS las ausencias/vacaciones del rango.
// ------------------------------------------------------------
const TAREAS_AUSENCIA_ICS = ['Ausencia no recuperable', 'Ausencia recuperable'];

/** 'YYYY-MM-DD' -> 'YYYYMMDD' (formato de fecha de iCalendar). */
function fechaISOaICS(fechaISO) {
  return String(fechaISO).replace(/-/g, '');
}

/** 'YYYY-MM-DD' -> 'YYYYMMDD' del día siguiente (DTEND de un evento de día completo es exclusivo). */
function fechaISOaICSSiguiente(fechaISO) {
  const d = parsearFechaLocal(fechaISO);
  if (!d) return fechaISOaICS(fechaISO);
  d.setDate(d.getDate() + 1);
  return fechaISOaICS(formatearFechaISO(d));
}

/** Escapa texto para un campo de iCalendar (coma, punto y coma, salto de línea). */
function escaparTextoICS(texto) {
  return String(texto || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

async function exportarAusenciasICS() {
  if (!supabaseClient) return;

  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  if (!desde || !hasta) {
    alert('❌ Selecciona una fecha "Desde" y una fecha "Hasta" antes de exportar.');
    return;
  }

  const { data, error } = await supabaseClient
    .from(TABLA)
    .select('fecha,tarea,proyecto')
    .gte('fecha', desde)
    .lte('fecha', hasta);

  if (error) {
    alert('Error de Supabase: ' + error.message);
    return;
  }

  // Un evento por fecha (no uno por registro: si un día tiene varios
  // registros de ausencia/vacaciones, cuenta como un único día en el
  // calendario), con el motivo más específico que se encuentre ese día.
  const porFecha = {};
  (data || []).forEach(item => {
    let f = String(item.fecha || '').trim();
    if (f.includes('T')) f = f.split('T')[0];
    if (f.includes(' ')) f = f.split(' ')[0];
    if (!f) return;

    let motivo = null;
    if (item.proyecto === 'VAC') motivo = 'Vacaciones';
    else if (TAREAS_AUSENCIA_ICS.includes(item.tarea)) motivo = item.tarea;
    if (!motivo) return;

    if (!porFecha[f]) porFecha[f] = motivo;
  });

  const fechas = Object.keys(porFecha).sort();
  if (fechas.length === 0) {
    alert('❌ No hay vacaciones ni ausencias registradas en ese rango.');
    return;
  }

  const ahoraICS = fechaISOaICS(obtenerFechaHoyISO()) + 'T000000Z';
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//REGHOR//Ausencias y Vacaciones//ES',
    'CALSCALE:GREGORIAN'
  ];

  fechas.forEach(f => {
    lineas.push(
      'BEGIN:VEVENT',
      `UID:reghor-ausencia-${f}@reghor`,
      `DTSTAMP:${ahoraICS}`,
      `DTSTART;VALUE=DATE:${fechaISOaICS(f)}`,
      `DTEND;VALUE=DATE:${fechaISOaICSSiguiente(f)}`,
      `SUMMARY:${escaparTextoICS(porFecha[f])}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  });

  lineas.push('END:VCALENDAR');

  // Los saltos de línea de iCalendar son siempre CRLF, aunque el resto del
  // fichero se genere en un sistema que use LF.
  const contenido = lineas.join('\r\n') + '\r\n';
  const blob = new Blob([contenido], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reghor_ausencias_${desde}_a_${hasta}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Balance de horas extra mes a mes de un año completo, con saldo
 * acumulado -el mismo criterio de jornada teórica/descanso que el resto de
 * la app (obtenerJornadaTeoricaMinutos/obtenerDescansoMinutos de
 * config.js)-. Pensado para ver de un vistazo cómo evoluciona el saldo de
 * horas extra a lo largo del año, no solo día a día o en un rango suelto.
 */
async function cargarBalanceAnual() {
  if (!supabaseClient) return;
  const anio = Number(document.getElementById('filtro-anio-balance').value);
  if (!anio) return;

  const desdeStr = `${anio}-01-01`;
  const hastaStr = `${anio}-12-31`;

  const panel = document.getElementById('panel-balance-anual');
  const tbody = document.getElementById('tabla-balance-anual-body');
  panel.style.display = '';
  tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

  const TAMANO_PAGINA = 1000;
  let data = [];
  let desdeIndice = 0;
  while (true) {
    const { data: pagina, error } = await supabaseClient
      .from(TABLA)
      .select('fecha,horainicio,horafin')
      .gte('fecha', desdeStr)
      .lte('fecha', hastaStr)
      .range(desdeIndice, desdeIndice + TAMANO_PAGINA - 1);

    if (error) {
      console.error('Error al cargar el balance anual:', error);
      tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Error Supabase: ${error.message}</td></tr>`;
      return;
    }

    data = data.concat(pagina || []);
    if (!pagina || pagina.length < TAMANO_PAGINA) break;
    desdeIndice += TAMANO_PAGINA;
  }

  // Minutos brutos trabajados por día (antes del descanso), para poder
  // aplicar el descuento una sola vez por día, igual que en el resto de la app.
  const minutosPorDia = {};
  data.forEach(item => {
    let fechaKey = String(item.fecha || '').trim();
    if (fechaKey.includes('T')) fechaKey = fechaKey.split('T')[0];
    if (fechaKey.includes(' ')) fechaKey = fechaKey.split(' ')[0];
    if (!fechaKey) return;
    minutosPorDia[fechaKey] = (minutosPorDia[fechaKey] || 0) + obtenerMinutosDuracion(item.horainicio, item.horafin);
  });

  const nombresMeses = MESES[idiomaActual] || MESES.es;
  let acumulado = 0;
  let teoricaAnual = 0;
  let trabajadoAnual = 0;
  let filasHtml = '';

  for (let mes = 0; mes < 12; mes++) {
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    let teoricaMes = 0;
    let trabajadoMes = 0;
    let cursor = new Date(primerDia);
    while (cursor <= ultimoDia) {
      const fStr = formatearFechaISO(cursor);
      teoricaMes += obtenerJornadaTeoricaMinutos(fStr);
      let minDia = minutosPorDia[fStr] || 0;
      if (minDia > 0) minDia = Math.max(0, minDia - obtenerDescansoMinutos(fStr));
      trabajadoMes += minDia;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }

    const balanceMes = trabajadoMes - teoricaMes;
    acumulado += balanceMes;
    teoricaAnual += teoricaMes;
    trabajadoAnual += trabajadoMes;

    const nombreMes = nombresMeses[mes].charAt(0).toUpperCase() + nombresMeses[mes].slice(1);
    const claseBalance = balanceMes > 0 ? 'saldo-positivo' : (balanceMes < 0 ? 'saldo-negativo' : 'saldo-neutro');
    const claseAcumulado = acumulado > 0 ? 'saldo-positivo' : (acumulado < 0 ? 'saldo-negativo' : 'saldo-neutro');
    const signoBalance = balanceMes > 0 ? '+' : '';
    const signoAcumulado = acumulado > 0 ? '+' : '';

    filasHtml += `
      <tr>
        <td>${nombreMes} ${anio}</td>
        <td>${formatearMinutosAHoras(teoricaMes)}</td>
        <td>${formatearMinutosAHoras(trabajadoMes)}</td>
        <td class="${claseBalance}">${signoBalance}${formatearMinutosAHoras(balanceMes)}</td>
        <td class="${claseAcumulado}">${signoAcumulado}${formatearMinutosAHoras(acumulado)}</td>
      </tr>
    `;
  }

  const balanceAnualTotal = trabajadoAnual - teoricaAnual;
  const claseTotal = balanceAnualTotal > 0 ? 'saldo-positivo' : (balanceAnualTotal < 0 ? 'saldo-negativo' : 'saldo-neutro');
  const signoTotal = balanceAnualTotal > 0 ? '+' : '';
  const t = TEXTOS_INFORME[idiomaActual] || TEXTOS_INFORME.es;
  const etiquetaTotal = (t.totalAnio || 'Total {anio}').replace('{anio}', anio);
  filasHtml += `
    <tr class="fila-total">
      <td>${etiquetaTotal}</td>
      <td>${formatearMinutosAHoras(teoricaAnual)}</td>
      <td>${formatearMinutosAHoras(trabajadoAnual)}</td>
      <td class="${claseTotal}">${signoTotal}${formatearMinutosAHoras(balanceAnualTotal)}</td>
      <td class="${claseTotal}">${signoTotal}${formatearMinutosAHoras(balanceAnualTotal)}</td>
    </tr>
  `;

  tbody.innerHTML = filasHtml;
}

// ------------------------------------------------------------
// Balance de vacaciones (proyecto VAC): cuenta como "día consumido" cada
// fecha del año con al menos un registro de proyecto VAC (no las horas: un
// día de vacaciones es un día entero, aunque alguna vez se registre con
// horas parciales). El total de días/año es configurable (cada convenio es
// distinto) y se recuerda en este navegador.
// ------------------------------------------------------------
const CLAVE_DIAS_VACACIONES_ANIO = 'reghor_dias_vacaciones_anio';
const DIAS_VACACIONES_DEFECTO = 23;

function obtenerDiasVacacionesAnio() {
  const guardado = Number(localStorage.getItem(CLAVE_DIAS_VACACIONES_ANIO));
  return guardado > 0 ? guardado : DIAS_VACACIONES_DEFECTO;
}

function guardarDiasVacacionesAnio(valor) {
  const n = Number(valor);
  if (n > 0) {
    try { localStorage.setItem(CLAVE_DIAS_VACACIONES_ANIO, String(n)); } catch (e) {}
  }
  cargarBalanceVacaciones();
}

async function cargarBalanceVacaciones() {
  if (!supabaseClient) return;
  const anio = Number(document.getElementById('filtro-anio-balance').value);
  if (!anio) return;

  const panel = document.getElementById('panel-balance-vacaciones');
  if (panel) panel.style.display = '';

  const desdeStr = `${anio}-01-01`;
  const hastaStr = `${anio}-12-31`;

  const { data, error } = await supabaseClient
    .from(TABLA)
    .select('fecha')
    .eq('proyecto', 'VAC')
    .gte('fecha', desdeStr)
    .lte('fecha', hastaStr);

  const t = TEXTOS_INFORME[idiomaActual] || TEXTOS_INFORME.es;
  if (error) {
    console.error('Error al cargar el balance de vacaciones:', error);
    return;
  }

  const diasConsumidos = new Set();
  (data || []).forEach(item => {
    let f = String(item.fecha || '').trim();
    if (f.includes('T')) f = f.split('T')[0];
    if (f.includes(' ')) f = f.split(' ')[0];
    if (f) diasConsumidos.add(f);
  });

  const totalDias = obtenerDiasVacacionesAnio();
  const consumidos = diasConsumidos.size;
  const restantes = totalDias - consumidos;

  document.getElementById('input-dias-vacaciones-anio').value = totalDias;
  document.getElementById('vac-consumidos').textContent = consumidos;
  const elRestantes = document.getElementById('vac-restantes');
  elRestantes.textContent = restantes;
  elRestantes.className = restantes < 0 ? 'saldo-negativo' : (restantes === 0 ? 'saldo-neutro' : 'saldo-positivo');
}

/**
 * Informe sencillo de Entrada/Salida: para cada día del rango (Desde/Hasta,
 * los mismos que el informe principal), muestra la hora de entrada (inicio
 * del primer registro del día), la hora de salida (fin del último registro
 * cerrado del día) y las horas trabajadas EFECTIVAS -mismo criterio que el
 * contador en vivo de la cabecera de index.html (actualizarContadorEfectivoYRendimiento):
 * (salida - entrada) descontando las tareas de TAREAS_PAUSA_CONTADOR (Comida,
 * Descansos, etc. - ver config.js)-. Si el último registro del día aún no
 * tiene hora de fin (jornada sin cerrar), la salida se muestra como "Sin
 * cerrar" y ese día no entra en el total de horas trabajadas.
 */
async function cargarInformeEntradaSalida() {
  if (!supabaseClient) return;

  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  const panel = document.getElementById('panel-entrada-salida');
  const tbody = document.getElementById('tabla-entrada-salida-body');
  const t = TEXTOS_INFORME[idiomaActual] || TEXTOS_INFORME.es;
  if (panel) panel.style.display = '';
  if (tbody) tbody.innerHTML = `<tr><td colspan="4">Cargando...</td></tr>`;

  // Igual que cargarInforme(): paginado, porque Supabase limita cada
  // consulta a 1000 filas por defecto.
  const TAMANO_PAGINA = 1000;
  let data = [];
  let desdeIndice = 0;
  while (true) {
    let query = supabaseClient
      .from(TABLA)
      .select('fecha,tarea,horainicio,horafin')
      .order('fecha', { ascending: true })
      .order('horainicio', { ascending: true })
      .range(desdeIndice, desdeIndice + TAMANO_PAGINA - 1);

    if (desde) query = query.gte('fecha', desde);
    if (hasta) query = query.lte('fecha', hasta);

    const { data: pagina, error } = await query;
    if (error) {
      console.error('Error al cargar el informe de entrada/salida:', error);
      if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="color:red;">Error Supabase: ${error.message}</td></tr>`;
      return;
    }

    data = data.concat(pagina || []);
    if (!pagina || pagina.length < TAMANO_PAGINA) break;
    desdeIndice += TAMANO_PAGINA;
  }

  // Agrupar por día (ya viene ordenado por fecha y luego por horainicio).
  const registrosPorDia = {};
  data.forEach(item => {
    let fechaKey = String(item.fecha || '').trim();
    if (fechaKey.includes('T')) fechaKey = fechaKey.split('T')[0];
    if (fechaKey.includes(' ')) fechaKey = fechaKey.split(' ')[0];
    if (!fechaKey || !item.horainicio) return;
    (registrosPorDia[fechaKey] = registrosPorDia[fechaKey] || []).push(item);
  });

  const fechasOrdenadas = Object.keys(registrosPorDia).sort();
  let filasHtml = '';
  let totalMinutosTrabajados = 0;

  fechasOrdenadas.forEach(fechaKey => {
    const registros = registrosPorDia[fechaKey];
    const entrada = registros[0].horainicio;

    // Salida = fin del último registro CERRADO del día (puede no ser el
    // último de la lista, si la jornada terminó con una tarea que ya se
    // cerró pero se registró después otra que no -caso raro pero posible-).
    let salida = null;
    registros.forEach(reg => {
      if (reg.horafin && (!salida || reg.horafin > salida)) salida = reg.horafin;
    });

    let fechaMostrada = fechaKey;
    const d = parsearFechaLocal(fechaKey);
    if (d) fechaMostrada = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    if (!salida) {
      filasHtml += `
        <tr>
          <td>${fechaMostrada}</td>
          <td>${entrada}</td>
          <td>${t.esSinCerrar}</td>
          <td>-</td>
        </tr>
      `;
      return;
    }

    // Minutos de pausa (Comida, Descansos...) dentro de ese tramo entrada-salida.
    let minutosPausa = 0;
    registros.forEach(reg => {
      if (!TAREAS_PAUSA_CONTADOR.includes(reg.tarea) || !reg.horafin) return;
      minutosPausa += obtenerMinutosDuracion(reg.horainicio, reg.horafin);
    });
    const minutosEfectivos = Math.max(0, obtenerMinutosDuracion(entrada, salida) - minutosPausa);
    totalMinutosTrabajados += minutosEfectivos;

    filasHtml += `
      <tr>
        <td>${fechaMostrada}</td>
        <td>${entrada}</td>
        <td>${salida}</td>
        <td>${formatearMinutosAHoras(minutosEfectivos)}</td>
      </tr>
    `;
  });

  filasHtml += `
    <tr class="fila-total">
      <td colspan="3">${t.esTotal}</td>
      <td>${formatearMinutosAHoras(totalMinutosTrabajados)}</td>
    </tr>
  `;

  if (tbody) tbody.innerHTML = filasHtml || `<tr><td colspan="4">-</td></tr>`;
}

/**
 * Backup completo: exporta TODOS los registros de la base de datos (no solo
 * el rango filtrado del informe de arriba) como un fichero JSON, para tener
 * una copia de seguridad manual descargada en el propio ordenador.
 */
async function exportarBackupJSON() {
  if (!supabaseClient) return;

  const TAMANO_PAGINA = 1000;
  let data = [];
  let desdeIndice = 0;
  while (true) {
    const { data: pagina, error } = await supabaseClient
      .from(TABLA)
      .select('*')
      .order('fecha', { ascending: true })
      .range(desdeIndice, desdeIndice + TAMANO_PAGINA - 1);

    if (error) {
      alert('Error de Supabase al generar el backup: ' + error.message);
      return;
    }

    data = data.concat(pagina || []);
    if (!pagina || pagina.length < TAMANO_PAGINA) break;
    desdeIndice += TAMANO_PAGINA;
  }

  if (data.length === 0) {
    alert('No hay registros que exportar.');
    return;
  }

  const contenido = JSON.stringify({ generado: new Date().toISOString(), total: data.length, registros: data }, null, 2);
  const blob = new Blob([contenido], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const hoyStr = obtenerFechaHoyISO();

  link.setAttribute('href', url);
  link.setAttribute('download', `REGHOR_backup_${hoyStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Restaura un backup generado por exportarBackupJSON(). Los registros se
 * insertan SIN el id original (Supabase asigna uno nuevo al insertar), para
 * no chocar con ids ya existentes en la base de datos; por eso, si se
 * importa dos veces el mismo fichero, los registros quedarán duplicados
 * -conviene revisar el resultado tras importar-.
 */
async function importarBackupJSON(event) {
  const input = event.target;
  const file = input.files && input.files[0];
  if (!file) return;

  try {
    const texto = await file.text();
    const json = JSON.parse(texto);
    const registros = Array.isArray(json) ? json : json.registros;

    if (!Array.isArray(registros) || registros.length === 0) {
      alert('El fichero no contiene registros válidos para importar.');
      input.value = '';
      return;
    }

    const confirmado = confirm(`Se van a importar ${registros.length} registros desde el backup como registros NUEVOS (no se comprueban duplicados con lo ya existente). ¿Continuar?`);
    if (!confirmado) {
      input.value = '';
      return;
    }

    // Se quita el id original de cada registro: Supabase asigna uno nuevo al insertar.
    const registrosSinId = registros.map(r => {
      const { id, ...resto } = r;
      return resto;
    });

    const TAMANO_LOTE = 500;
    let importados = 0;
    for (let i = 0; i < registrosSinId.length; i += TAMANO_LOTE) {
      const lote = registrosSinId.slice(i, i + TAMANO_LOTE);
      const { error } = await supabaseClient.from(TABLA).insert(lote);
      if (error) {
        alert(`Error al importar: ${error.message}. Se importaron ${importados} registros antes del error.`);
        input.value = '';
        return;
      }
      importados += lote.length;
    }

    alert(`✅ Importados ${importados} registros correctamente.`);
    input.value = '';
    cargarInforme();
  } catch (e) {
    console.error('Error al importar el backup:', e);
    alert('Error al leer el fichero. Comprueba que sea un backup JSON válido generado por REGHOR.');
    input.value = '';
  }
}

// ------------------------------------------------------------
// Importador de CSV: para meter de golpe registros históricos (p.ej. de un
// parte de horas anterior en Excel) en vez de escribirlos uno a uno en
// index.html. Columnas esperadas en la primera fila (cualquier orden, no
// hace falta que estén todas): fecha, tarea, proyecto, bloque, horainicio,
// horafin, comentario, notas. Solo 'fecha' es obligatoria; el resto, si
// falta la columna o una celda concreta está vacía, se guarda como "". El
// separador (';' o ',') se detecta solo mirando la primera línea.
// ------------------------------------------------------------
const COLUMNAS_CSV_RECONOCIDAS = ['fecha', 'tarea', 'proyecto', 'bloque', 'horainicio', 'horafin', 'comentario', 'notas'];

/**
 * Parser CSV mínimo pero correcto con RFC 4180: admite campos entre comillas
 * dobles que contengan el separador o saltos de línea, y comillas dobles
 * escapadas como "" dentro de un campo entre comillas.
 */
function parsearCSV(texto, separador) {
  const filas = [];
  let fila = [];
  let campo = '';
  let dentroComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentroComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; }
        else { dentroComillas = false; }
      } else {
        campo += c;
      }
    } else if (c === '"') {
      dentroComillas = true;
    } else if (c === separador) {
      fila.push(campo);
      campo = '';
    } else if (c === '\r') {
      // se ignora; el \n que le sigue cierra la fila
    } else if (c === '\n') {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else {
      campo += c;
    }
  }
  // Última fila/campo si el fichero no termina en salto de línea.
  if (campo !== '' || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter(f => f.some(celda => celda.trim() !== ''));
}

function detectarSeparadorCSV(primeraLinea) {
  const puntoComa = (primeraLinea.match(/;/g) || []).length;
  const coma = (primeraLinea.match(/,/g) || []).length;
  return puntoComa >= coma ? ';' : ',';
}

async function importarCSV(event) {
  const input = event.target;
  const file = input.files && input.files[0];
  if (!file) return;

  try {
    const texto = await file.text();
    const primeraLinea = texto.split(/\r?\n/, 1)[0] || '';
    const separador = detectarSeparadorCSV(primeraLinea);
    const filas = parsearCSV(texto, separador);

    if (filas.length < 2) {
      alert('El fichero CSV no tiene filas de datos (solo cabecera, o está vacío).');
      input.value = '';
      return;
    }

    const cabecera = filas[0].map(c => c.trim().toLowerCase());
    const indiceFecha = cabecera.indexOf('fecha');
    if (indiceFecha === -1) {
      alert('El CSV debe tener una columna "fecha" en la primera fila. Columnas encontradas: ' + filas[0].join(', '));
      input.value = '';
      return;
    }

    const indices = {};
    COLUMNAS_CSV_RECONOCIDAS.forEach(col => { indices[col] = cabecera.indexOf(col); });

    const registros = [];
    let omitidas = 0;
    for (let i = 1; i < filas.length; i++) {
      const f = filas[i];
      const fecha = (indices.fecha > -1 ? (f[indices.fecha] || '') : '').trim();
      if (!fecha) { omitidas++; continue; }

      registros.push({
        fecha,
        tarea: (indices.tarea > -1 ? (f[indices.tarea] || '') : '').trim(),
        proyecto: (indices.proyecto > -1 ? (f[indices.proyecto] || '') : '').trim(),
        bloque: (indices.bloque > -1 ? (f[indices.bloque] || '') : '').trim().toUpperCase(),
        horainicio: (indices.horainicio > -1 ? (f[indices.horainicio] || '') : '').trim(),
        horafin: (indices.horafin > -1 ? (f[indices.horafin] || '') : '').trim(),
        comentario: (indices.comentario > -1 ? (f[indices.comentario] || '') : '').trim(),
        notas: (indices.notas > -1 ? (f[indices.notas] || '') : '').trim().toUpperCase()
      });
    }

    if (registros.length === 0) {
      alert('No se encontró ninguna fila válida (con fecha) para importar.');
      input.value = '';
      return;
    }

    let mensajeConfirmacion = `Se van a importar ${registros.length} registros NUEVOS desde el CSV (no se comprueban duplicados ni solapes de horario con lo ya existente).`;
    if (omitidas > 0) mensajeConfirmacion += ` Se omitirán ${omitidas} fila(s) sin fecha.`;
    mensajeConfirmacion += ' ¿Continuar?';
    if (!confirm(mensajeConfirmacion)) {
      input.value = '';
      return;
    }

    const TAMANO_LOTE = 500;
    let importados = 0;
    for (let i = 0; i < registros.length; i += TAMANO_LOTE) {
      const lote = registros.slice(i, i + TAMANO_LOTE);
      const { error } = await supabaseClient.from(TABLA).insert(lote);
      if (error) {
        alert(`Error al importar: ${error.message}. Se importaron ${importados} registros antes del error.`);
        input.value = '';
        return;
      }
      importados += lote.length;
    }

    alert(`✅ Importados ${importados} registros correctamente desde el CSV.` + (omitidas > 0 ? ` (${omitidas} fila(s) omitidas por no tener fecha).` : ''));
    input.value = '';
    cargarInforme();
  } catch (e) {
    console.error('Error al importar el CSV:', e);
    alert('Error al leer o procesar el fichero CSV.');
    input.value = '';
  }
}
