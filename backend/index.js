import exp from "express";
import morgan from "morgan";
import globalRouter from './routers/globalRoutes.router.js'
import authRouter from './routers/auth.router.js'
import jwt from 'jsonwebtoken'
import {backupDatabase} from './config/backup.js'
import cron from 'node-cron'
process.loadEnvFile('../.env')

const app = exp()
const PORT_BACK = process.env.PORT_BACK

app.use(exp.json({ limit: '8mb' }))
app.use(morgan('dev'))

// Inyectar req.user si hay token JWT (para inferir empleador en creación de ofertas)
app.use((req,res,next)=>{
    try{
        const token = req.headers.authorization?.replace(/^Bearer\s+/i,'') || req.cookies?.auth
        if (token){
            req.user = jwt.verify(token, process.env.JWT_SECRET)
        }
    }catch{}
    next()
})
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