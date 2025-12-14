// Verificar sesión
if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

// Obtener ID del tipo de equipo desde URL
const urlParams = new URLSearchParams(window.location.search);
const tipoId = urlParams.get('id');

// Carrito temporal
let carrito = JSON.parse(localStorage.getItem('carritoAlquiler')) || [];

// Cargar información del tipo
async function cargarTipoEquipo() {
  try {
    const res = await fetch(`/api/tipos-equipos/${tipoId}`);
    const tipo = await res.json();

    document.getElementById('nombreTipo').textContent = tipo.nombre;
    document.getElementById('tipoEquipo').textContent = tipo.tipo;
    document.getElementById('marcaEquipo').textContent = tipo.marca || 'N/A';
    document.getElementById('modeloEquipo').textContent = tipo.modelo || 'N/A';
    document.getElementById('descripcionEquipo').textContent = tipo.descripcion || 'Sin descripción';
    
    if (tipo.foto) {
      document.getElementById('fotoTipo').src = `media/equipos/${tipo.foto}`;
    }
  } catch (error) {
    console.error('Error al cargar tipo:', error);
  }
}

// Cargar unidades del tipo
async function cargarUnidades() {
  try {
    const res = await fetch(`/api/equipos/tipo/${tipoId}`);
    const unidades = await res.json();

    const container = document.getElementById('listaUnidades');
    
    if (unidades.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No hay unidades registradas de este tipo.</p>';
      return;
    }

    container.innerHTML = '';

    unidades.forEach(unidad => {
      const enCarrito = carrito.find(item => item.id === unidad.id);
      
      let claseEstado = '';
      let textoEstado = '';
      let colorBadge = '';
      let botonHTML = '';

      if (unidad.estado === 'disponible') {
        claseEstado = 'unidad-disponible';
        textoEstado = '✅ Disponible';
        colorBadge = 'bg-success';
        
        if (enCarrito) {
          botonHTML = `<button class="btn btn-warning" onclick="quitarDelCarrito(${unidad.id})">Quitar del carrito</button>`;
        } else {
          botonHTML = `<button class="btn btn-primary" onclick="agregarAlCarrito(${unidad.id}, '${unidad.numero_serie}', '${unidad.variante || ''}')">Seleccionar para alquilar</button>`;
        }
      } else if (unidad.estado === 'alquilado') {
        claseEstado = 'unidad-alquilada';
        textoEstado = '🔴 Alquilado';
        colorBadge = 'bg-danger';
        botonHTML = `<button class="btn btn-secondary" disabled>No disponible</button>`;
      } else {
        claseEstado = 'unidad-mantenimiento';
        textoEstado = '🔧 En mantenimiento';
        colorBadge = 'bg-warning';
        botonHTML = `<button class="btn btn-secondary" disabled>En mantenimiento</button>`;
      }

      const card = document.createElement('div');
      card.className = `unidad-card ${claseEstado}`;
      card.innerHTML = `
        <div class="row align-items-center">
          <div class="col-md-4">
            <h5 class="mb-1">${unidad.numero_serie}</h5>
            ${unidad.variante ? `<p class="text-muted mb-0">Variante: ${unidad.variante}</p>` : ''}
          </div>
          <div class="col-md-4">
            <span class="badge ${colorBadge} badge-custom">${textoEstado}</span>
            ${unidad.observaciones ? `<p class="text-muted small mt-2 mb-0">${unidad.observaciones}</p>` : ''}
          </div>
          <div class="col-md-4 text-end">
            ${botonHTML}
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    actualizarCarrito();
  } catch (error) {
    console.error('Error al cargar unidades:', error);
  }
}

// Agregar equipo al carrito
function agregarAlCarrito(id, numeroSerie, variante) {
  carrito.push({ id, numeroSerie, variante });
  localStorage.setItem('carritoAlquiler', JSON.stringify(carrito));
  cargarUnidades(); // Recargar para actualizar botones
}

// Quitar del carrito
function quitarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  localStorage.setItem('carritoAlquiler', JSON.stringify(carrito));
  cargarUnidades();
}

// Actualizar contador del carrito flotante
function actualizarCarrito() {
  const carritoFlotante = document.getElementById('carritoFlotante');
  const cantidadCarrito = document.getElementById('cantidadCarrito');
  
  if (carrito.length > 0) {
    carritoFlotante.style.display = 'block';
    cantidadCarrito.textContent = carrito.length;
  } else {
    carritoFlotante.style.display = 'none';
  }
}

// Ir a formulario de alquiler
function irAAlquiler() {
  window.location.href = 'crear-alquiler.html';
}

// Cargar al iniciar
cargarTipoEquipo();
cargarUnidades();