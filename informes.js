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
    thbMes: 'Mes', thbTeorica: 'Jornada Teórica', thbTrabajado: 'Horas Trabajadas', thbBalance: 'Balance del Mes', thbAcumulado: 'Balance Acumulado', totalAnio: 'Total {anio}'
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
    thbMes: 'Mes', thbTeorica: 'Xornada Teórica', thbTrabajado: 'Horas Traballadas', thbBalance: 'Balance do Mes', thbAcumulado: 'Balance Acumulado', totalAnio: 'Total {anio}'
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
    thbMes: 'Month', thbTeorica: 'Theoretical Hours', thbTrabajado: 'Hours Worked', thbBalance: 'Month Balance', thbAcumulado: 'Cumulative Balance', totalAnio: 'Total {anio}'
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
  document.getElementById('btn-backup-json').textContent = t.backupJson;
  document.getElementById('btn-importar-json').textContent = t.importarJson;
  document.getElementById('thb-mes').textContent = t.thbMes;
  document.getElementById('thb-teorica').textContent = t.thbTeorica;
  document.getElementById('thb-trabajado').textContent = t.thbTrabajado;
  document.getElementById('thb-balance').textContent = t.thbBalance;
  document.getElementById('thb-acumulado').textContent = t.thbAcumulado;
}

document.addEventListener('DOMContentLoaded', () => {
  establecerValoresPorDefecto();
  poblarSelectorAnioBalance();
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
