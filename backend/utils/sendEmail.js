// server/utils/sendEmail.js
import nodemailer from 'nodemailer'

const sendEmail = async (options) => {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		auth: {
			user: process.env.SMTP_EMAIL,
			pass: process.env.SMTP_PASSWORD,
		},
	})

	const message = {
		from: `${process.env.FROM_NAME || 'TrainEdge System'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
		to: options.to,
		subject: options.subject,
		html: options.html,
	}

	await transporter.sendMail(message)
}

export default sendEmail
