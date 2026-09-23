// SUPABASE_URL, SUPABASE_KEY, supabaseClient, TABLA, formatearFechaISO,
// formatearMinutosAHoras, parsearFechaLocal, calcularRangoFechas,
// obtenerFechaHoyISO, toggleTheme y cerrarPestana viven en config.js.

let idiomaActual = 'es';
let ultimosDatosGantt = [];

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
    colNum: '#', colTarea: 'Tarea', colBloque: 'Bloque', colDuracion: 'Duración', colRep: 'Rep.',
    ahora: 'Ahora'
  },
  gl: {
    titulo: '📅 Diagrama de Gantt', cerrar: '❌ Pechar', rangoRapido: 'Intervalo Rápido',
    hoy: 'Hoxe', semana: 'Semana actual', semanaAnterior: 'Semana anterior',
    mes: 'Mes actual', mesAnterior: 'Mes anterior',
    desde: 'Desde Data', hasta: 'Ata Data', generar: 'Xerar Gantt',
    registros: 'rexistros', filasTexto: 'tarefas distintas',
    sinDatos: 'Non hai rexistros no intervalo de datas seleccionado.',
    colNum: '#', colTarea: 'Tarefa', colBloque: 'Bloque', colDuracion: 'Duración', colRep: 'Rep.',
    ahora: 'Agora'
  }
};

// Misma paleta que graficos.js, para que los colores por proyecto resulten
// familiares en toda la app.
const COLORES_BASE_GANTT = [
  '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
  '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'
];

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

/**
 * Agrupa los registros en filas (eje Y) y calcula el eje de horas (eje X),
 * y dispara el pintado. La agrupación en filas es por la combinación exacta
 * Tarea + Bloque: dos registros con la misma Tarea pero distinto Bloque (o
 * uno con Bloque y otro sin él) son filas distintas; con la misma Tarea y el
 * mismo Bloque (aunque sea de fechas distintas) comparten fila -así es como
 * el diagrama "sabe" que una tarea se repite, y la columna "Rep." de la
 * tabla de la izquierda lo muestra como un número-.
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

  // --- Filas: Tarea + Bloque ---
  const filasMapa = new Map();
  registrosValidos.forEach(r => {
    const tarea = (r.tarea || '').trim();
    const bloque = (r.bloque || '').trim();
    const clave = tarea + '\u0001' + bloque;
    if (!filasMapa.has(clave)) filasMapa.set(clave, { tarea, bloque, segmentos: [] });
    let fecha = String(r.fecha || '').trim();
    if (fecha.includes('T')) fecha = fecha.split('T')[0];
    if (fecha.includes(' ')) fecha = fecha.split(' ')[0];
    filasMapa.get(clave).segmentos.push({
      fecha,
      horainicio: r.horainicio,
      horafin: r.horafin,
      inicioDec: horaADecimalGantt(r.horainicio),
      finDec: horaADecimalGantt(r.horafin),
      proyecto: r.proyecto || '',
      comentario: r.comentario || ''
    });
  });

  const filas = Array.from(filasMapa.values()).sort((a, b) => {
    const cmpTarea = a.tarea.localeCompare(b.tarea, 'es');
    return cmpTarea !== 0 ? cmpTarea : a.bloque.localeCompare(b.bloque, 'es');
  });

  // Duración total y número de repeticiones (apariciones) de cada fila, para
  // la tabla de tareas de la izquierda (estilo "columnas" de MS Project).
  filas.forEach(fila => {
    fila.duracionTotalMin = fila.segmentos.reduce((acc, seg) => acc + Math.round((seg.finDec - seg.inicioDec) * 60), 0);
    fila.repeticiones = fila.segmentos.length;
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

  // --- Colores por proyecto (estables mientras no cambien los datos) ---
  const coloresProyecto = {};
  let indiceColor = 0;
  registrosValidos.forEach(r => {
    const p = r.proyecto || '—';
    if (!(p in coloresProyecto)) {
      coloresProyecto[p] = COLORES_BASE_GANTT[indiceColor % COLORES_BASE_GANTT.length];
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

  const tabla = document.createElement('div');
  tabla.className = 'gantt-tabla';

  // --- Cabecera: columnas de la tabla de tareas + regla de horas ---
  const headerRow = document.createElement('div');
  headerRow.className = 'gantt-header-row';

  const headerEtiqueta = document.createElement('div');
  headerEtiqueta.className = 'gantt-etiqueta-header';
  headerEtiqueta.appendChild(crearColumna('gantt-col-num', t.colNum));
  headerEtiqueta.appendChild(crearColumna('gantt-col-tarea', t.colTarea));
  headerEtiqueta.appendChild(crearColumna('gantt-col-bloque', t.colBloque));
  headerEtiqueta.appendChild(crearColumna('gantt-col-duracion', t.colDuracion));
  headerEtiqueta.appendChild(crearColumna('gantt-col-rep', t.colRep));
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
    etiqueta.appendChild(crearColumna('gantt-col-bloque', fila.bloque, fila.bloque));
    etiqueta.appendChild(crearColumna('gantt-col-duracion', formatearMinutosAHoras(fila.duracionTotalMin)));
    etiqueta.appendChild(crearColumna('gantt-col-rep', String(fila.repeticiones)));
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

      const bar = document.createElement('div');
      bar.className = 'gantt-segmento';
      bar.style.left = `${left}%`;
      bar.style.width = `${width}%`;
      bar.style.top = `${top}px`;
      bar.style.height = `${CARRIL_ALTO}px`;
      bar.style.backgroundColor = coloresProyecto[seg.proyecto || '—'];
      const duracion = formatearMinutosAHoras(Math.round((seg.finDec - seg.inicioDec) * 60));
      bar.title = `${seg.fecha}  ${seg.horainicio}–${seg.horafin} (${duracion})\n${seg.proyecto || ''}${seg.comentario ? ' · ' + seg.comentario : ''}`;
      pista.appendChild(bar);

      const texto = document.createElement('div');
      texto.className = 'gantt-segmento-texto';
      texto.style.left = `calc(${left + width}% + 4px)`;
      texto.style.top = `${top + CARRIL_ALTO / 2}px`;
      texto.textContent = `${seg.horainicio}–${seg.horafin}`;
      pista.appendChild(texto);
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
  const leyenda = document.getElementById('gantt-leyenda');
  leyenda.innerHTML = '';
  Object.keys(coloresProyecto).sort().forEach(proyecto => {
    const item = document.createElement('div');
    item.className = 'gantt-leyenda-item';

    const color = document.createElement('span');
    color.className = 'gantt-leyenda-color';
    color.style.backgroundColor = coloresProyecto[proyecto];

    const texto = document.createElement('span');
    texto.textContent = proyecto;

    item.appendChild(color);
    item.appendChild(texto);
    leyenda.appendChild(item);
  });
}
