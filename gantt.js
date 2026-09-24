// SUPABASE_URL, SUPABASE_KEY, supabaseClient, TABLA, formatearFechaISO,
// formatearMinutosAHoras, parsearFechaLocal, calcularRangoFechas,
// obtenerFechaHoyISO, toggleTheme y cerrarPestana viven en config.js.

let idiomaActual = 'es';
let ultimosDatosGantt = [];
let agruparPorProyecto = false; // false = Bloque (por defecto), true = Proyecto

// Solo español y gallego -pedido explícitamente para esta página, a
// diferencia de graficos.html/informes.html que además tienen inglés-.
const TEXTOS_GANTT = {
  es: {
    titulo: '📅 Diagrama de Gantt', cerrar: '❌ Cerrar', rangoRapido: 'Rango Rápido',
    hoy: 'Hoy', semana: 'Semana actual', semanaAnterior: 'Semana anterior',
    mes: 'Mes actual', mesAnterior: 'Mes anterior',
    desde: 'Desde Fecha', hasta: 'Hasta Fecha', generar: 'Generar Gantt',
    registros: 'registros', filasTexto: 'tareas distintas',
    sinDatos: 'No hay registros en el rango de fechas seleccionado.',
    colNum: '#', colTarea: 'Tarea', colBloque: 'Bloque', colProyecto: 'Proyecto', colDuracion: 'Duración',
    ahora: 'Ahora', agruparPor: 'Agrupar por', porBloque: 'Bloque', porProyecto: 'Proyecto',
    tituloColorProyecto: 'Haz clic para elegir un color para este proyecto',
    exportarPlaceholder: '⬇️ Exportar', exportarSinDatos: 'No hay ningún Gantt generado para exportar. Genera uno primero.',
    exportarGuardado: 'Archivo exportado correctamente.'
  },
  gl: {
    titulo: '📅 Diagrama de Gantt', cerrar: '❌ Pechar', rangoRapido: 'Intervalo Rápido',
    hoy: 'Hoxe', semana: 'Semana actual', semanaAnterior: 'Semana anterior',
    mes: 'Mes actual', mesAnterior: 'Mes anterior',
    desde: 'Desde Data', hasta: 'Ata Data', generar: 'Xerar Gantt',
    registros: 'rexistros', filasTexto: 'tarefas distintas',
    sinDatos: 'Non hai rexistros no intervalo de datas seleccionado.',
    colNum: '#', colTarea: 'Tarefa', colBloque: 'Bloque', colProyecto: 'Proxecto', colDuracion: 'Duración',
    ahora: 'Agora', agruparPor: 'Agrupar por', porBloque: 'Bloque', porProyecto: 'Proxecto',
    tituloColorProyecto: 'Fai clic para escoller unha cor para este proxecto',
    exportarPlaceholder: '⬇️ Exportar', exportarSinDatos: 'Non hai ningún Gantt xerado para exportar. Xera un primeiro.',
    exportarGuardado: 'Ficheiro exportado correctamente.'
  }
};

// Misma paleta que graficos.js, para que los colores por proyecto resulten
// familiares en toda la app. Es el color de PARTIDA de cada proyecto nuevo;
// si José elige un color personalizado desde la leyenda, ese sustituye a
// este para siempre (se guarda en localStorage, ver más abajo).
const COLORES_BASE_GANTT = [
  '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
  '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'
];

const CLAVE_COLORES_PROYECTO = 'reghor_colores_proyecto_v1';

/** Lee el mapa {proyecto: '#rrggbb'} de colores elegidos a mano por José. */
function obtenerColoresPersonalizados() {
  try {
    const raw = localStorage.getItem(CLAVE_COLORES_PROYECTO);
    const datos = raw ? JSON.parse(raw) : null;
    return (datos && typeof datos === 'object' && !Array.isArray(datos)) ? datos : {};
  } catch (e) {
    return {};
  }
}

/** Guarda el color elegido a mano para un proyecto concreto (persiste entre sesiones). */
function guardarColorPersonalizado(proyecto, color) {
  const datos = obtenerColoresPersonalizados();
  datos[proyecto] = color;
  try {
    localStorage.setItem(CLAVE_COLORES_PROYECTO, JSON.stringify(datos));
  } catch (e) {
    // localStorage no disponible: el color elegido no se recordará, pero no rompe nada más.
  }
}

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = TEXTOS_GANTT[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('btn-cerrar').textContent = t.cerrar;
  document.getElementById('lbl-rango-rapido').textContent = t.rangoRapido;
  document.getElementById('btn-hoy').textContent = t.hoy;
  document.getElementById('btn-semana').textContent = t.semana;
  document.getElementById('btn-semana-anterior').textContent = t.semanaAnterior;
  document.getElementById('btn-mes').textContent = t.mes;
  document.getElementById('btn-mes-anterior').textContent = t.mesAnterior;
  document.getElementById('lbl-desde').textContent = t.desde;
  document.getElementById('lbl-hasta').textContent = t.hasta;
  document.getElementById('btn-generar-gantt').textContent = t.generar;
  document.getElementById('lbl-agrupar-por').textContent = t.agruparPor;
  document.getElementById('btn-agrupar-bloque').textContent = t.porBloque;
  document.getElementById('btn-agrupar-proyecto').textContent = t.porProyecto;
  document.getElementById('opt-exportar-placeholder').textContent = t.exportarPlaceholder;

  // Volver a pintar para actualizar cabeceras de columna, resumen y mensaje
  // vacío al nuevo idioma (las barras y colores no cambian, solo los textos).
  procesarYRenderizarGantt(ultimosDatosGantt);
}

document.addEventListener('DOMContentLoaded', () => {
  establecerRangoGantt('hoy');
});

// tipo: 'hoy' | 'semana' | 'semana_anterior' | 'mes' | 'mes_anterior'
// (calcularRangoFechas vive en config.js).
function establecerRangoGantt(tipo) {
  const { desde, hasta } = calcularRangoFechas(tipo);
  document.getElementById('filtro-desde').value = desde;
  document.getElementById('filtro-hasta').value = hasta;
  generarGantt();
}

/** Cambia si las filas del Gantt se agrupan (y la 2ª columna) por Bloque o por Proyecto. No hace falta volver a consultar Supabase: se repinta con los mismos datos ya cargados. */
function cambiarAgrupacionGantt(porProyecto) {
  agruparPorProyecto = porProyecto;
  document.getElementById('btn-agrupar-bloque').classList.toggle('activo', !porProyecto);
  document.getElementById('btn-agrupar-proyecto').classList.toggle('activo', porProyecto);
  procesarYRenderizarGantt(ultimosDatosGantt);
}

async function generarGantt() {
  if (!supabaseClient) return;

  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  if (!desde || !hasta) return;

  const { data, error } = await supabaseClient
    .from(TABLA)
    .select('fecha,tarea,proyecto,bloque,comentario,horainicio,horafin')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: true })
    .order('horainicio', { ascending: true });

  if (error) {
    console.error('Error al recuperar datos para el Gantt:', error);
    return;
  }

  ultimosDatosGantt = data || [];
  procesarYRenderizarGantt(ultimosDatosGantt);
}

/** 'HH:MM' -> horas en decimal (p.ej. '08:30' -> 8.5). null si no es una hora válida. */
function horaADecimalGantt(horaStr) {
  if (!horaStr) return null;
  const partes = String(horaStr).split(':');
  if (partes.length < 2) return null;
  const h = Number(partes[0]);
  const m = Number(partes[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h + m / 60;
}

function escaparHtmlGantt(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Hora actual en decimal, respetando cualquier "mock" de Date usado en pruebas. */
function horaActualDecimalGantt() {
  const ahora = new Date();
  return ahora.getHours() + ahora.getMinutes() / 60;
}

/** Minutos -> 'h:mm' SIN cero a la izquierda en las horas (p.ej. 26 -> '0:26', 90 -> '1:30'). Usado dentro de las barras del Gantt. */
function formatearDuracionCorta(totalMinutos) {
  const absMin = Math.max(0, Math.round(totalMinutos));
  const horas = Math.floor(absMin / 60);
  const mm = String(absMin % 60).padStart(2, '0');
  return `${horas}:${mm}`;
}

/** Color de texto ('#000000' o '#ffffff') legible sobre un fondo hexadecimal dado (luminancia aproximada). */
function colorContrastanteGantt(hex) {
  if (!hex) return '#000000';
  const limpio = hex.replace('#', '');
  if (limpio.length !== 6) return '#000000';
  const r = parseInt(limpio.substring(0, 2), 16);
  const g = parseInt(limpio.substring(2, 4), 16);
  const b = parseInt(limpio.substring(4, 6), 16);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.6 ? '#000000' : '#ffffff';
}

/**
 * Agrupa los registros en filas (eje Y) y calcula el eje de horas (eje X),
 * y dispara el pintado. La agrupación en filas es por Tarea + (Bloque o
 * Proyecto, según el interruptor "Agrupar por"): dos registros con la misma
 * Tarea pero distinto valor en esa 2ª columna son filas distintas; con el
 * mismo valor (aunque sea de fechas distintas) comparten fila -así es como
 * el diagrama "sabe" que una tarea se repite, apilando sus tramos en la
 * misma línea de tiempo-.
 */
function procesarYRenderizarGantt(data) {
  const t = TEXTOS_GANTT[idiomaActual];
  const resumen = document.getElementById('gantt-resumen');
  const vacio = document.getElementById('gantt-vacio');
  const chart = document.getElementById('gantt-chart');
  const leyenda = document.getElementById('gantt-leyenda');

  const registrosValidos = (data || []).filter(r => {
    const ini = horaADecimalGantt(r.horainicio);
    const fin = horaADecimalGantt(r.horafin);
    return ini !== null && fin !== null && fin > ini;
  });

  if (registrosValidos.length === 0) {
    resumen.textContent = '';
    chart.innerHTML = '';
    leyenda.innerHTML = '';
    vacio.textContent = t.sinDatos;
    vacio.style.display = 'block';
    return;
  }
  vacio.style.display = 'none';

  // --- Filas: Tarea + (Bloque o Proyecto, según el interruptor) ---
  const filasMapa = new Map();
  registrosValidos.forEach(r => {
    const tarea = (r.tarea || '').trim();
    const proyecto = (r.proyecto || '').trim();
    const bloque = (r.bloque || '').trim();
    const secundario = agruparPorProyecto ? proyecto : bloque;
    const clave = tarea + '\u0001' + secundario;
    if (!filasMapa.has(clave)) filasMapa.set(clave, { tarea, secundario, segmentos: [] });
    let fecha = String(r.fecha || '').trim();
    if (fecha.includes('T')) fecha = fecha.split('T')[0];
    if (fecha.includes(' ')) fecha = fecha.split(' ')[0];
    filasMapa.get(clave).segmentos.push({
      fecha,
      horainicio: r.horainicio,
      horafin: r.horafin,
      inicioDec: horaADecimalGantt(r.horainicio),
      finDec: horaADecimalGantt(r.horafin),
      proyecto,
      bloque,
      comentario: r.comentario || ''
    });
  });

  const filas = Array.from(filasMapa.values()).sort((a, b) => {
    const cmpTarea = a.tarea.localeCompare(b.tarea, 'es');
    return cmpTarea !== 0 ? cmpTarea : a.secundario.localeCompare(b.secundario, 'es');
  });

  // Duración total de cada fila, para la columna "Duración" de la tabla de
  // la izquierda (estilo columnas de MS Project).
  filas.forEach(fila => {
    fila.duracionTotalMin = fila.segmentos.reduce((acc, seg) => acc + Math.round((seg.finDec - seg.inicioDec) * 60), 0);
  });

  // --- Eje de horas: del inicio más temprano al fin más tardío de todo el rango, a horas completas ---
  let minDec = Infinity, maxDec = -Infinity;
  registrosValidos.forEach(r => {
    const ini = horaADecimalGantt(r.horainicio);
    const fin = horaADecimalGantt(r.horafin);
    if (ini < minDec) minDec = ini;
    if (fin > maxDec) maxDec = fin;
  });
  const ejeInicio = Math.floor(minDec);
  let ejeFin = Math.ceil(maxDec);
  if (ejeFin <= ejeInicio) ejeFin = ejeInicio + 1;

  // --- Carriles dentro de cada fila, para que segmentos que se solapan en
  //     horario (aunque sean de días distintos) no se dibujen unos encima
  //     de otros ---
  filas.forEach(fila => {
    fila.segmentos.sort((a, b) => a.inicioDec - b.inicioDec);
    const finCarriles = [];
    fila.segmentos.forEach(seg => {
      let carril = finCarriles.findIndex(fin => fin <= seg.inicioDec + 1e-9);
      if (carril === -1) {
        carril = finCarriles.length;
        finCarriles.push(seg.finDec);
      } else {
        finCarriles[carril] = seg.finDec;
      }
      seg.carril = carril;
    });
    fila.numCarriles = Math.max(1, finCarriles.length);
  });

  // --- Colores por proyecto: primero el color personalizado (si José ya
  //     eligió uno desde la leyenda), si no la paleta fija por rotación ---
  const coloresPersonalizados = obtenerColoresPersonalizados();
  const coloresProyecto = {};
  let indiceColor = 0;
  registrosValidos.forEach(r => {
    const p = r.proyecto || '—';
    if (!(p in coloresProyecto)) {
      coloresProyecto[p] = coloresPersonalizados[p] || COLORES_BASE_GANTT[indiceColor % COLORES_BASE_GANTT.length];
      indiceColor++;
    }
  });

  resumen.textContent = `${registrosValidos.length} ${t.registros} · ${filas.length} ${t.filasTexto}`;

  // ¿Se debe dibujar la línea de "Ahora"? Solo si el rango de fechas
  // mostrado incluye hoy y la hora actual cae dentro del eje de horas
  // dibujado (igual que la línea de "fecha de estado" de MS Project).
  const desdeVal = document.getElementById('filtro-desde').value;
  const hastaVal = document.getElementById('filtro-hasta').value;
  const hoyStr = obtenerFechaHoyISO();
  const horaActualDec = horaActualDecimalGantt();
  const mostrarAhora = desdeVal && hastaVal && hoyStr >= desdeVal && hoyStr <= hastaVal &&
    horaActualDec >= ejeInicio && horaActualDec <= ejeFin;

  renderizarGantt(filas, ejeInicio, ejeFin, coloresProyecto, mostrarAhora ? horaActualDec : null);
  renderizarLeyendaGantt(coloresProyecto);
}

function renderizarGantt(filas, ejeInicio, ejeFin, coloresProyecto, horaAhoraDec) {
  const t = TEXTOS_GANTT[idiomaActual];
  const chart = document.getElementById('gantt-chart');
  chart.innerHTML = '';

  const ancho = ejeFin - ejeInicio;
  const CARRIL_ALTO = 22, CARRIL_GAP = 4, PAD_VERT = 8;
  const colSecundarioLabel = agruparPorProyecto ? t.colProyecto : t.colBloque;

  const tabla = document.createElement('div');
  tabla.className = 'gantt-tabla';

  // --- Cabecera: columnas de la tabla de tareas + regla de horas ---
  const headerRow = document.createElement('div');
  headerRow.className = 'gantt-header-row';

  const headerEtiqueta = document.createElement('div');
  headerEtiqueta.className = 'gantt-etiqueta-header';
  headerEtiqueta.appendChild(crearColumna('gantt-col-num', t.colNum));
  headerEtiqueta.appendChild(crearColumna('gantt-col-tarea', t.colTarea));
  headerEtiqueta.appendChild(crearColumna('gantt-col-secundario', colSecundarioLabel));
  headerEtiqueta.appendChild(crearColumna('gantt-col-duracion', t.colDuracion));
  headerRow.appendChild(headerEtiqueta);

  const ejeHoras = document.createElement('div');
  ejeHoras.className = 'gantt-eje-horas';
  for (let h = ejeInicio; h <= ejeFin; h++) {
    const marca = document.createElement('div');
    marca.className = 'gantt-hora-marca hora-entera';
    marca.style.left = `${((h - ejeInicio) / ancho) * 100}%`;
    marca.textContent = `${String(h % 24).padStart(2, '0')}:00`;
    ejeHoras.appendChild(marca);
  }
  if (horaAhoraDec !== null) {
    const etiquetaAhora = document.createElement('div');
    etiquetaAhora.className = 'gantt-ahora-etiqueta';
    etiquetaAhora.style.left = `${((horaAhoraDec - ejeInicio) / ancho) * 100}%`;
    etiquetaAhora.textContent = t.ahora;
    ejeHoras.appendChild(etiquetaAhora);
  }
  headerRow.appendChild(ejeHoras);
  tabla.appendChild(headerRow);

  // --- Cuerpo (con scroll vertical propio si hay muchas filas; la cabecera
  //     de arriba queda fija porque está fuera de este contenedor) ---
  const cuerpoScroll = document.createElement('div');
  cuerpoScroll.className = 'gantt-cuerpo-scroll';

  const filasCont = document.createElement('div');
  filasCont.className = 'gantt-filas';

  filas.forEach((fila, indice) => {
    const filaDiv = document.createElement('div');
    filaDiv.className = 'gantt-fila';

    const alturaPista = fila.numCarriles * CARRIL_ALTO + (fila.numCarriles - 1) * CARRIL_GAP + PAD_VERT * 2;

    const etiqueta = document.createElement('div');
    etiqueta.className = 'gantt-etiqueta';
    etiqueta.style.minHeight = `${alturaPista}px`;
    etiqueta.appendChild(crearColumna('gantt-col-num', String(indice + 1)));
    etiqueta.appendChild(crearColumna('gantt-col-tarea', fila.tarea, fila.tarea));
    etiqueta.appendChild(crearColumna('gantt-col-secundario', fila.secundario, fila.secundario));
    etiqueta.appendChild(crearColumna('gantt-col-duracion', formatearMinutosAHoras(fila.duracionTotalMin)));
    filaDiv.appendChild(etiqueta);

    const pista = document.createElement('div');
    pista.className = 'gantt-pista';
    pista.style.height = `${alturaPista}px`;

    for (let h = ejeInicio; h <= ejeFin; h++) {
      const linea = document.createElement('div');
      linea.className = 'gantt-linea-hora hora-entera';
      linea.style.left = `${((h - ejeInicio) / ancho) * 100}%`;
      pista.appendChild(linea);
    }

    if (horaAhoraDec !== null) {
      const lineaAhora = document.createElement('div');
      lineaAhora.className = 'gantt-linea-ahora';
      lineaAhora.style.left = `${((horaAhoraDec - ejeInicio) / ancho) * 100}%`;
      pista.appendChild(lineaAhora);
    }

    fila.segmentos.forEach(seg => {
      const left = ((seg.inicioDec - ejeInicio) / ancho) * 100;
      const width = Math.max(((seg.finDec - seg.inicioDec) / ancho) * 100, 0.6);
      const top = PAD_VERT + seg.carril * (CARRIL_ALTO + CARRIL_GAP);
      const colorFondo = coloresProyecto[seg.proyecto || '—'];
      const duracionMin = Math.round((seg.finDec - seg.inicioDec) * 60);

      const bar = document.createElement('div');
      bar.className = 'gantt-segmento';
      bar.style.left = `${left}%`;
      bar.style.width = `${width}%`;
      bar.style.top = `${top}px`;
      bar.style.height = `${CARRIL_ALTO}px`;
      bar.style.backgroundColor = colorFondo;
      bar.title = `${seg.fecha}  ${seg.horainicio}–${seg.horafin} (${formatearMinutosAHoras(duracionMin)})\n${seg.proyecto || ''}${seg.comentario ? ' · ' + seg.comentario : ''}`;

      // Duración del tramo (h:mm, p.ej. "0:26"), centrada DENTRO de la
      // barra, con color de texto legible según el color de fondo.
      const texto = document.createElement('div');
      texto.className = 'gantt-segmento-texto';
      texto.style.color = colorContrastanteGantt(colorFondo);
      texto.textContent = formatearDuracionCorta(duracionMin);
      bar.appendChild(texto);

      pista.appendChild(bar);
    });

    filaDiv.appendChild(pista);
    filasCont.appendChild(filaDiv);
  });

  cuerpoScroll.appendChild(filasCont);
  tabla.appendChild(cuerpoScroll);
  chart.appendChild(tabla);
}

function crearColumna(clase, texto, title) {
  const col = document.createElement('div');
  col.className = `gantt-col ${clase}`;
  col.textContent = texto;
  if (title) col.title = title;
  return col;
}

function renderizarLeyendaGantt(coloresProyecto) {
  const t = TEXTOS_GANTT[idiomaActual];
  const leyenda = document.getElementById('gantt-leyenda');
  leyenda.innerHTML = '';
  Object.keys(coloresProyecto).sort().forEach(proyecto => {
    const item = document.createElement('div');
    item.className = 'gantt-leyenda-item';

    // La pastilla de color es clicable: abre el selector de color nativo del
    // navegador y, al elegir uno, lo guarda para este proyecto (persiste en
    // localStorage y se usa a partir de ahora en vez del color por rotación).
    const color = document.createElement('button');
    color.type = 'button';
    color.className = 'gantt-leyenda-color';
    color.style.backgroundColor = coloresProyecto[proyecto];
    color.title = t.tituloColorProyecto;

    const inputColor = document.createElement('input');
    inputColor.type = 'color';
    inputColor.className = 'gantt-leyenda-color-input';
    inputColor.value = coloresProyecto[proyecto];
    inputColor.addEventListener('input', () => {
      guardarColorPersonalizado(proyecto, inputColor.value);
      procesarYRenderizarGantt(ultimosDatosGantt);
    });

    color.addEventListener('click', () => inputColor.click());

    const texto = document.createElement('span');
    texto.textContent = proyecto;

    item.appendChild(color);
    item.appendChild(inputColor);
    item.appendChild(texto);
    leyenda.appendChild(item);
  });
}

// ============================================================
// Exportación del Gantt (.gan / .json / .pdf / .xml, en ese orden
// alfabético en el desplegable). Un .mpp binario real de Microsoft Project
// no se puede generar desde el navegador (es un formato propietario
// cerrado); en su lugar se ofrece .xml (el formato de intercambio oficial
// de Project, que se abre directamente en Project y desde ahí se puede
// "Guardar como" .mpp).
// ============================================================

function onCambioExportar() {
  const select = document.getElementById('select-exportar');
  const tipo = select.value;
  select.value = '';
  if (!tipo) return;
  exportarGanttComo(tipo);
}

function exportarGanttComo(tipo) {
  const t = TEXTOS_GANTT[idiomaActual];
  if (!ultimosDatosGantt || ultimosDatosGantt.length === 0) {
    alert(t.exportarSinDatos);
    return;
  }

  if (tipo === 'pdf') {
    window.print();
    return;
  }

  const nombreBase = nombreArchivoExportGantt();
  if (tipo === 'json') {
    guardarArchivoExport(`${nombreBase}.json`, generarContenidoJSONGantt(), 'application/json');
  } else if (tipo === 'xml') {
    guardarArchivoExport(`${nombreBase}.xml`, generarContenidoXMLGantt(), 'application/xml');
  } else if (tipo === 'gan') {
    guardarArchivoExport(`${nombreBase}.gan`, generarContenidoGanGantt(), 'application/xml');
  }
}

function nombreArchivoExportGantt() {
  const desde = document.getElementById('filtro-desde').value || '';
  const hasta = document.getElementById('filtro-hasta').value || '';
  return `gantt_reghor_${desde}_${hasta}`;
}

/** Segmentos "planos" (uno por tramo, ordenados cronológicamente) usados como base común de todas las exportaciones. */
function obtenerSegmentosParaExport() {
  return ultimosDatosGantt
    .filter(r => horaADecimalGantt(r.horainicio) !== null && horaADecimalGantt(r.horafin) !== null)
    .map(r => {
      let fecha = String(r.fecha || '').trim();
      if (fecha.includes('T')) fecha = fecha.split('T')[0];
      if (fecha.includes(' ')) fecha = fecha.split(' ')[0];
      return {
        fecha,
        tarea: (r.tarea || '').trim(),
        proyecto: (r.proyecto || '').trim(),
        bloque: (r.bloque || '').trim(),
        comentario: r.comentario || '',
        horainicio: r.horainicio,
        horafin: r.horafin,
        duracionMin: Math.round((horaADecimalGantt(r.horafin) - horaADecimalGantt(r.horainicio)) * 60)
      };
    })
    .sort((a, b) => (a.fecha + a.horainicio).localeCompare(b.fecha + b.horainicio));
}

function generarContenidoJSONGantt() {
  const segmentos = obtenerSegmentosParaExport();
  const contenido = {
    generado: new Date().toISOString(),
    rango: {
      desde: document.getElementById('filtro-desde').value,
      hasta: document.getElementById('filtro-hasta').value
    },
    agrupadoPor: agruparPorProyecto ? 'proyecto' : 'bloque',
    tareas: segmentos
  };
  return JSON.stringify(contenido, null, 2);
}

/** ISO-8601 duration (PTnHnMnS), formato que exige el campo <Duration> de Microsoft Project XML. */
function duracionISO8601(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `PT${h}H${m}M0S`;
}

/**
 * Formato XML de intercambio de Microsoft Project (esquema oficial
 * "http://schemas.microsoft.com/project"). Un <Task> por cada tramo
 * guardado en REGHOR (no por fila agrupada), en orden cronológico:
 * Project lo importa directamente y desde ahí José puede "Guardar como"
 * .mpp si lo necesita en ese formato binario propietario.
 */
function generarContenidoXMLGantt() {
  const segmentos = obtenerSegmentosParaExport();
  let uid = 1;
  const tareasXml = segmentos.map(seg => {
    const nombre = escaparHtmlGantt(`${seg.tarea}${seg.proyecto ? ' — ' + seg.proyecto : ''}${seg.bloque ? ' (' + seg.bloque + ')' : ''}`);
    const inicio = `${seg.fecha}T${seg.horainicio}:00`;
    const fin = `${seg.fecha}T${seg.horafin}:00`;
    const xml = `    <Task>
      <UID>${uid}</UID>
      <ID>${uid}</ID>
      <Name>${nombre}</Name>
      <Start>${inicio}</Start>
      <Finish>${fin}</Finish>
      <Duration>${duracionISO8601(seg.duracionMin)}</Duration>
      <PercentComplete>100</PercentComplete>
      <Notes>${escaparHtmlGantt(seg.comentario || '')}</Notes>
    </Task>`;
    uid++;
    return xml;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>REGHOR Gantt</Name>
  <Title>Diagrama de Gantt REGHOR</Title>
  <SaveVersion>14</SaveVersion>
  <Tasks>
${tareasXml}
  </Tasks>
</Project>
`;
}

/**
 * Formato nativo de GanttProject (.gan), XML propio. IMPORTANTE: GanttProject
 * mide la duración de una tarea en DÍAS laborables completos, no admite
 * horas ni minutos, así que aquí cada tramo se exporta como una tarea de 1
 * día (empezando en su fecha) y el horario exacto (p.ej. "08:00–09:30,
 * 1:30") se guarda en el campo <notes> de la propia tarea para no perder esa
 * información -es la mejor aproximación posible a este formato; para una
 * copia con los tiempos exactos, exporta a .json o a .pdf-.
 */
function generarContenidoGanGantt() {
  const segmentos = obtenerSegmentosParaExport();
  const coloresPersonalizados = obtenerColoresPersonalizados();
  let idTarea = 0;
  const tareasXml = segmentos.map(seg => {
    const nombre = escaparHtmlGantt(`${seg.tarea}${seg.bloque ? ' (' + seg.bloque + ')' : ''}`);
    const color = coloresPersonalizados[seg.proyecto] || '#8cb6ce';
    const notas = escaparHtmlGantt(`${seg.proyecto || ''} · ${seg.horainicio}–${seg.horafin} (${formatearDuracionCorta(seg.duracionMin)})${seg.comentario ? ' · ' + seg.comentario : ''}`);
    const xml = `    <task id="${idTarea}" name="${nombre}" color="${color}" meeting="false" start="${seg.fecha}" duration="1" complete="100" expand="true">
      <notes><![CDATA[${notas}]]></notes>
    </task>`;
    idTarea++;
    return xml;
  }).join('\n');

  const hoy = obtenerFechaHoyISO();
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<project name="REGHOR Gantt" company="" webLink="" view-date="${hoy}" view-index="0" gantt-divider-location="300" resource-divider-location="300" version="3.0" locale="es">
  <tasks empty-milestones="true">
${tareasXml}
  </tasks>
</project>
`;
}

/**
 * Guarda un archivo de texto con el diálogo nativo "Guardar como" del
 * sistema operativo (File System Access API) cuando el navegador lo admite;
 * si no (Firefox, Safari, navegadores más antiguos...) recurre a la
 * descarga normal, que el propio navegador puede configurar para preguntar
 * dónde guardar cada archivo.
 */
async function guardarArchivoExport(nombreSugerido, contenido, mimeType) {
  if (window.showSaveFilePicker) {
    try {
      const extension = nombreSugerido.split('.').pop();
      const handle = await window.showSaveFilePicker({
        suggestedName: nombreSugerido,
        types: [{ description: extension.toUpperCase(), accept: { [mimeType]: [`.${extension}`] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(contenido);
      await writable.close();
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return; // José canceló el diálogo: no hacer nada más.
      // Cualquier otro fallo (p.ej. permiso denegado): recurrir a la descarga normal.
    }
  }

  const blob = new Blob([contenido], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreSugerido;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
