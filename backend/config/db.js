import mongoose from 'mongoose'
process.loadEnvFile('../.env')

const USER_DB = process.env.USER_DB
const PASS_DB = process.env.PASS_DB
const NAME_DB = process.env.NAME_DB

const URI = `mongodb+srv://${USER_DB}:${PASS_DB}@cluster0.muiaekd.mongodb.net/${NAME_DB}`

mongoose
    .connect(URI)
    .then(() => {
        console.log("✅ Conectado a MongoDB Atlas")
    })
    .catch((error) => {
        console.error("❌ Error conectando a MongoDB:", error.message)
    })

export default mongoose