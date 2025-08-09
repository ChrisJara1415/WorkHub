import mongoose from 'mongoose'

const schema = mongoose.Schema
const userSchema = new schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'],
        maxLength: [50, 'Máximo 50 caracteres']
    },

    segundoNombre: {
        type: String,
        required: false
    },

    apellido: {
        type: String,
        required: [true, 'El apellido es necesario'],
        maxLength: [100, 'Máximo 100 caracteres']
    },

    segundoApellido: {
        type: String,
        required: false
    },

    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: props => `${props.value} no es un correo electrónico válido`
        }
    },

    telefono: {
        type: String,
        required: true,
        unique: true,
        match: [/^(?:\+57)?3\d{9}$/, 'El teléfono es inválido']
    },

    passwordHash: {
        type: String,
        required: true
    },

    fechaRegistro: {
        type: Date,
        default: Date.now
    },

    perfil: {
        rol: {
            type: String,
            required: true,
            enum: ['Administrador', 'Empleado', 'Empleador']
        },

        municipio: {
            type: String,
            required: true,
            enum: ['Barbosa', 'Copacabana', 'Girardota', 'Bello', 'Medellín', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella', 'Caldas']
        },

        direccion: {
            type: String,
            required: true
        },

        seguridadSocial: {
            nombre: {
                type: String,
                required: true
            },

            estado: {
                type: String,
                enum: ['Activo', 'Inactivo'],
                default: 'Activo'
            }
        },

        cuentaBancaria: {
            token: {
                type: String,
                required: true
            },
            banco: {
                type: String,
                required: true,
                enum: ['Bancolombia', 'Nequi', 'Davivienda', 'Daviplata']
            },
            tipo: {
                type: String,
                required: true,
                enum: ['Ahorros', 'Corriente']
            },
            activa: {
                type: Boolean,
                default: true
            },
            fechaRegistro: {
                type: Date,
                default: Date.now
            }
        }
    }
})

export default mongoose.Model('User', userSchema)