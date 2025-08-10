import mongoose from 'mongoose'

const { Schema } = mongoose
const contractSchema = new Schema({
    oferta: {
        idOferta: {
            type: Schema.Types.ObjectId,
            ref: 'ofertas',
            required: true
        },
        nombreOferta: {
            type: String,
            required: true,
            maxLength: [50, 'El nombre solo acepta 50 caracteres']
        }
    },

    empleado: {
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'usuarios',
            required: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true,
            maxLength: [50, 'El nombre solo acepta 50 caracteres']
        }
    },

    empleador: {
        idUsuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'usuarios',
            required: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true,
            maxLength: [50, 'El nombre solo acepta 50 caracteres']
        }
    },

    fechaInicio: {
        type: Date,
        default: Date.now,
        required: true
    },

    fechaFin: {
        type: Date,
        required: true
    },

    estado: {
        type: String,
        required: true,
        enum: ['Activo', 'Inactivo']
    }
})

export default mongoose.model('contratos', contractSchema)