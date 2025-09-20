import mongoose from '../config/db.js'

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

    fechaInicio: {
        type: Date,
        default: Date.now,
        required: true,
        validate: {
            validator: function (value) {
                const now = new Date()
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                const maxDate = new Date(today)
                maxDate.setMonth(maxDate.getMonth() + 1)
                return value >= today && value <= maxDate
            },
            message: props => `${props.value} debe estar entre hoy y máximo 1 mes en el futuro.`
        }
    },

    fechaFin: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                const now = new Date()
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                const maxDate = new Date(today)
                maxDate.setMonth(maxDate.getMonth() + 1)
                return value >= today && value <= maxDate
            },
            message: props => `${props.value} debe estar entre hoy y máximo 1 mes en el futuro.`
        }
    },

    estado: {
        type: String,
        required: true,
        enum: ['Activo', 'Inactivo']
    }
},
{
    versionKey: false
})

export default mongoose.model('contratos', contractSchema)