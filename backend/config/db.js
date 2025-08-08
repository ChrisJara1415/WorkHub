import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const USER_DB = process.env.USER_DB
const PASS_DB = process.env.PASS_DB
const NAME_DB = process.env.NAME_DB

const URI = `mongodb+srv://${USER_DB}:${PASS_DB}@cluster0.guvuz2o.mongodb.net/${NAME_DB}`

mongoose
    .connect(URI)
    .then(() => {
        console.log("✅ Conectado a MongoDB Atlas")
    })
    .catch((error) => {
        console.error("❌ Error conectando a MongoDB:", error)
    })

export default mongoose