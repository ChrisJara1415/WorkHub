import exp from "express";
import morgan from "morgan";
import globalRouter from './routers/globalRoutes.router.js'
import cors from 'cors'
import {backupDatabase} from './config/backup.js'
import cron from 'node-cron'
process.loadEnvFile('../.env')

const app = exp()
const PORT_BACK = process.env.PORT_BACK

app.use(exp.json())
app.use(morgan('dev'))
app.use('/workhubApi', globalRouter)

// Configuración de CORS para permitir requests del frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  }),
)

cron.schedule('* 1 * * * *', async () => {
    console.log('Realizando Backup de la Base de datos');
    backupDatabase();
});

app.listen(PORT_BACK, () => {
    try {
        console.log(`Servidor escuchando en el puerto ${PORT_BACK}`)
        console.log(`Servidor disponible en http://localhost:${PORT_BACK}`)
    } catch (error) {
        console.error({message: 'Error al inicializar servidor', error: error.message})
    }
})