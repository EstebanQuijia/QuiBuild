// Verificar sesión
if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

// 1. OBTENER CONFIGURACIÓN DE COMBO (Si existe)
let configAlquiler = JSON.parse(localStorage.getItem('configAlquiler'));

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('configAlquiler');
  window.location.href = '/';
}

// 2. INICIALIZAR INTERFAZ DE COMBO (Barra superior técnica)
function renderizarBarraProgreso() {
  if (!configAlquiler) return;

  const barraExistente = document.getElementById('barra-progreso-alquiler');
  if (barraExistente) barraExistente.remove();

  const barra = document.createElement('div');
  barra.id = 'barra-progreso-alquiler';
  barra.className = 'sticky-top bg-dark text-white p-2 shadow-sm';
  barra.style.top = '0';
  barra.style.zIndex = '1050';
  barra.style.fontSize = '0.85rem';

  const { minimos, seleccionados } = configAlquiler;

  const listoReceptores = seleccionados.receptores.length >= minimos.receptores;
  const listoColectores = seleccionados.colectores.length >= minimos.colectores;
  const listoBastones = seleccionados.bastones.length >= minimos.bastones;
  
  const todoListo = listoReceptores && listoColectores && listoBastones;

  barra.innerHTML = `
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <div>
        <span class="text-warning fw-bold me-3">${configAlquiler.nombrePlan.toUpperCase()}</span>
        <span class="me-2">Receptores: ${seleccionados.receptores.length}/${minimos.receptores}</span>
        <span class="me-2">Colectores: ${seleccionados.colectores.length}/${minimos.colectores}</span>
        <span class="me-2">Bastones: ${seleccionados.bastones.length}/${minimos.bastones}</span>
        <span class="text-info">Extras: ${seleccionados.tripodes.length + seleccionados.accesorios.length}</span>
      </div>
      <div>
        <button class="btn btn-outline-light btn-sm me-2" style="font-size: 0.75rem" onclick="cancelarSeleccion()">Cancelar</button>
        <button class="btn ${todoListo ? 'btn-success' : 'btn-secondary'} btn-sm" 
                style="font-size: 0.75rem"
                ${todoListo ? '' : 'disabled'} 
                onclick="irAResumen()">
          ${todoListo ? 'FINALIZAR SELECCIÓN' : 'PENDIENTE'}
        </button>
      </div>
    </div>
  `;
  document.body.prepend(barra);
}

// 3. CARGAR INVENTARIO (Estilo original restaurado)
async function cargarInventario() {
  try {
    renderizarBarraProgreso();

    const res = await fetch('/api/inventario');
    const data = await res.json();

    const grid = document.getElementById('inventarioGrid');
    grid.innerHTML = '';

    if (data.length === 0) {
      grid.innerHTML = '<p class="text-center">No hay equipos registrados en el inventario.</p>';
      return;
    }

    data.forEach(tipo => {
      const card = document.createElement('div');
      card.className = 'equipo-card';

      let stockClass = 'disponible';
      if (tipo.disponibles === 0) {
        stockClass = 'agotado';
      } else if (tipo.disponibles <= 2) {
        stockClass = 'pocos';
      }

      card.innerHTML = `
        <div class="equipo-foto">
          ${tipo.foto ? `<img src="media/equipos/${tipo.foto}" alt="${tipo.nombre}">` : 'Sin foto'}
        </div>
        <div class="equipo-info">
          <h3>${tipo.nombre}</h3>
          <p><strong>Tipo:</strong> ${tipo.tipo}</p>
          <p><strong>Marca:</strong> ${tipo.marca || 'N/A'}</p>
          <p>${tipo.descripcion || 'Sin descripción'}</p>
          <span class="stock ${stockClass}">
            ${tipo.disponibles} de ${tipo.total} disponibles
          </span>
          <br>
          <button class="btn btn-small" onclick="verUnidades(${tipo.id})">Ver Unidades</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar inventario:', error);
  }
}

function verUnidades(tipoId) {
  window.location.href = `detalle-equipos.html?id=${tipoId}`;
}

function cancelarSeleccion() {
  if (confirm('¿Deseas cancelar la selección actual?')) {
    localStorage.removeItem('configAlquiler');
    window.location.href = 'combos.html';
  }
}

function irAResumen() {
  window.location.href = 'resumen-alquiler.html';
}

document.addEventListener('DOMContentLoaded', cargarInventario);