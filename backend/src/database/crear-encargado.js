const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Al estar el script en la misma carpeta que la BD, usamos './inventario.db'
const dbPath = path.join(__dirname, 'inventario.db'); 
const db = new sqlite3.Database(dbPath);

async function crearEncargado() {
    const nombre = "Encargado de Servicio";
    const correo = "encargado@2q.com";
    const password = "encargado123";
    const rol = "encargado"; 

    // Encriptación compatible con tu authController
    const salt = await bcrypt.genSalt(10);
    const contraseñaHash = await bcrypt.hash(password, salt);

    // Verificamos si la tabla existe antes de insertar
    db.serialize(() => {
        db.run(
            "INSERT OR IGNORE INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)",
            [nombre, correo, contraseñaHash, rol],
            function(err) {
                if (err) {
                    console.error("❌ Error:", err.message);
                } else {
                    console.log(`✅ Usuario Encargado creado con éxito.`);
                    console.log(`   Acceso: ${correo} / ${password}`);
                }
            }
        );
    });

    db.close();
}

crearEncargado();