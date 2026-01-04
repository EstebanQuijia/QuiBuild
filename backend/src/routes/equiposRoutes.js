const express = require('express');
const router = express.Router();
const equiposController = require('../controllers/equiposController');

console.log("Funciones cargadas:", equiposController);
// Rutas de administración
router.get('/tipos-equipos/todos', equiposController.obtenerTodosTipos);
router.delete('/tipos-equipos/:id', equiposController.eliminarTipo);
router.patch('/tipos-equipos/:id/restaurar', equiposController.restaurarTipo);

router.get('/equipos/todos', equiposController.obtenerTodosEquipos);
router.delete('/equipos/:id', equiposController.eliminarEquipo);
router.patch('/equipos/:id/restaurar', equiposController.restaurarEquipo);

// Rutas
router.post('/tipos-equipos', equiposController.upload.single('foto'), equiposController.crearTipoEquipo);
router.get('/tipos-equipos', equiposController.obtenerTipos);
router.post('/equipos', equiposController.crearEquipo);
router.get('/tipos-equipos/:id', equiposController.obtenerTipoPorId);
router.get('/equipos/tipo/:tipoId', equiposController.obtenerEquiposPorTipo);


module.exports = router;