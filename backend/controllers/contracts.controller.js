import contracts from '../models/contracts.model.js'

export const createContract = async (req, res) => {
    try {
        const {oferta, empleado, empleador, fechaInicio, fechaFin, estado} = req.body
        const nuevoContrato = new contracts({oferta, empleado, empleador, fechaFin, fechaInicio, estado})
        await nuevoContrato.save()

        res.status(201).json({message: 'Contrato creado satisfactoriamente', data: nuevoContrato})
    } catch (error) {
        res.status(500).json({message: 'Error al crear contrato', error: error.message})
    }
}

export const searchContract = async (req, res) => {
    try {
        const contratosEncontrados = await contracts.find()
        res.status(200).json(contratosEncontrados)
    } catch (error) {
        res.status(500).json({message: `No se han encontrado contratos ${error.message}`})
    }
}

export const searchContractById = async (req, res) => {
    try {
        const contratoEncontrado = await contracts.findById(req.params.id)
        if (!contratoEncontrado) return res.status(404).json({message: 'No se ha encontrado el contrato'})
        res.status(200).json(contratoEncontrado)
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ningún contrato ${error.message}`})
    }
}

export const updateContract = async (req, res) => {
    try {
        const contratoActualizado = await contracts.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if (!contratoActualizado) return res.status(404).json({message: 'No se ha encontrado el contrato'})
        res.status(200).json(contratoActualizado)
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ningún contrato ${error.message}`})
    }
}

export const deleteContract = async (req, res) => {
    try {
        const contratoEliminado = await contracts.findByIdAndDelete(req.params.id)
        if (!contratoEliminado) return res.status(404).json({message: 'Contrato no encontrado'})
        res.status(200).json({message: 'Contrato eliminado satisfactoriamente'})
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ningún contrato ${error.message}`})
    }
}