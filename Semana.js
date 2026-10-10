// SUPABASE_URL, SUPABASE_KEY, supabaseClient, TABLA ('obras'),
// obtenerMinutosDuracion, formatearMinutosAHoras, formatearFechaISO,
// esFestivo, obtenerJornadaTeoricaMinutos, obtenerDescansoMinutos,
// toggleTheme y cerrarPestana viven en config.js.
//
// Esta página YA NO tiene entrada/salida manual ni tabla propia: las horas
// de cada día se calculan automáticamente sumando las tareas que ya están
// registradas ese día en 'obras' (las que se dan de alta en index.html).

let idiomaActual = 'es';
let lunesActual = null;
let diasSemanaActual = [];

// Datos calculados de cada día de la semana actual (índices 0=lunes..4=viernes).
// Se recalculan en cada cargarSemana() y los usa actualizarResumenSemana().
let datosDiaActual = [];

const DIAS_CORTOS = {
  es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  gl: ['Luns', 'Martes', 'Mércores', 'Xoves', 'Venres'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
};

const TEXTOS_SEMANA = {
  es: {
    titulo: '📅 Resumen Semanal', cerrar: '❌ Cerrar', nota: 'Cálculo automático a partir de las tareas registradas cada día en el Listado de Tareas.',
    thFecha: 'Fecha', thDia: 'Día', thEntrada: 'Entrada', thSalida: 'Salida',
    thTeorica: 'Jornada Teórica', thDuracion: 'Duración', anterior: '◀ Semana anterior', actual: 'Semana actual', siguiente: 'Semana siguiente ▶',
    teoricasSemana: 'Horas teóricas semana', totalesLunesJueves: 'Horas totales semana (lunes-jueves)',
    pendienteViernes: 'Horas pendientes viernes',
    pendienteViernesTip: 'Horas teóricas de toda la semana menos las ya trabajadas de lunes a jueves. Un lunes por la mañana coincide con el total teórico de la semana; a medida que avanza la semana va bajando según lo que se vaya trabajando.',
    salidaViernesPrevista: 'Hora salida viernes (prevista)',
    pendiente: 'Pendiente', sinDatos: 'Sin tareas registradas: a efectos del cálculo se asume la jornada teórica cumplida',
    proyectadoTip: 'Hora teórica estimada (entrada por defecto 06:45): se sustituirá por el dato real en cuanto registres algo ese día.',
    notaProyectado: '* Hora teórica estimada, pendiente del registro real de ese día.',
    festivoTexto: 'Festivo'
  },
  gl: {
    titulo: '📅 Resumo Semanal', cerrar: '❌ Pechar', nota: 'Cálculo automático a partir das tarefas rexistradas cada día na Listaxe de Tarefas.',
    thFecha: 'Data', thDia: 'Día', thEntrada: 'Entrada', thSalida: 'Saída',
    thTeorica: 'Xornada Teórica', thDuracion: 'Duración', anterior: '◀ Semana anterior', actual: 'Semana actual', siguiente: 'Semana seguinte ▶',
    teoricasSemana: 'Horas teóricas semana', totalesLunesJueves: 'Horas totais semana (luns-xoves)',
    pendienteViernes: 'Horas pendentes venres',
    pendienteViernesTip: 'Horas teóricas de toda a semana menos as xa traballadas de luns a xoves. Un luns pola mañá coincide co total teórico da semana; a medida que avanza a semana vai baixando segundo o que se vaia traballando.',
    salidaViernesPrevista: 'Hora saída venres (prevista)',
    pendiente: 'Pendente', sinDatos: 'Sen tarefas rexistradas: a efectos do cálculo asúmese a xornada teórica cumprida',
    proyectadoTip: 'Hora teórica estimada (entrada por defecto 06:45): sustituirase polo dato real en canto rexistres algo ese día.',
    notaProyectado: '* Hora teórica estimada, pendente do rexistro real dese día.',
    festivoTexto: 'Festivo'
  },
  en: {
    titulo: '📅 Weekly Summary', cerrar: '❌ Close', nota: 'Calculated automatically from the tasks logged each day in the Task List.',
    thFecha: 'Date', thDia: 'Day', thEntrada: 'Start', thSalida: 'End',
    thTeorica: 'Theoretical Shift', thDuracion: 'Duration', anterior: '◀ Previous Week', actual: 'Current Week', siguiente: 'Next Week ▶',
    teoricasSemana: 'Weekly Theoretical Hours', totalesLunesJueves: 'Total Hours (Mon-Thu)',
    pendienteViernes: 'Hours Pending on Friday',
    pendienteViernesTip: 'Weekly theoretical hours minus what has already been worked Monday-Thursday. On Monday morning this matches the week\'s theoretical total; it goes down as the week progresses.',
    salidaViernesPrevista: 'Friday End Time (estimated)',
    pendiente: 'Pending', sinDatos: 'No tasks logged: the theoretical shift is assumed fulfilled for this calculation',
    proyectadoTip: 'Estimated theoretical time (default start 06:45): replaced by the real value as soon as something is logged that day.',
    notaProyectado: '* Estimated theoretical time, pending that day\'s real record.',
    festivoTexto: 'Holiday'
  }
};

// MESES vive en config.js (compartido con app.js)

// ------------------------------------------------------------
// Entrada/Salida TEÓRICAS por defecto, para que la hora de salida prevista
// se pueda ver desde el lunes, antes incluso de registrar nada esa semana
// (ver cargarSemana): mientras un día no tenga ningún registro real en
// 'obras', se asume que se entra a las 06:45 y -de lunes a jueves- que se
// sale a las 16:00. El viernes no tiene una salida teórica fija: se calcula
// (igual que ya hacía "Hora salida viernes (prevista)") a partir de las
// horas que falten por completar esa semana. En cuanto el día tiene algún
// registro real, esta entrada/salida teórica se sustituye por la real.
// ------------------------------------------------------------
const ENTRADA_TEORICA_DEFECTO = '06:45';
const SALIDA_TEORICA_LUNES_JUEVES = '16:00';

function formatearFechaDDMMYYYY(fecha) {
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const yyyy = fecha.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Lunes de la semana (lunes-domingo) que contiene 'fecha'. */
function obtenerLunes(fecha) {
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - (diaSemana - 1));
}

/** Suma minutos (puede ser negativo) a una hora 'HH:MM', con vuelta de 24h. */
function sumarMinutosAHora(horaStr, minutosExtra) {
  const [h, m] = horaStr.split(':').map(Number);
  let total = h * 60 + m + minutosExtra;
  total = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Horas teóricas de toda la semana y horas pendientes para el viernes
 * (teórica total - horas efectivas ya "cerradas" de lunes a jueves, sin
 * acotar: puede salir negativo si se va por delante de jornada). Requiere
 * que datosDiaActual[0..3] ya estén calculados (se usa tanto dentro del
 * propio cargarSemana, al pintar la fila del viernes, como luego en
 * actualizarResumenSemana).
 */
function calcularPendienteMinutosViernes() {
  let teoricoTotalMin = 0;
  diasSemanaActual.forEach(fecha => {
    teoricoTotalMin += obtenerJornadaTeoricaMinutos(formatearFechaISO(fecha));
  });

  let totalesLunesJueves = 0;
  for (let i = 0; i < 4; i++) {
    totalesLunesJueves += datosDiaActual[i].minutosEfectivos;
  }

  return { teoricoTotalMin, totalesLunesJueves, pendienteMin: teoricoTotalMin - totalesLunesJueves };
}

/** Número de semana ISO-8601 (la semana pertenece al año de su jueves). */
function obtenerNumeroSemanaISO(fecha) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function actualizarEncabezadoSemana() {
  const lunes = diasSemanaActual[0];
  const viernes = diasSemanaActual[4];
  const numSemana = obtenerNumeroSemanaISO(lunes);
  const meses = MESES[idiomaActual];

  const d1 = lunes.getDate();
  const m1 = meses[lunes.getMonth()];
  const d2 = viernes.getDate();
  const m2 = meses[viernes.getMonth()];
  const anio = viernes.getFullYear();

  let texto;
  if (idiomaActual === 'gl') {
    texto = `Semana ${numSemana} — semana do ${d1} de ${m1} ao ${d2} de ${m2} de ${anio}`;
  } else if (idiomaActual === 'en') {
    texto = `Week ${numSemana} — week of ${m1} ${d1} to ${m2} ${d2}, ${anio}`;
  } else {
    texto = `Semana ${numSemana} — semana del ${d1} de ${m1} al ${d2} de ${m2} de ${anio}`;
  }

  document.getElementById('txt-rango-semana').textContent = texto;
}

/**
 * Carga la semana que empieza en 'lunes', trayendo de 'obras' todas las
 * tareas de esos 5 días y agregándolas por fecha: entrada = hora de inicio
 * más temprana del día, salida = hora de fin más tardía, duración = suma
 * de la duración de cada tarea menos el descanso que corresponda.
 */
async function cargarSemana(lunes) {
  lunesActual = lunes;

  diasSemanaActual = [];
  for (let i = 0; i < 5; i++) {
    diasSemanaActual.push(new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i));
  }

  actualizarEncabezadoSemana();

  const desdeStr = formatearFechaISO(diasSemanaActual[0]);
  const hastaStr = formatearFechaISO(diasSemanaActual[4]);

  const tareasPorFecha = {};
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from(TABLA)
      .select('*')
      .gte('fecha', desdeStr)
      .lte('fecha', hastaStr);

    if (!error && data) {
      data.forEach(r => {
        let f = String(r.fecha || '').trim();
        if (f.includes('T')) f = f.split('T')[0];
        if (f.includes(' ')) f = f.split(' ')[0];
        if (!tareasPorFecha[f]) tareasPorFecha[f] = [];
        tareasPorFecha[f].push(r);
      });
    } else if (error) {
      console.error('Error al cargar las tareas de obras:', error);
    }
  }

  const t = TEXTOS_SEMANA[idiomaActual];
  const nombresDias = DIAS_CORTOS[idiomaActual];

  datosDiaActual = [];

  const filas = diasSemanaActual.map((fecha, idx) => {
    const fechaStr = formatearFechaISO(fecha);
    const tareasDia = tareasPorFecha[fechaStr] || [];
    const festivo = esFestivo(fechaStr);
    const esViernes = idx === 4;

    let entrada = '';
    let salida = '';
    let minutosBrutos = 0;
    tareasDia.forEach(r => {
      minutosBrutos += obtenerMinutosDuracion(r.horainicio, r.horafin);
      if (r.horainicio && (!entrada || r.horainicio < entrada)) entrada = r.horainicio;
      if (r.horafin && (!salida || r.horafin > salida)) salida = r.horafin;
    });

    const tieneDatos = tareasDia.length > 0;
    // Si el día no tiene ningún registro (nada cumplimentado en la base de
    // datos), se asume que se cumplió la jornada teórica de ese día a
    // efectos del cálculo de horas pendientes del viernes -en vez de
    // contarlo como 0-, para no penalizar el viernes por días sin datos.
    const minutosEfectivos = tieneDatos
      ? Math.max(0, minutosBrutos - obtenerDescansoMinutos(fechaStr))
      : obtenerJornadaTeoricaMinutos(fechaStr);

    // Entrada/Salida TEÓRICAS cuando el día todavía no tiene ningún
    // registro real (y no es festivo, que no tiene jornada que proyectar):
    // de lunes a jueves se asume la entrada/salida por defecto fija; el
    // viernes la salida depende de lo que quede pendiente esa semana (igual
    // fórmula que ya usaba "Hora salida viernes (prevista)" más abajo), así
    // que necesita que lunes-jueves (idx 0..3) ya estén en datosDiaActual
    // -por eso se calcula aquí, dentro del propio map, en vez de antes-.
    // En cuanto el día tenga algún registro real, esto deja de aplicarse:
    // entrada/salida pasan a ser siempre los valores reales de arriba.
    let proyectada = false;
    if (!tieneDatos && !festivo) {
      entrada = ENTRADA_TEORICA_DEFECTO;
      proyectada = true;
      if (esViernes) {
        const { pendienteMin } = calcularPendienteMinutosViernes();
        salida = sumarMinutosAHora(entrada, Math.max(0, pendienteMin));
      } else {
        salida = SALIDA_TEORICA_LUNES_JUEVES;
      }
    }

    datosDiaActual.push({ fechaStr, entrada, salida, minutosEfectivos, tieneDatos, festivo });

    const tipLabel = proyectada ? ` title="${t.proyectadoTip}"` : '';
    const claseProyectada = proyectada ? ' valor-proyectado' : '';

    return `
      <tr class="fila-dia-editable ${esViernes ? 'fila-viernes' : ''} ${festivo ? 'fila-festivo' : ''}">
        <td>${formatearFechaDDMMYYYY(fecha)}</td>
        <td>${nombresDias[idx]}</td>
        <td class="${claseProyectada}"${tipLabel}>${entrada || '-'}${proyectada ? ' *' : ''}</td>
        <td class="${claseProyectada}"${tipLabel}>${salida || '-'}${proyectada ? ' *' : ''}</td>
        <td>${formatearMinutosAHoras(obtenerJornadaTeoricaMinutos(fechaStr))}</td>
        <td>${tieneDatos ? formatearMinutosAHoras(minutosEfectivos) : `<span title="${t.sinDatos}">00:00</span>`}</td>
      </tr>
    `;
  });

  const tbody = document.getElementById('tabla-semana-body');
  tbody.innerHTML = filas.join('') + `
    <tr class="fila-resumen">
      <td colspan="5">${t.teoricasSemana}</td>
      <td id="valor-teoricas">00:00</td>
    </tr>
    <tr class="fila-resumen">
      <td colspan="5">${t.totalesLunesJueves}</td>
      <td id="valor-totales">00:00</td>
    </tr>
    <tr class="fila-resumen fila-pendiente">
      <td colspan="5" id="txt-pendiente-label" title="${t.pendienteViernesTip}">${t.pendienteViernes} ℹ️</td>
      <td id="valor-pendiente">00:00</td>
    </tr>
    <tr class="fila-resumen fila-salida-prevista">
      <td colspan="5">${t.salidaViernesPrevista}</td>
      <td id="valor-salida-prevista">-</td>
    </tr>
  `;

  const notaProyectado = document.getElementById('txt-nota-proyectado');
  if (notaProyectado) {
    const hayProyectados = datosDiaActual.some(d => !d.tieneDatos && !d.festivo);
    notaProyectado.style.display = hayProyectados ? '' : 'none';
    notaProyectado.textContent = t.notaProyectado;
  }

  actualizarResumenSemana();
}

/**
 * Fórmula de la hora de salida prevista del viernes:
 *  - Horas totales de la semana = suma de la jornada teórica de los 5 días
 *    laborables (obtenerJornadaTeoricaMinutos ya da 0 en festivo/fin de
 *    semana, 7:00 todos los días en verano, y 8:40 lunes-jueves + 7:00
 *    viernes en horario de invierno) → 41:40 en invierno sin festivos, 35:00
 *    en verano sin festivos, menos las horas de cualquier festivo de Ferrol
 *    que caiga esa semana.
 *  - Horas pendientes de trabajo el viernes = horas totales de la semana -
 *    horas trabajadas de lunes a jueves (si algún día se superan las 8:40
 *    teóricas, ese exceso ya reduce lo pendiente del viernes). Un día de
 *    lunes a jueves SIN NINGÚN registro cuenta como si se hubiera cumplido
 *    su jornada teórica -no como 0-, para no penalizar el viernes por días
 *    sin datos en la base de datos (ver minutosEfectivos en cargarSemana).
 *  - Hora de salida del viernes = hora de entrada del viernes (la primera
 *    tarea registrada ese día) + horas pendientes de trabajo.
 *
 * NOTA: la aritmética de esta función es exacta (minutos enteros, sin
 * redondeos); un desfase de pocos minutos entre la salida prevista y la
 * salida real casi siempre viene de que la "entrada del viernes" (o la de
 * cualquier día de lunes a jueves) no reflejaba el momento real en que se
 * empezó a trabajar -típicamente porque el arranque de la sesión remota no
 * se registraba como tarea-. Por eso se ha añadido la tarea "Arranque
 * sesión remota" en app.js: registrándola con la hora real de inicio, la
 * hora de entrada que usa esta fórmula será exacta.
 */
function actualizarResumenSemana() {
  const t = TEXTOS_SEMANA[idiomaActual];

  const { teoricoTotalMin, totalesLunesJueves, pendienteMin } = calcularPendienteMinutosViernes();

  // La hora de salida prevista del viernes se calcula a partir de la
  // entrada de ese día -real si ya hay una tarea registrada, o si no la
  // teórica por defecto (06:45), ver cargarSemana-, así que con la
  // proyección aplicada esto YA tiene valor desde el lunes. Solo queda sin
  // poder calcularse si el propio viernes es festivo (jornada teórica 0,
  // sin proyección). Se acota en 0 para no dar una salida anterior a la
  // propia entrada cuando la semana ya está cumplida antes de empezar el
  // viernes.
  const diaViernes = datosDiaActual[4];
  const salidaPrevista = (diaViernes && diaViernes.festivo)
    ? t.festivoTexto
    : (diaViernes && diaViernes.entrada)
      ? sumarMinutosAHora(diaViernes.entrada, Math.max(0, pendienteMin))
      : t.pendiente;

  document.getElementById('valor-teoricas').textContent = formatearMinutosAHoras(teoricoTotalMin);
  document.getElementById('valor-totales').textContent = formatearMinutosAHoras(totalesLunesJueves);
  document.getElementById('valor-pendiente').textContent = formatearMinutosAHoras(pendienteMin);
  document.getElementById('valor-salida-prevista').textContent = salidaPrevista;
}

function cambiarSemana(direccion) {
  const nuevoLunes = (direccion === 0)
    ? obtenerLunes(new Date())
    : new Date(lunesActual.getFullYear(), lunesActual.getMonth(), lunesActual.getDate() + direccion * 7);

  cargarSemana(nuevoLunes);
}

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = TEXTOS_SEMANA[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('btn-cerrar').textContent = t.cerrar;
  document.getElementById('txt-nota').textContent = t.nota;
  document.getElementById('th-fecha').textContent = t.thFecha;
  document.getElementById('th-dia').textContent = t.thDia;
  document.getElementById('th-entrada').textContent = t.thEntrada;
  document.getElementById('th-salida').textContent = t.thSalida;
  document.getElementById('th-teorica').textContent = t.thTeorica;
  document.getElementById('th-duracion').textContent = t.thDuracion;
  document.getElementById('btn-anterior').textContent = t.anterior;
  document.getElementById('btn-actual').textContent = t.actual;
  document.getElementById('btn-siguiente').textContent = t.siguiente;

  if (lunesActual) cargarSemana(lunesActual);
}

document.addEventListener('DOMContentLoaded', () => {
  cargarSemana(obtenerLunes(new Date()));
});
