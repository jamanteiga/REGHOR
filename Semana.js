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
    pendienteViernes: 'Horas pendientes hasta viernes', salidaViernesPrevista: 'Hora salida viernes (prevista)',
    pendiente: 'Pendiente', sinDatos: 'Sin tareas registradas'
  },
  gl: {
    titulo: '📅 Resumo Semanal', cerrar: '❌ Pechar', nota: 'Cálculo automático a partir das tarefas rexistradas cada día na Listaxe de Tarefas.',
    thFecha: 'Data', thDia: 'Día', thEntrada: 'Entrada', thSalida: 'Saída',
    thTeorica: 'Xornada Teórica', thDuracion: 'Duración', anterior: '◀ Semana anterior', actual: 'Semana actual', siguiente: 'Semana seguinte ▶',
    teoricasSemana: 'Horas teóricas semana', totalesLunesJueves: 'Horas totais semana (luns-xoves)',
    pendienteViernes: 'Horas pendentes ata venres', salidaViernesPrevista: 'Hora saída venres (prevista)',
    pendiente: 'Pendente', sinDatos: 'Sen tarefas rexistradas'
  },
  en: {
    titulo: '📅 Weekly Summary', cerrar: '❌ Close', nota: 'Calculated automatically from the tasks logged each day in the Task List.',
    thFecha: 'Date', thDia: 'Day', thEntrada: 'Start', thSalida: 'End',
    thTeorica: 'Theoretical Shift', thDuracion: 'Duration', anterior: '◀ Previous Week', actual: 'Current Week', siguiente: 'Next Week ▶',
    teoricasSemana: 'Weekly Theoretical Hours', totalesLunesJueves: 'Total Hours (Mon-Thu)',
    pendienteViernes: 'Hours Pending Until Friday', salidaViernesPrevista: 'Friday End Time (estimated)',
    pendiente: 'Pending', sinDatos: 'No tasks logged'
  }
};

// MESES vive en config.js (compartido con app.js)

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
    const minutosEfectivos = (minutosBrutos > 0)
      ? Math.max(0, minutosBrutos - obtenerDescansoMinutos(fechaStr))
      : 0;

    datosDiaActual.push({ fechaStr, entrada, salida, minutosEfectivos, tieneDatos, festivo });

    return `
      <tr class="fila-dia-editable ${esViernes ? 'fila-viernes' : ''} ${festivo ? 'fila-festivo' : ''}">
        <td>${formatearFechaDDMMYYYY(fecha)}</td>
        <td>${nombresDias[idx]}</td>
        <td>${entrada || '-'}</td>
        <td>${salida || '-'}</td>
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
      <td colspan="5">${t.pendienteViernes}</td>
      <td id="valor-pendiente">00:00</td>
    </tr>
    <tr class="fila-resumen fila-salida-prevista">
      <td colspan="5">${t.salidaViernesPrevista}</td>
      <td id="valor-salida-prevista">-</td>
    </tr>
  `;

  actualizarResumenSemana();
}

/**
 * Fórmula de la hora de salida prevista del viernes:
 *  - Horas totales de la semana = suma de la jornada teórica de los 5 días
 *    laborables (obtenerJornadaTeoricaMinutos ya da 0 en festivo/fin de
 *    semana, 7:00 todos los días en verano, y 8:30 lunes-jueves + 7:00
 *    viernes el resto del año) → 41:00 en invierno sin festivos, 35:00 en
 *    verano sin festivos, menos las horas de cualquier festivo de Ferrol
 *    que caiga esa semana.
 *  - Horas pendientes de trabajo el viernes = horas totales de la semana -
 *    horas REALMENTE trabajadas de lunes a jueves (si algún día se superan
 *    las 8:30 teóricas, ese exceso ya reduce lo pendiente del viernes).
 *  - Hora de salida del viernes = hora de entrada del viernes (la primera
 *    tarea registrada ese día) + horas pendientes de trabajo.
 */
function actualizarResumenSemana() {
  const t = TEXTOS_SEMANA[idiomaActual];

  let teoricoTotalMin = 0;
  diasSemanaActual.forEach(fecha => {
    teoricoTotalMin += obtenerJornadaTeoricaMinutos(formatearFechaISO(fecha));
  });

  let totalesLunesJueves = 0;
  for (let i = 0; i < 4; i++) {
    totalesLunesJueves += datosDiaActual[i].minutosEfectivos;
  }

  const pendienteMin = teoricoTotalMin - totalesLunesJueves;

  // La hora de salida prevista del viernes se calcula a partir de la
  // primera tarea que ya hayas registrado ese día (su hora de inicio); si
  // el viernes aún no tiene ninguna tarea registrada, no se puede calcular.
  // Se acota en 0 para no dar una salida anterior a la propia entrada
  // cuando la semana ya está cumplida antes de empezar el viernes.
  const diaViernes = datosDiaActual[4];
  const salidaPrevista = (diaViernes && diaViernes.entrada)
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