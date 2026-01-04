// Verificar sesión
if (!localStorage.getItem('token')) {
    window.location.href = '/';
}

// Obtener ID del tipo de equipo desde URL
const urlParams = new URLSearchParams(window.location.search);
const tipoId = urlParams.get('id');

// Carrito temporal y Configuración de Combo
let carrito = JSON.parse(localStorage.getItem('carritoAlquiler')) || [];
let configAlquiler = JSON.parse(localStorage.getItem('configAlquiler')); // Recuperar plan activo

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
            card.className = `unidad-card ${claseEstado} mb-3 p-3 border rounded shadow-sm`;
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

// Agregar equipo al carrito (CON LÓGICA DE COMBO)
function agregarAlCarrito(id, numeroSerie, variante) {
    // 1. Añadir al carrito estándar
    carrito.push({ id, numeroSerie, variante });
    localStorage.setItem('carritoAlquiler', JSON.stringify(carrito));

    // 2. Si hay un combo activo, actualizar sus contadores
    if (configAlquiler) {
        const nombreTipo = document.getElementById('nombreTipo').textContent.toLowerCase();
        
        if (nombreTipo.includes('receptor') || nombreTipo.includes('gps')) {
            configAlquiler.seleccionados.receptores.push(id);
        } else if (nombreTipo.includes('colector') || nombreTipo.includes('celular')) {
            configAlquiler.seleccionados.colectores.push(id);
        } else if (nombreTipo.includes('bastón') || nombreTipo.includes('baston')) {
            configAlquiler.seleccionados.bastones.push(id);
        } else {
            configAlquiler.seleccionados.otros.push(id);
        }
        
        localStorage.setItem('configAlquiler', JSON.stringify(configAlquiler));
    }

    cargarUnidades(); // Recargar para actualizar botones
}

// Quitar del carrito (CON LÓGICA DE COMBO)
function quitarDelCarrito(id) {
    // 1. Quitar del carrito estándar
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carritoAlquiler', JSON.stringify(carrito));

    // 2. Quitar de la configuración del combo
    if (configAlquiler) {
        configAlquiler.seleccionados.receptores = configAlquiler.seleccionados.receptores.filter(cid => cid !== id);
        configAlquiler.seleccionados.colectores = configAlquiler.seleccionados.colectores.filter(cid => cid !== id);
        configAlquiler.seleccionados.bastones = configAlquiler.seleccionados.bastones.filter(cid => cid !== id);
        configAlquiler.seleccionados.otros = configAlquiler.seleccionados.otros.filter(cid => cid !== id);
        
        localStorage.setItem('configAlquiler', JSON.stringify(configAlquiler));
    }

    cargarUnidades();
}

// Actualizar contador del carrito flotante
function actualizarCarrito() {
    const carritoFlotante = document.getElementById('carritoFlotante');
    const cantidadCarrito = document.getElementById('cantidadCarrito');
    
    // Si hay combo, usamos la lógica de la barra superior de inventario.js
    // Si no, mostramos el carrito flotante tradicional
    if (carrito.length > 0) {
        if (carritoFlotante) carritoFlotante.style.display = 'block';
        if (cantidadCarrito) cantidadCarrito.textContent = carrito.length;
    } else {
        if (carritoFlotante) carritoFlotante.style.display = 'none';
    }
}

// Ir a formulario de alquiler
function irAAlquiler() {
    window.location.href = 'crear-alquiler.html';
}

// Cargar al iniciar
cargarTipoEquipo();
cargarUnidades();