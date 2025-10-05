import crypto from 'crypto'
import userModel from '../models/users.model.js'
import PasswordReset from '../models/passwordReset.model.js'
import { sendMail } from '../config/mailer.js'
import bcrypt from 'bcryptjs'
process.loadEnvFile('../.env')

const FRONT_URL = process.env.FRONT_URL || 'http://localhost:6060'

// POST /auth/password/forgot { email }
export async function requestPasswordReset(req, res){
	try{
		const { email } = req.body
		if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
			return res.status(400).json({ success:false, message:'Correo inválido' })
		}
		const user = await userModel.findOne({ email })
		if(!user){
			return res.status(404).json({ success:false, message:'El correo no está asociado a ninguna cuenta' })
		}
		// Invalidar tokens previos activos para este usuario
		await PasswordReset.updateMany({ userId: user._id, used:false }, { $set:{ used:true }})
		const token = crypto.randomBytes(32).toString('hex')
		const expiresAt = new Date(Date.now() + 1000*60*15) // 15 min
		await PasswordReset.create({ userId: user._id, email, token, expiresAt })
		const link = `${FRONT_URL}/restablecer?token=${token}`
		const html = `<p>Hola ${user.nombres},</p>
			<p>Solicitaste restablecer tu contraseña. Haz clic en el siguiente enlace (válido por 15 minutos):</p>
			<p><a href="${link}" target="_blank">Restablecer contraseña</a></p>
			<p>Si no solicitaste este cambio, ignora este mensaje.</p>`
		await sendMail({ to: email, subject:'Restablecer contraseña - WorkHub', html })
		return res.json({ success:true, message:'Correo enviado' })
	}catch(e){
		console.error('Error solicitando reset:', e)
		return res.status(500).json({ success:false, message:'Error procesando solicitud', error:e.message })
	}
}

// POST /auth/password/reset { token, password }
export async function performPasswordReset(req,res){
	try{
		const { token, password } = req.body
		if(!token) return res.status(400).json({ success:false, message:'Token requerido' })
		if(!password) return res.status(400).json({ success:false, message:'Contraseña requerida' })
		if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)){
			return res.status(400).json({ success:false, message:'La contraseña no cumple la política (8 caracteres, mayúscula, minúscula y número)' })
		}
		const reset = await PasswordReset.findOne({ token, used:false })
		if(!reset) return res.status(400).json({ success:false, message:'Token inválido o ya usado' })
		if(reset.expiresAt < new Date()) return res.status(400).json({ success:false, message:'Token expirado' })
		const user = await userModel.findById(reset.userId)
		if(!user) return res.status(404).json({ success:false, message:'Usuario no encontrado' })
		const passwordHash = await bcrypt.hash(password, 10)
		user.passwordHash = passwordHash
		await user.save()
		reset.used = true
		await reset.save()
		return res.json({ success:true, message:'Contraseña actualizada' })
	}catch(e){
		console.error('Error realizando reset:', e)
		return res.status(500).json({ success:false, message:'Error actualizando contraseña', error:e.message })
	}
}

