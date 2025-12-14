const express = require('express');
const router = express.Router();
const equiposController = require('../controllers/equiposController');

// Rutas
router.post('/tipos-equipos', equiposController.upload.single('foto'), equiposController.crearTipoEquipo);
router.get('/tipos-equipos', equiposController.obtenerTipos);
router.post('/equipos', equiposController.crearEquipo);
router.get('/tipos-equipos/:id', equiposController.obtenerTipoPorId);
router.get('/equipos/tipo/:tipoId', equiposController.obtenerEquiposPorTipo);

module.exports = router;