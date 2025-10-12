import applyments from '../models/applyments.model.js'
import offers from '../models/offers.model.js'
import users from '../models/users.model.js'
import { sendMail } from '../config/mailer.js'

export const createApplyment = async (req, res) => {
    try {
        const {servicio, empleado, fechaPostulacion, estado} = req.body
        if (!servicio?.idServicio || !empleado?.idUsuario){
            return res.status(400).json({ success:false, message:'Datos incompletos para postulación' })
        }

        // Regla: el creador de la oferta no puede postularse
        const offer = await offers.findById(servicio.idServicio).lean().catch(()=>null)
        if (offer && String(offer.empleador?.idUsuario) === String(empleado.idUsuario)){
            return res.status(400).json({ success:false, message:'No puedes postularte a tu propia oferta' })
        }

        // Regla: un usuario solo puede tener una postulación activa a la misma oferta
        const existingActive = await applyments.findOne({
            'servicio.idServicio': servicio.idServicio,
            'empleado.idUsuario': empleado.idUsuario,
            estado: { $nin: ['Cancelada', 'Rechazada'] }
        })
        if (existingActive){
            return res.status(409).json({ success:false, message:'Ya tienes una postulación activa para esta oferta' })
        }
        const estadoNormalizado = ['Aceptada','Pendiente','Rechazada','Cancelada'].includes(estado) ? estado : 'Pendiente'
        const nombreServicio = servicio?.nombreServicio || offer?.nombreServicio
        if (!nombreServicio){
            return res.status(400).json({ success:false, message:'La oferta no está disponible para postulación' })
        }
        const nombreEmpleado = (empleado?.nombre || '').trim()
        const payload = {
            servicio: {
                idServicio: servicio.idServicio,
                nombreServicio
            },
            empleado: {
                idUsuario: empleado.idUsuario,
                nombre: nombreEmpleado || 'Usuario'
            },
            fechaPostulacion: fechaPostulacion || new Date(),
            estado: estadoNormalizado
        }

        const nuevaPostulacion = new applyments(payload)
        await nuevaPostulacion.save()

        // Respuesta estándar con indicador de éxito
        res.status(201).json({ success: true, message: 'Postulación creada satisfactoriamente', data: nuevaPostulacion })
    } catch (error) {
        res.status(500).json({message: 'Error al crear postulación', error: error.message})
    }
}

export const searchApplyments = async (req, res) => {
    try {
        // Paginación: se aceptan query params ?page y ?limit
        const page = Number.parseInt(req.query.page) > 0 ? Number.parseInt(req.query.page) : 1
        const limit = Number.parseInt(req.query.limit) > 0 ? Number.parseInt(req.query.limit) : 10
        const skip = (page - 1) * limit

        // Filtrar por userId o employerId
        const filter = {}
        if (req.query.userId) {
            filter['empleado.idUsuario'] = req.query.userId
        }
        if (req.query.employerId) {
            const employerOffers = await offers.find({ 'empleador.idUsuario': req.query.employerId }).select('_id').lean()
            const offerIds = employerOffers.map(o => o._id)
            filter['servicio.idServicio'] = { $in: offerIds }
        }

        const total = await applyments.countDocuments(filter)
        const postulacionesEncontradas = await applyments.find(filter).skip(skip).limit(limit)

        res.status(200).json({
            success: true,
            data: postulacionesEncontradas,
            total,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                pageSize: limit,
            },
        })
    } catch (error) {
        res.status(500).json({message: `No se han encontrado postulaciones ${error.message}`})
    }
}

export const searchApplymentById = async (req, res) => {
    try {
        const postulacionEncontrada = await applyments.findById(req.params.id)
        if (!postulacionEncontrada) return res.status(404).json({message: 'No se ha encontrado la postulación'})
        res.status(200).json({ success: true, data: postulacionEncontrada })
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna postulación ${error.message}`})
    }
}

export const updateApplyment = async (req, res) => {
    try {
        const payload = { ...req.body }
        // Validación simple de estado opcional
        if (payload.estado && !['Aceptada','Pendiente','Rechazada','Cancelada'].includes(payload.estado)){
            return res.status(400).json({ success:false, message:'Estado inválido' })
        }
        const postulacionActualizada = await applyments.findByIdAndUpdate(req.params.id, payload, {new: true})
        if (!postulacionActualizada) return res.status(404).json({message: 'No se ha encontrado la postulación'})

        // Enviar notificación por correo si el estado cambió a Aceptada o Rechazada
        if (payload.estado === 'Aceptada' || payload.estado === 'Rechazada') {
            const user = await users.findById(postulacionActualizada.empleado.idUsuario).lean()
            if (user && user.email) {
                const subject = payload.estado === 'Aceptada' ? '¡Felicidades! Has sido aceptado en una oferta' : 'Actualización sobre tu postulación'
                const html = `
                    <p>Hola ${user.nombres},</p>
                    <p>Tu postulación a la oferta "${postulacionActualizada.servicio.nombreServicio}" ha sido ${payload.estado.toLowerCase()}.</p>
                    ${payload.estado === 'Aceptada' ? '<p>El empleador se pondrá en contacto contigo pronto.</p>' : '<p>Lamentamos informarte que no has sido seleccionado para esta oferta.</p>'}
                    <p>Gracias por usar WorkHub.</p>
                `
                try {
                    await sendMail({ to: user.email, subject, html })
                } catch (mailError) {
                    console.error('Error enviando correo:', mailError)
                }
            }
        }

        res.status(200).json({ success: true, data: postulacionActualizada })
    } catch (error) {
        res.status(500).json({ success:false, message: `No se ha encontrado ninguna postulación ${error.message}`})
    }
}

export const deleteApplyment = async (req, res) => {
    try {
        const postulacionEliminada = await applyments.findByIdAndDelete(req.params.id)
        if (!postulacionEliminada) return res.status(404).json({message: 'Postulación no encontrada'})
        res.status(200).json({ success: true, message: 'Postulación eliminada satisfactoriamente' })
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna postulación ${error.message}`})
    }
}