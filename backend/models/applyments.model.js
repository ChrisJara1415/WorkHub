import mongoose from '../config/db.js'

const { Schema } = mongoose
const applymentSchema = new Schema({
    servicio: {
        idServicio: {
            type: Schema.Types.ObjectId,
            ref: 'ofertas',
            required: true
        },

        nombreServicio: {
            type: String,
            trim: true,
            required: true,
            maxLength: [50, 'El nombre no acepta más de 50 caracteres']
        }
    },

    empleado: {
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'usuarios',
            required: true,
        },
        nombre: {
            type: String,
            required: true,
            trim: true,
            maxLength: [50, 'El nombre no puede exceder los 50 caracteres']
        }
    },

    fechaPostulacion: {
        type: Date,
        default: Date.now,
        required: true
    },

    estado: {
        type: String,
        required: true,
        enum: ['Aceptada', 'Pendiente', 'Rechazada', 'Cancelada']
    }
}, {
    versionKey: false
})

export default mongoose.model('postulaciones', applymentSchema)