function seleccionarPlan(cantidad) {
    // Estos son los mínimos que el combo exige para ser considerado ese plan
    const requerimientosBase = {
        1: { receptores: 1, colectores: 1, bastones: 1, tripodes: 0 },
        2: { receptores: 2, colectores: 1, bastones: 2, tripodes: 1 },
        3: { receptores: 3, colectores: 2, bastones: 3, tripodes: 1 }
    };

    const configAlquiler = {
        planId: cantidad,
        nombrePlan: `Plan ${cantidad} Equipo(s)`,
        minimos: requerimientosBase[cantidad], // La base que debe cumplir
        // En seleccionados guardaremos TODO lo que el encargado elija (base + extras)
        seleccionados: {
            receptores: [],
            colectores: [],
            bastones: [],
            tripodes: [],
            accesorios: [] // Aquí van cables, antenas, powerbanks extras, etc.
        },
        fechaInicio: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem('configAlquiler', JSON.stringify(configAlquiler));
    window.location.href = 'inventario.html';
}