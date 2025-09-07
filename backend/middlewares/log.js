import fs from 'fs'

export const generateLog = (filename, logData) => {
    fs.appendFile(filename, logData, (err) => {
        if (err) throw err
        console.log('log saved')
    })
}