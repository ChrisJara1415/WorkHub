import mongoose from '../config/db.js'

const { Schema } = mongoose

const passwordResetSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
	email: { type: String, required: true, index: true },
	token: { type: String, required: true, unique: true },
	expiresAt: { type: Date, required: true },
	used: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false })

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) 

export default mongoose.model('password_resets', passwordResetSchema)

