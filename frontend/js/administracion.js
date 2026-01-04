// Verificar sesión
if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

// ==================== TIPOS DE EQUIPOS ====================

async function cargarTipos() {
  try {
    const res = await fetch('/api/tipos-equipos/todos'); 
    const tipos = await res.json();

    const tbody = document.getElementById('listaTipos');
    tbody.innerHTML = '';

    if (tipos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tipos registrados</td></tr>';
      return;
    }

    tipos.forEach(tipo => {
      const activo = tipo.activo === 1 || tipo.activo === null;
      const badgeClass = activo ? 'badge-activo' : 'badge-inactivo';
      const badgeText = activo ? 'Activo' : 'Inactivo';

      const row = document.createElement('tr');
      if (!activo) row.style.opacity = '0.6';

      row.innerHTML = `
        <td>${tipo.id}</td>
        <td>${tipo.nombre}</td>
        <td>${tipo.tipo}</td>
        <td>${tipo.marca || 'N/A'}</td>
        <td><span class="${badgeClass}">${badgeText}</span></td>
        <td>
          ${activo ? 
            `<button class="btn btn-sm btn-danger" onclick="eliminarTipo(${tipo.id}, '${tipo.nombre}')">Eliminar</button>` :
            `<button class="btn btn-sm btn-success" onclick="restaurarTipo(${tipo.id})">Restaurar</button>`
          }
        </td>
      `;

      tbody.appendChild(row);
    });

    actualizarFiltroTipos(tipos.filter(t => t.activo === 1 || t.activo === null));

  } catch (error) {
    console.error('Error:', error);
  }
}

function actualizarFiltroTipos(tipos) {
  const select = document.getElementById('filtroTipo');
  if (!select) return;
  select.innerHTML = '<option value="">Todos los tipos</option>';
  
  tipos.forEach(tipo => {
    const option = document.createElement('option');
    option.value = tipo.id;
    option.textContent = tipo.nombre;
    select.appendChild(option);
  });
}

// CORRECCIÓN 1: Mensaje de advertencia actualizado
async function eliminarTipo(id, nombre) {
  if (!confirm(`¿Desactivar el tipo "${nombre}"?\n\nEsto ocultará el tipo del inventario y TAMBIÉN desactivará todas las unidades asociadas.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/tipos-equipos/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.mensaje);
      cargarTipos();
      cargarUnidades(); // CORRECCIÓN 2: Refrescar unidades también
    } else {
      alert(data.mensaje || 'Error al desactivar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}

async function restaurarTipo(id) {
  try {
    const res = await fetch(`/api/tipos-equipos/${id}/restaurar`, {
      method: 'PATCH'
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.mensaje);
      cargarTipos();
      cargarUnidades(); // Refrescar unidades para verlas activas
    } else {
      alert(data.mensaje || 'Error al restaurar');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// ==================== UNIDADES INDIVIDUALES ====================

async function cargarUnidades() {
  const filtro = document.getElementById('filtroTipo');
  const tipoId = filtro ? filtro.value : '';
  
  try {
    let url = '/api/equipos/todos';
    if (tipoId) {
      url += `?tipo=${tipoId}`;
    }

    const res = await fetch(url);
    const unidades = await res.json();

    const tbody = document.getElementById('listaUnidades');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (unidades.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay unidades registradas</td></tr>';
      return;
    }

    unidades.forEach(unidad => {
      const activo = unidad.activo === 1 || unidad.activo === null;
      const badgeClass = activo ? 'badge-activo' : 'badge-inactivo';
      const badgeText = activo ? 'Activo' : 'Inactivo';

      const row = document.createElement('tr');
      if (!activo) row.style.opacity = '0.6';

      row.innerHTML = `
        <td>${unidad.id}</td>
        <td>${unidad.tipo_nombre || 'N/A'}</td>
        <td>${unidad.numero_serie}</td>
        <td>${unidad.variante || '-'}</td>
        <td>${unidad.estado}</td>
        <td><span class="${badgeClass}">${badgeText}</span></td>
        <td>
          ${activo ? 
            `<button class="btn btn-sm btn-danger" onclick="eliminarUnidad(${unidad.id}, '${unidad.numero_serie}')">Eliminar</button>` :
            `<button class="btn btn-sm btn-success" onclick="restaurarUnidad(${unidad.id})">Restaurar</button>`
          }
        </td>
      `;

      tbody.appendChild(row);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

async function eliminarUnidad(id, numeroSerie) {
  if (!confirm(`¿Desactivar la unidad "${numeroSerie}"?\n\nEsta unidad ya no aparecerá en el inventario.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/equipos/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.mensaje);
      cargarUnidades();
    } else {
      alert(data.mensaje || 'Error al desactivar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}

// CORRECCIÓN 3: Refrescar ambas tablas al restaurar unidad
async function restaurarUnidad(id) {
  try {
    const res = await fetch(`/api/equipos/${id}/restaurar`, {
      method: 'PATCH'
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.mensaje);
      // Al restaurar un hijo, el servidor activa al padre. Refrescamos ambas.
      cargarTipos();
      cargarUnidades();
    } else {
      alert(data.mensaje || 'Error al restaurar');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarTipos();
  cargarUnidades();
});