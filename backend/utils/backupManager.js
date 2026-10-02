import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

const backupDatabase = () => {
	return new Promise((resolve, reject) => {
		const DB_URI = process.env.MONGODB_URI

		const date = new Date()
		const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getHours()}-${date.getMinutes()}`

		const backupPath = path.join(
			process.cwd(),
			'backups',
			`backup-${timestamp}`,
		)

		if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
			fs.mkdirSync(path.join(process.cwd(), 'backups'))
		}

		const command = `mongodump --uri="${DB_URI}" --out="${backupPath}"`

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`Backup failed: ${error.message}`)
				reject(error)
			} else {
				resolve(backupPath)
			}
		})
	})
}

export default backupDatabase
