import asyncHandler from 'express-async-handler'
import backupDatabase from '../utils/backupManager.js'

// @desc    Trigger a manual database backup
// @route   POST /api/system/backup
// @access  Private (Admin only)
const triggerManualBackup = asyncHandler(async (req, res) => {
	try {
		const backupPath = await backupDatabase()
		res.status(200).json({
			success: true,
			message: 'Database backup completed successfully',
			path: backupPath,
		})
	} catch (error) {
		res.status(500)
		throw new Error('Backup failed. Check server logs.')
	}
})

export default { triggerManualBackup }
