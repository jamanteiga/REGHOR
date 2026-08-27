// Renderizar la tabla con las tareas registradas
function renderTabla() {
  const tbody = document.getElementById('tabla-registros');
  tbody.innerHTML = '';
  
  tareas.slice().reverse().forEach(t => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-gray-50";
    tr.innerHTML = `
      <td class="p-2 border-b">${t.fecha}</td>
      <td class="p-2 border-b font-medium">${t.tarea}</td>
      <td class="p-2 border-b"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">${t.proyecto}</span></td>
      <td class="p-2 border-b">${t.bloque || '-'}</td>
      <td class="p-2 border-b">${t.horaInicio}</td>
      <td class="p-2 border-b">${t.horaFin || '-'}</td>
      <td class="p-2 border-b text-gray-600">${t.comentario || '-'}</td>
      <td class="p-2 border-b text-gray-600">${t.notas || '-'}</td>
      <td class="p-2 border-b font-bold">${t.duracion || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}