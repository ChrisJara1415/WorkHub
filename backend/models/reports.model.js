import mongoose from '../config/db.js'

const { Schema } = mongoose
const reportSchema = new Schema({
    usuario: {
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'usuarios',
            required: true
        },
        nombre: {
            type: String,
            required: true,
            maxLength: [50, 'El nombre no puede contener más de 50 caracteres'],
            trim: true
        }
    },

    titulo: {
        type: String,
        required: true,
        maxLength: [50, 'El título no puede contener más de 50 caracteres'],
        trim: true
    },

    tipo: {
        type: String,
        required: true,
        enum: ['Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Consulta']
    },

    prioridad: {
        type: String,
        required: true,
        enum: ['Alta', 'Media', 'Baja']
    },

    estado: {
        type: String,
        required: true,
        enum: ['Abierto', 'Cerrado', 'En proceso']
    },

    descripcion: {
        type: String,
        required: true,
        trim: true,
        maxLength: [300, 'La descripción no puede contener más de 300 caracteres']
    },

    fechaReporte: {
        type: Date,
        default: Date.now,
        required: true
    },

    soluciones: [{
        usuario: {
            idUsuario: {
                type: Schema.Types.ObjectId,
                ref: 'usuarios',
                required: true
            },
            nombre: {
                type: String,
                required: true,
                trim: true
            }
        },

        solucion: {
            type: String,
            required: true,
            trim: true,
            maxLength: [300, 'La solución no puede contener más de 300 caracteres']
        },

        fechaRespuesta: {
            type: Date,
            default: Date.now,
            required: true
        }
    }],
},
{
    versionKey: false
})

export default mongoose.model('reportes', reportSchema)