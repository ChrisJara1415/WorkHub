import { exec } from "node:child_process";
process.loadEnvFile()
export async function backupDatabase() {
    // const dbName = process.env.NAME_DB;
    const outputPath = './backup';

    const command = `mongodump --uri "${process.env.MONGO_URI}" --out ${outputPath} --gzip`;

    await exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error en el respaldo: ${error.message}`);
            return;
        }
        console.log(`Respaldo completado con éxito ${stdout}`);
    });
}