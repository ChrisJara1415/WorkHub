import { exec } from "node:child_process";
process.loadEnvFile('../.env')
const MONGO_URI = process.env.MONGO_URI;

export async function backupDatabase() {
    const outputPath = './backup';
    const command = `mongodump --uri "${MONGO_URI}" --out ${outputPath} --gzip`;

    exec(command, (error, stdout, _stderr) => {
        if (error) {
            console.error(`Error en el respaldo: ${error.message}`);
            return;
        }
        console.log(`Respaldo completado con éxito ${stdout}`);
    });
}