import user from '../models/users.model.js'
import offers from '../models/offers.model.js'
import applyments from '../models/applyments.model.js'
import contracts from '../models/contracts.model.js'
import { generateLog } from '../middlewares/log.js'

export const createUser = async (req, res) => {
    try {
        const { nombres, apellidos, email, telefono, passwordHash, fechaRegistro, rol, municipio, direccion, seguridadSocial} = req.body
        const nuevoUsuario = new user({ nombres, apellidos, email, telefono, passwordHash, fechaRegistro, rol, municipio, direccion, seguridadSocial})
        await nuevoUsuario.save()
        generateLog('logs/usuario.log', `El perfil: ${nuevoUsuario.rol} ha creado un nuevo usuario (${nuevoUsuario.rol} - ${nuevoUsuario.nombres} ${nuevoUsuario.apellidos} ) a las ${new Date()} \n`)
    // Respuesta estándar con envoltura de éxito
    res.status(201).json({ success: true, message: 'Usuario creado correctamente', data: nuevoUsuario })

    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error: error.message})
    }
}

export const getUsers = async (req, res) => {
    try {
        // Paginación: se aceptan query params ?page y ?limit
        const page = Number.parseInt(req.query.page) > 0 ? Number.parseInt(req.query.page) : 1
        const limit = Number.parseInt(req.query.limit) > 0 ? Number.parseInt(req.query.limit) : 10
        const skip = (page - 1) * limit

        // Filtro opcional por rol (?rol=empleado|empleador)
        const filtro = {}
        if (req.query.rol) {
            filtro.rol = req.query.rol
        }

        const total = await user.countDocuments(filtro)
        const usuarios = await user.find(filtro).skip(skip).limit(limit)

        res.status(200).json({
            success: true,
            data: usuarios,
            total,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                pageSize: limit,
            },
        })
    } catch (error) {
        res.status(500).json({ success: false, message: `Error al obtener usuarios: ${error.message}` })
    }
}

export const getUserById = async (req, res) => {
    try {
        const usuario = await user.findById(req.params.id)

        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' })

    res.status(200).json({ success: true, data: usuario })

    } catch (error) {
        res.status(500).json({ message: `Error al obtener usuario ${error.message}` })
    }
}

export const updateUser = async (req, res) => {
    try {
        const usuarioActualizado = await user.findByIdAndUpdate(req.params.id, req.body, { new: true })

    if (!usuarioActualizado) return res.status(404).json({ message: 'Usuario no encontrado' })

    res.status(200).json({ success: true, data: usuarioActualizado })

    } catch (error) {
        res.status(500).json({ message: `Error al actualizar usuario ${error.message}`})
    }
}

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id

        // Bloquear si hay contratos activos
        const activeContracts = await contracts.countDocuments({ $or: [{ 'empleado.idUsuario': userId }, { 'empleador.idUsuario': userId }], estado: 'Activo' })
        if (activeContracts > 0){
            return res.status(409).json({ success:false, message: 'No se puede eliminar la cuenta: existen contratos activos asociados.' })
        }

        // Recolectar ofertas del usuario para borrar postulaciones relacionadas
        const hisOffers = await offers.find({ 'empleador.idUsuario': userId }, { _id:1 }).lean()
        const offerIds = hisOffers.map(o=>o._id)

        // 1) Eliminar postulaciones hechas por el usuario
        const delApplymentsUser = await applyments.deleteMany({ 'empleado.idUsuario': userId })
        // 2) Eliminar postulaciones hacia sus ofertas
        const delApplyOnHisOffers = offerIds.length ? await applyments.deleteMany({ 'servicio.idServicio': { $in: offerIds } }) : { deletedCount: 0 }
        // 3) Eliminar ofertas creadas por el usuario
        const delOffers = await offers.deleteMany({ 'empleador.idUsuario': userId })
        // 4) Eliminar contratos no activos donde participa el usuario (por coherencia)
        const delContracts = await contracts.deleteMany({ $or: [{ 'empleado.idUsuario': userId }, { 'empleador.idUsuario': userId }], estado: { $ne: 'Activo' } })
        // 5) Finalmente, eliminar usuario
        const usuarioEliminado = await user.findByIdAndDelete(userId);
        if (!usuarioEliminado) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.status(200).json({ success: true, message: 'Usuario eliminado correctamente', cascade: { offers: delOffers?.deletedCount||0, applymentsUser: (delApplymentsUser?.deletedCount||0), applymentsOnHisOffers: (delApplyOnHisOffers?.deletedCount||0), contracts: delContracts?.deletedCount||0 } });
    } catch (error) {
        res.status(500).json({ message: `Error al eliminar usuario ${error.message}`});
    }
}