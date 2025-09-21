import exp from "express";
import morgan from "morgan";
import globalRouter from './routers/globalRoutes.router.js'
import authRouter from './routers/auth.router.js'
import {backupDatabase} from './config/backup.js'
import cron from 'node-cron'
process.loadEnvFile('../.env')

const app = exp()
const PORT_BACK = process.env.PORT_BACK

app.use(exp.json())
app.use(morgan('dev'))
app.use('/workhubApi', globalRouter)
app.use('/auth', authRouter)

cron.schedule('0.5 * * * * *', async () => {
    console.log('Realizando Backup de la Base de datos...');
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