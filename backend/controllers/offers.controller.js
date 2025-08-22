import offers from '../models/offers.model.js'

export const createOffer = async (req, res) => {
    try {
        const {empleador, municipio, nombreServicio, descripcion, categoria, precioReferencia, personasRequeridas, detalleRequerimiento, visible, fechaCreacion, fechaLimite} = req.body
        const nuevaOferta = new offers({empleador, municipio, nombreServicio, descripcion, categoria, precioReferencia, personasRequeridas, detalleRequerimiento, visible, fechaCreacion, fechaLimite})
        await nuevaOferta.save()

        res.status(201).json({message: 'Oferta creada satisfactoriamente', data: nuevaOferta})
    } catch (error) {
        res.status(500).json({message: 'Error al crear oferta'})
    }
}

export const searchOffers = async (req, res) => {
    try {
        const ofertasEncontradas = await offers.find()
        res.status(200).json(ofertasEncontradas)
    } catch (error) {
        res.status(500).json({message: 'No se han encontrado ofertas', error: error.message})
    }
}

export const searchOfferById = async (req, res) => {
    try {
        const ofertaEncontrada = await offers.findById(req.params.id)
        if (!ofertaEncontrada) return res.status(404).json({message: 'No se ha encontrado la oferta'})
        res.status(200).json(ofertaEncontrada)
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna oferta ${error.message}`})
    }
}

export const updateOffer = async (req, res) => {
    try {
        const ofertaActualizada = await offers.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if (!ofertaActualizada) return res.status(404).json({message: 'No se ha encontrado la oferta'})
        res.status(200).json(ofertaActualizada)
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna oferta ${error.message}`})
    }
}

export const deleteOffer = async (req, res) => {
    try {
        const ofertaEliminada = await offers.findByIdAndDelete(req.params.id)
        if (!ofertaEliminada) return res.status(404).json({message: 'Oferta no encontrada'})
        res.status(200).json({message: 'Oferta eliminada satisfactoriamente'})
    } catch (error) {
        res.status(500).json({message: `No se ha encontrado ninguna oferta ${error.message}`})
    }
}