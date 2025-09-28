import offers from '../models/offers.model.js'
import user from '../models/users.model.js'

// Lista de valores canónicos según el modelo
const MUNICIPIOS_LISTA = ['Barbosa', 'Copacabana', 'Girardota', 'Bello', 'Medellín', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella', 'Caldas']
const CATEGORIAS_LISTA = ['Jardinería', 'Limpieza', 'Piscinero', 'Carpintería', 'Mantenimiento', 'Plomería']

// Utilidad: comparación sin tildes/diacríticos y case-insensitive
function canon(s){
    return String(s||'')
        .normalize('NFD')
        .replace(/\p{Diacritic}+/gu, '')
        .toLowerCase()
        .trim()
}

// Normaliza el objeto municipio recibido desde formularios (nombre -> id)
function normalizarMunicipio(municipio) {
    if (!municipio) return municipio
    const nombre = municipio.nombre || municipio
    const target = canon(nombre)
    const idx = MUNICIPIOS_LISTA.findIndex(m => canon(m) === target)
    return {
        id: idx >= 0 ? idx + 1 : 0, // 0 si no coincide; el esquema solo requiere que exista el campo
        nombre: idx >= 0 ? MUNICIPIOS_LISTA[idx] : nombre,
    }
}

function normalizarCategoria(categoria){
    if (!categoria) return categoria
    const target = canon(categoria)
    const found = CATEGORIAS_LISTA.find(c => canon(c) === target)
    return found || categoria
}

async function hidratarEmpleador(empleador) {
    if (!empleador) return empleador
    let idUsuario = typeof empleador === 'string' ? empleador : (empleador.idUsuario || empleador._id || empleador.id)
    let nombre = empleador.nombre
    if (!nombre && idUsuario) {
        const u = await user.findById(idUsuario).lean().catch(() => null)
        if (u) nombre = `${u.nombres} ${u.apellidos}`
    }
    return { idUsuario, nombre }
}

export const createOffer = async (req, res) => {
    try {
    const payload = { ...req.body }
    payload.visible = typeof payload.visible === 'string' ? payload.visible === 'true' : !!payload.visible
    payload.municipio = normalizarMunicipio(payload.municipio)
    payload.categoria = normalizarCategoria(payload.categoria)
    // Si no llega empleador explícito, usar el usuario autenticado (si está disponible en req.user)
    if (!payload.empleador && req.user) {
        payload.empleador = { idUsuario: req.user._id || req.user.id }
    }
    payload.empleador = await hidratarEmpleador(payload.empleador)

    // Normalizar imágenes (arreglo) y validar cantidad 1..5
    if (payload.imagenes) {
        if (typeof payload.imagenes === 'string') {
            try { payload.imagenes = JSON.parse(payload.imagenes) } catch { payload.imagenes = [payload.imagenes] }
        }
        if (!Array.isArray(payload.imagenes)) payload.imagenes = []
        payload.imagenes = payload.imagenes.filter(Boolean).slice(0,5)
    }

    const {empleador, municipio, nombreServicio, descripcion, categoria, precioReferencia, personasRequeridas, detalleRequerimiento, visible, fechaCreacion, fechaLimite} = payload
    const nuevaOferta = new offers({empleador, municipio, nombreServicio, descripcion, categoria, precioReferencia, personasRequeridas, detalleRequerimiento, visible, fechaCreacion, fechaLimite, imagenes: payload.imagenes})
        await nuevaOferta.save()

        // Promover automáticamente a empleador si era empleado 
        if (empleador?.idUsuario) {
            try {
                await user.updateOne(
                    { _id: empleador.idUsuario, rol: 'empleado' },
                    { $set: { rol: 'empleador' } },
                    { runValidators: false }
                )
            } catch (_) {}
        }

        res.status(201).json({message: 'Oferta creada satisfactoriamente', data: nuevaOferta, success: true})
    } catch (error) {
        if (error && error.name === 'ValidationError') {
            const entries = Object.entries(error.errors || {})
            const details = entries.map(([path, e]) => e.message)
            const fieldErrors = entries.reduce((acc,[path,e])=>{ acc[path]=e.message; return acc },{})
            return res.status(400).json({ success:false, message: 'Validación fallida al crear oferta', errors: details, fieldErrors })
        }
        res.status(500).json({ success:false, message: 'Error al crear oferta', error: error.message })
    }
}

export const searchOffers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1
        const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10
        const skip = (page - 1) * limit

        const total = await offers.countDocuments()
        const ofertasEncontradas = await offers.find().skip(skip).limit(limit)

        res.status(200).json({
            success: true,
            data: ofertasEncontradas,
            total,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                pageSize: limit,
            },
        })
    } catch (error) {
        res.status(500).json({message: 'No se han encontrado ofertas', error: error.message})
    }
}

export const searchOfferById = async (req, res) => {
    try {
        const ofertaEncontrada = await offers.findById(req.params.id)
        if (!ofertaEncontrada) return res.status(404).json({message: 'No se ha encontrado la oferta'})
        res.status(200).json({data: ofertaEncontrada, success: true})
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna oferta ${error.message}`})
    }
}

export const updateOffer = async (req, res) => {
    try {
    // Normalizamos payload proveniente del formulario
    const payload = { ...req.body }
    if (payload.visible !== undefined) payload.visible = typeof payload.visible === 'string' ? payload.visible === 'true' : !!payload.visible
    if (payload.municipio) payload.municipio = normalizarMunicipio(payload.municipio)
    if (payload.categoria) payload.categoria = normalizarCategoria(payload.categoria)
    if (payload.empleador) payload.empleador = await hidratarEmpleador(payload.empleador)

    try {
        const ofertaActualizada = await offers.findByIdAndUpdate(req.params.id, payload, {new: true, runValidators: true})
        if (!ofertaActualizada) return res.status(404).json({message: 'No se ha encontrado la oferta'})
        res.status(200).json({data: ofertaActualizada, success: true})
    } catch (error) {
        if (error && error.name === 'ValidationError') {
            const entries = Object.entries(error.errors || {})
            const details = entries.map(([path, e]) => e.message)
            const fieldErrors = entries.reduce((acc,[path,e])=>{ acc[path]=e.message; return acc },{})
            return res.status(400).json({ success:false, message: 'Validación fallida al actualizar oferta', errors: details, fieldErrors })
        }
        res.status(500).json({ success:false, message: 'No se pudo actualizar la oferta', error: error.message })
    }
    } catch (e) {
        res.status(500).json({ success:false, message: 'Error procesando actualización de oferta', error: e.message })
    }
}

export const deleteOffer = async (req, res) => {
    try {
        const ofertaEliminada = await offers.findByIdAndDelete(req.params.id)
        if (!ofertaEliminada) return res.status(404).json({message: 'Oferta no encontrada'})
        res.status(200).json({message: 'Oferta eliminada satisfactoriamente', success: true})
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna oferta ${error.message}`})
    }
}

export const incrementOfferViews = async (req, res) => {
    try {
        const updated = await offers.findByIdAndUpdate(
            req.params.id,
            { $inc: { visualizaciones: 1 } },
            { new: true }
        )
        if (!updated) return res.status(404).json({ message: 'Oferta no encontrada' })
        res.json({ success: true, data: updated })
    } catch (error) {
        res.status(500).json({ success: false, message: 'No se pudo actualizar visualizaciones', error: error.message })
    }
}