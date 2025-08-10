import mongoose from 'mongoose'

const { Schema } = mongoose
const offerSchema = new Schema({

    empleador: {
        idUsuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        nombre: {
            type: String,
            required: true
        }
    },
    
    municipio: {
        id: {
            type: Number,
            required: true,
        },
        nombre: {
            type: String,
            required: true,
            enum: ['Barbosa', 'Copacabana', 'Girardota', 'Bello', 'Medellín', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella', 'Caldas']
        }
    },

    nombreServicio: {
        type: String,
        required: true,
        maxLength: [100, 'El nombre no puede sobrepasar los 100 carácteres']
    },

    descripcion: {
        type: String,
        required: true,
        maxLength: [500, 'La descripción no puede sobrepasar los 500 carácteres']
    },

    categoria: {
        type: String,
        required: true,
        enum: ['Jardinería', 'Limpieza', 'Piscinero', 'Carpintería', 'Mantenimiento', 'Plomería']
    },

    precioReferencia: {
        type: Number,
        required: true,
        min: [50000, 'El servicio no puede valer menos de 50.000']
    },

    personasRequeridas: {
        type: Number,
        required: true,
        min: 1
    },

    detalleRequerimiento: {
        type: String,
        required: true,
        maxLength: [500, 'La descripción no puede tener más de 500 carácteres']
    },

    visible: {
        type: Boolean,
        required: true
    },

    fechaCreacion: {
        type: Date,
        required: true,
        default: Date.now
    },

    fechaLimite: {
        type: Date,
        required: true
    }
})

export default mongoose.model('offer', offerSchema)