import applyments from '../models/applyments.model.js'

export const createApplyment = async (req, res) => {
    try {
        const {servicio, empleado, fechaPostulacion, estado} = req.body
        const nuevaPostulacion = new applyments({servicio, empleado, fechaPostulacion, estado})
        await nuevaPostulacion.save()

        res.status(201).json({message: 'Postulación creada satisfactoriamente', data: nuevaPostulacion})
    } catch (error) {
        res.status(500).json({message: 'Error al crear postulación', error: error.message})
    }
}

export const searchApplyments = async (req, res) => {
    try {
        const postulacionesEncontradas = await applyments.find()
        res.status(200).json(postulacionesEncontradas)
    } catch (error) {
        res.status(500).json({message: `No se han encontrado postulaciones ${error.message}`})
    }
}

export const searchApplymentById = async (req, res) => {
    try {
        const postulacionEncontrada = await applyments.findById(req.params.id)
        if (!postulacionEncontrada) return res.status(404).json({message: 'No se ha encontrado la postulación'})
        res.status(200).json(postulacionEncontrada)
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna postulación ${error.message}`})
    }
}

export const updateApplyment = async (req, res) => {
    try {
        const postulacionActualizada = await applyments.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if (!postulacionActualizada) return res.status(404).json({message: 'No se ha encontrado la postulación'})
        res.status(200).json(postulacionActualizada)
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna postulación ${error.message}`})
    }
}

export const deleteApplyment = async (req, res) => {
    try {
        const postulacionEliminada = await applyments.findByIdAndDelete(req.params.id)
        if (!postulacionEliminada) return res.status(404).json({message: 'Postulación no encontrada'})
        res.status(200).json({message: 'Postulación eliminada satisfactoriamente'})
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna postulación ${error.message}`})
    }
}