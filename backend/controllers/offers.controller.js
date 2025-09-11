import offers from '../models/offers.model.js'
import user from '../models/users.model.js'

// Lista de municipios válida según el modelo para asignar un id numérico
const MUNICIPIOS_LISTA = ['Barbosa', 'Copacabana', 'Girardota', 'Bello', 'Medellín', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella', 'Caldas']

// Normaliza el objeto municipio recibido desde formularios (nombre -> id)
function normalizarMunicipio(municipio) {
    if (!municipio) return municipio
    const nombre = municipio.nombre || municipio
    const idx = MUNICIPIOS_LISTA.findIndex(m => m.toLowerCase() === String(nombre).toLowerCase())
    return {
        id: idx >= 0 ? idx + 1 : 0, // 0 si no coincide; el esquema solo requiere que exista el campo
        nombre: idx >= 0 ? MUNICIPIOS_LISTA[idx] : nombre,
    }
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
    payload.empleador = await hidratarEmpleador(payload.empleador)

    const {empleador, municipio, nombreServicio, descripcion, categoria, precioReferencia, personasRequeridas, detalleRequerimiento, visible, fechaCreacion, fechaLimite} = payload
    const nuevaOferta = new offers({empleador, municipio, nombreServicio, descripcion, categoria, precioReferencia, personasRequeridas, detalleRequerimiento, visible, fechaCreacion, fechaLimite})
        await nuevaOferta.save()

        res.status(201).json({message: 'Oferta creada satisfactoriamente', data: nuevaOferta, success: true})
    } catch (error) {
        if (error && error.name === 'ValidationError') {
            const details = Object.values(error.errors || {}).map(e => e.message)
            return res.status(400).json({ message: 'Validación fallida al crear oferta', errors: details })
        }
        res.status(500).json({ message: 'Error al crear oferta', error: error.message })
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
    if (payload.empleador) payload.empleador = await hidratarEmpleador(payload.empleador)

    const ofertaActualizada = await offers.findByIdAndUpdate(req.params.id, payload, {new: true})
        if (!ofertaActualizada) return res.status(404).json({message: 'No se ha encontrado la oferta'})
        res.status(200).json({data: ofertaActualizada, success: true})
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna oferta ${error.message}`})
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