const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./inventario.db');

console.log('🔧 Agregando soporte para borrado lógico...\n');

db.serialize(() => {
  // Agregar campo "activo" a tipos_equipos
  db.run("ALTER TABLE tipos_equipos ADD COLUMN activo INTEGER DEFAULT 1", (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✅ Campo "activo" ya existe en tipos_equipos');
      } else {
        console.error('❌ Error en tipos_equipos:', err);
      }
    } else {
      console.log('✅ Campo "activo" agregado a tipos_equipos');
    }
  });

  // Agregar campo "activo" a equipos
  db.run("ALTER TABLE equipos ADD COLUMN activo INTEGER DEFAULT 1", (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✅ Campo "activo" ya existe en equipos');
      } else {
        console.error('❌ Error en equipos:', err);
      }
    } else {
      console.log('✅ Campo "activo" agregado a equipos');
    }
  });

  // Agregar campo "activo" a clientes
  db.run("ALTER TABLE clientes ADD COLUMN activo INTEGER DEFAULT 1", (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✅ Campo "activo" ya existe en clientes');
      } else {
        console.error('❌ Error en clientes:', err);
      }
    } else {
      console.log('✅ Campo "activo" agregado a clientes');
    }
  });
});

setTimeout(() => {
  db.close(() => {
    console.log('\n🎉 Actualización completada');
  });
}, 1000);