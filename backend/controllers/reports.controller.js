import reports from '../models/reports.model.js'

export const createReport = async (req, res) => {
    try {
        const {usuario, titulo, tipo, prioridad, estado, descripcion, fechaReporte, soluciones} = req.body
        const nuevoReporte = new reports({usuario, titulo, tipo, prioridad, estado, descripcion, fechaReporte, soluciones})
        await nuevoReporte.save()

        res.status(201).json({message: 'Reporte creado con éxito', data: nuevoReporte})
    } catch (error) {
        res.status(500).json({message: 'No se ha podido crear el reporte', error: error.message})
    }
}

export const searchReports = async (req, res) => {
    try {
        const reportesEncontrados = await reports.find()
        res.status(200).json(reportesEncontrados)
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ningún reporte ${error.message}`})
    }
}

export const searchReportByID = async (req, res) => {
    try {
        const reporteEncontrado = await reports.findById(req.params.id)
        if (!reporteEncontrado) return res.status(404).json({message: 'No se ha encontrado el reporte'})
        res.status(200).json(reporteEncontrado)

    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ningún reporte ${error.message}`})
    }
}

export const updateReport = async (req, res) => {
    try {
        const reporteActualizado = await reports.findByIdAndUpdate(req.params.id, req.body, {new: true})

        if (!reporteActualizado) return res.status(404).json({message: 'Reporte no encontrado'})

        res.status(200).json(reporteActualizado)
    } catch (error) {
        res.status(500).json({message: `Error al actualizar el reporte ${error.message}`})
    }
}

export const deleteReport = async (req, res) => {
    try {
        const reporteBorrado = await reports.findByIdAndDelete(req.params.id)
        if (!reporteBorrado) return res.status(404).json({message: 'No se encontró el reporte'})
        res.status(200).json({message: 'Reporte borrado satisfactoriamente'})
    } catch (error) {
        res.status(500).json({message: `Error al borrar reporte ${error.message}`})
    }
}