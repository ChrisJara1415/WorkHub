import mongoose from '../config/db.js'

const schema = mongoose.Schema
const userSchema = new schema({
    nombres: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        maxLength: [150, 'Máximo 150 caracteres'],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z\s]+$/.test(value);
            },
            message: props => `${props.value} contiene caracteres especiales!`
        }
    },

    apellidos: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        maxLength: [150, 'Máximo 100 caracteres'],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z\s]+$/.test(value);
            },
            message: props => `${props.value} contiene caracteres especiales!`
        }
    },

    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: [true, 'El correo ya existe'],
        validate: {
            validator: function (email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: props => `${props.value} no es un correo electrónico válido`
        }
    },

    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        unique: [true, 'El teléfono ya está asociado a otra cuenta'],
        match: [/^(?:\+57)?3\d{9}$/, 'El teléfono es inválido']
    },

    passwordHash: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },

    fechaRegistro: {
        type: Date,
        required: [true, 'La fecha es obligatoria'],
        default: Date.now,
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

    rol: {
        type: String,
        required: [true, 'El rol es obligatorio'],
        enum: ['empleado', 'empleador']
    },

    municipio: {
        type: String,
        required: [true, 'Seleccione el municipio'],
        enum: ['barbosa', 'copacabana', 'girardota', 'bello', 'medellín', 'envigado', 'itagüí', 'sabaneta', 'la estrella', 'caldas']
    },

    direccion: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9\s]+$/.test(value);
            },
            message: props => `${props.value} no puede contener caracteres especiales!`
        }
    },

    seguridadSocial: {
        nombre: {
            type: String,
            required: [true, 'EL nombre de la seguridad social es obligatoria']
        },

        estado: {
            type: String,
            enum: ['activo', 'inactivo'],
            default: 'activo'
        }
    }
},
{
    versionKey: false
})

export default mongoose.model('usuarios', userSchema)