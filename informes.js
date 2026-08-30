// SUPABASE_URL, SUPABASE_KEY, supabaseClient, TABLA, crearRegexFiltro,
// calcularDuracion, toggleTheme y cerrarPestana ahora viven en config.js

document.addEventListener('DOMContentLoaded', () => {
  establecerValoresPorDefecto();
  cargarInforme();
});

function establecerValoresPorDefecto() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  const fechaHoy = new Date(hoy.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

  document.getElementById('filtro-desde').value = fechaHoy;
  document.getElementById('filtro-hasta').value = fechaHoy;

  document.getElementById('filtro-tarea').value = '*';
  document.getElementById('filtro-proyecto').value = '*';
  document.getElementById('filtro-bloque').value = '*';
  document.getElementById('filtro-comentario').value = '*';
}

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
  } else if (tipo === 'semana_anterior') {
    const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay();
    const inicioSemanaActual = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (diaSemana - 1));
    desde = new Date(inicioSemanaActual.getFullYear(), inicioSemanaActual.getMonth(), inicioSemanaActual.getDate() - 7);
    hasta = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + 6);
  } else if (tipo === 'mes') {
    desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  }

  document.getElementById('filtro-desde').value = formatearFechaISO(desde);
  document.getElementById('filtro-hasta').value = formatearFechaISO(hasta);

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

  let totalMinutos = 0;

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

    totalMinutos += obtenerMinutosDuracion(item.horainicio, item.horafin);

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

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
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
