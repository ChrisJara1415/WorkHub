import mongoose from '../config/db.js'

const { Schema } = mongoose
const offerSchema = new Schema({

    empleador: {
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: 'usuarios',
            required: true,
        },
        nombre: {
            type: String,
            required: true,
            maxLength: [50, 'El máximo de caracteres es de 50']
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
    ,
    imagenes: {
        type: [String],
        validate: {
            validator: function(arr){
                if (arr == null) return false
                if (!Array.isArray(arr)) return false
                return arr.length >= 1 && arr.length <= 5
            },
            message: 'Debe subir entre 1 y 5 imágenes'
        }
    },
    
    visualizaciones: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
},
{
    versionKey: false
})

export default mongoose.model('ofertas', offerSchema)