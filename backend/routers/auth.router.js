import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import svgCaptcha from 'svg-captcha'
import userModel from '../models/users.model.js'
import { requestPasswordReset, performPasswordReset } from '../controllers/passwordReset.controller.js'

const router = express.Router()

// Store for CAPTCHA texts (in production, use Redis or similar)
const captchaStore = new Map()

// POST /auth/check?field=email&value=...
router.get('/check', async (req, res) => {
    try {
        const { field, value } = req.query
        if (!field || !value) return res.status(400).json({ success: false, message: 'Parámetro requerido' })
        if (!['email', 'telefono'].includes(field)) return res.status(400).json({ success: false, message: 'Campo no permitido' })
        const exists = await userModel.exists({ [field]: value })
        return res.json({ success: true, field, value, available: !exists })
    } catch (e) {
        res.status(500).json({ success: false, message: 'Error verificando disponibilidad', error: e.message })
    }
})

// GET /auth/captcha
router.get('/captcha', (req, res) => {
    const captcha = svgCaptcha.create({ size: 6, ignoreChars: '0o1iIl' })
    const id = crypto.randomUUID()
    captchaStore.set(id, captcha.text)
    res.json({ svg: captcha.data, id })
})

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { nombres, apellidos, email, telefono, password, rol } = req.body
        // Validaciones básicas
        const errors = {}
        if (!nombres || nombres.length < 2) errors.nombres = 'Ingrese nombres válidos'
        if (!apellidos || apellidos.length < 2) errors.apellidos = 'Ingrese apellidos válidos'
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Correo inválido'
        if (!telefono || !/^(?:\+57)?3\d{9}$/.test(telefono)) errors.telefono = 'Teléfono inválido (Formato colombiano celular)'
        if (!password) errors.password = 'Contraseña requerida'
        if (password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) errors.password = 'La contraseña debe tener 8 caracteres, mayúsculas, minúsculas y números'
        if (!rol || !['empleado', 'empleador'].includes(rol)) errors.rol = 'Rol inválido'

        if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Errores de validación', errors })

        const dupEmail = await userModel.exists({ email })
        if (dupEmail) return res.status(400).json({ success: false, errors: { email: 'El correo ya está registrado' } })
        const dupTel = await userModel.exists({ telefono })
        if (dupTel) return res.status(400).json({ success: false, errors: { telefono: 'El teléfono ya está registrado' } })

    const passwordHash = await bcrypt.hash(password, 10)

    // Crear sólo con campos requeridos; el resto tiene defaults opcionales
    const nuevo = await userModel.create({ nombres, apellidos, email, telefono, passwordHash, rol })

    // Generar token JWT para iniciar sesión automáticamente
    const payload = { sub: nuevo._id, rol: nuevo.rol }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' })

    res.status(201).json({ success: true, message: 'Registro exitoso', data: { id: nuevo._id, nombres: nuevo.nombres, rol: nuevo.rol }, token })
    } catch (e) {
        if (e?.code === 11000) {
            const field = Object.keys(e.keyPattern || {})[0] || 'campo'
            return res.status(400).json({ success: false, message: 'Duplicado', errors: { [field]: 'Ya está registrado' } })
        }
        if (e.name === 'ValidationError') {
            const valErrors = Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k, v.message]))
            return res.status(400).json({ success: false, message: 'Errores de validación de modelo', errors: valErrors })
        }
        res.status(500).json({ success: false, message: 'Error en registro', error: e.message })
    }
})

// Admin login
router.post('/login', async (req,res)=>{
    try{
        const { email, password, captchaId, captchaText } = req.body
        if(!email || !password || !captchaId || !captchaText) return res.status(400).json({ success:false, message:'Credenciales y CAPTCHA requeridos' })
        
        // Verify CAPTCHA
        const storedText = captchaStore.get(captchaId)
        if (!storedText || storedText !== captchaText) {
            return res.status(400).json({ success: false, message: 'CAPTCHA inválido' })
        }
        captchaStore.delete(captchaId) // One-time use
        
        const user = await userModel.findOne({ email })
        if(!user) return res.status(401).json({ success:false, message:'Correo no registrado' })
        const ok = await bcrypt.compare(password, user.passwordHash)
        if(!ok) return res.status(401).json({ success:false, message:'Correo o contraseña inválido' })
        const payload = { sub: user._id, rol: user.rol }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' })
        res.json({ success:true, token, rol:user.rol })
    }catch(e){
        res.status(500).json({ success:false, message:'Error al iniciar sesión', error:e.message })
    }
})

// Password reset
router.post('/password/forgot', requestPasswordReset)
router.post('/password/reset', performPasswordReset)

// Seed admin (solo en desarrollo y con flag ENABLE_ADMIN_SEED=true)
router.post('/seed-admin', async (req,res)=>{
    try{
        if(process.env.ENABLE_ADMIN_SEED !== 'false') return res.status(403).json({ success:false, message:'No autorizado' })
            const email = process.env.ADMIN_EMAIL || 'admin@gmail.com'
        const password = process.env.ADMIN_PASSWORD || 'admin12345'
        let admin = await userModel.findOne({ email })
        if(admin) return res.json({ success:true, message:'Admin ya existe' })
            const passwordHash = await bcrypt.hash(password, 10)
        admin = await userModel.create({
            nombres:'Admin', apellidos:'Workhub', email, telefono:'3000000000', passwordHash, rol:'admin', direccion:'NA', seguridadSocial:{ nombre:'NA', estado:'activo' }
        })
        res.status(201).json({ success:true, message:'Admin creado', id:admin._id })
    }catch(e){
        res.status(500).json({ success:false, message:'Error creando admin', error:e.message })
    }
})
export default router