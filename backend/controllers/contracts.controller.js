import contracts from '../models/contracts.model.js'

export const createContract = async (req, res) => {
    try {
        const {oferta, empleado, empleador, fechaInicio, fechaFin, estado} = req.body
        const nuevoContrato = new contracts({oferta, empleado, empleador, fechaFin, fechaInicio, estado})
        await nuevoContrato.save()

        res.status(201).json({ success: true, message: 'Contrato creado satisfactoriamente', data: nuevoContrato })
    } catch (error) {
        res.status(500).json({message: 'Error al crear contrato', error: error.message})
    }
}

export const searchContract = async (req, res) => {
    try {
        // Paginación
        const page = Number.parseInt(req.query.page) > 0 ? Number.parseInt(req.query.page) : 1
        const limit = Number.parseInt(req.query.limit) > 0 ? Number.parseInt(req.query.limit) : 10
        const skip = (page - 1) * limit

        const total = await contracts.countDocuments()
        const contratosEncontrados = await contracts.find().skip(skip).limit(limit)

        res.status(200).json({
            success: true,
            data: contratosEncontrados,
            total,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                pageSize: limit,
            },
        })
    } catch (error) {
        res.status(500).json({message: `No se han encontrado contratos ${error.message}`})
    }
}

export const searchContractById = async (req, res) => {
    try {
        const contratoEncontrado = await contracts.findById(req.params.id)
        if (!contratoEncontrado) return res.status(404).json({message: 'No se ha encontrado el contrato'})
        res.status(200).json({ success: true, data: contratoEncontrado })
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ningún contrato ${error.message}`})
    }
}

export const updateContract = async (req, res) => {
    try {
        const contratoActualizado = await contracts.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if (!contratoActualizado) return res.status(404).json({message: 'No se ha encontrado el contrato'})
        res.status(200).json({ success: true, data: contratoActualizado })
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ningún contrato ${error.message}`})
    }
}

export const deleteContract = async (req, res) => {
    try {
        const contratoEliminado = await contracts.findByIdAndDelete(req.params.id)
        if (!contratoEliminado) return res.status(404).json({message: 'Contrato no encontrado'})
        res.status(200).json({ success: true, message: 'Contrato eliminado satisfactoriamente' })
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ningún contrato ${error.message}`})
    }
}