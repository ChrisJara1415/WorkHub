import user from '../models/users.model.js'

export const createUser = async (req, res) => {
    try {
        const { nombre, segundoNombre, apellido, segundoApellido, email, telefono, passwordHash } = req.body
        const nuevoUsuario = new user({ nombre, segundoNombre, apellido, segundoApellido, email, telefono, passwordHash })
        await nuevoUsuario.save()

        res.status(201).json({ message: 'Usuario creado correctamente', data: nuevoUsuario })

    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error })
    }
}

export const getUsers = async (req, res) => {
    try {
        const usuarios = await user.find()
        res.status(200).json(usuarios)
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios', error })
    }
}

export const getUserById = async (req, res) => {
    try {
        const usuario = await user.findById(req.params.id)

        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' })

        res.status(200).json(usuario)

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error })
    }
}

export const updateUser = async (req, res) => {
    try {
        const usuarioActualizado = await user.findByIdAndUpdate(req.params.id, req.body, { new: true })

        if (!usuarioActualizado) return res.status(400).json({ message: 'Usuario no encontrado' })

        res.status(200).json(usuarioActualizado)

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario', error })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const usuarioEliminado = await user.findByIdAndDelete(req.params.id);

        if (!usuarioEliminado) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.status(200).json({ message: 'Usuario eliminado correctamente' });

    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error });
    }
}