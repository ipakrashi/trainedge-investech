import studentModel from '../models/studentModel.js'
import userModel from '../models/userModel.js'

// @desc    Get all students (Scoped by Admin, Faculty, or Accounts)
// @route   GET /api/students
// @access  Private (Admin/Faculty/Accounts)
export const getStudents = async (req, res) => {
    try {
        const roleName = (
            req.user.role?.name ||
            req.user.role ||
            ''
        ).toLowerCase()
        const isAdmin = roleName === 'admin'
        const isFaculty = roleName === 'faculty'
        const isAccounts = roleName === 'accounts'

        // Allow Admin, Faculty, and Accounts; reject others
        if (!isAdmin && !isFaculty && !isAccounts) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. Academic or Financial access only.',
            })
        }

        const query = {}

        // Scoped Visibility: Faculty can only see students strictly mapped to them
        if (isFaculty) {
            query.assignedFaculty = req.user._id
            query.status = { $ne: 'PENDING_ASSIGNMENT' } // Faculty don't see unmapped students
        }
        // Admin and Accounts have global visibility over active student payment ledgers

        const students = await studentModel
            .find(query)
            .populate('enrolledCourses', 'courseTitle fee')
            .populate('assignedFaculty', 'firstName lastName')
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: students.length,
            data: students,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching students.',
        })
    }
}

// @desc    Admin Maps Faculty, Courses, and Fees to a Pending Student
// @route   PUT /api/students/:id/map-faculty
// @access  Private/Admin
export const mapStudentFaculty = async (req, res) => {
    try {
        const { assignedFaculty, enrolledCourses, totalFee } = req.body

        // Ensure the assigned user is actually a faculty member (Safely handle populated or unpopulated role)
        const facultyCheck = await userModel
            .findById(assignedFaculty)
            .populate('role')

        if (!facultyCheck) {
            return res.status(400).json({
                success: false,
                message: 'Assigned faculty user not found.',
            })
        }

        // Safely extract the role name string regardless of schema population state
        const facultyRoleName = (
            facultyCheck.role?.name ||
            (typeof facultyCheck.role === 'string' ? facultyCheck.role : '')
        ).toLowerCase()

        if (facultyRoleName !== 'faculty') {
            return res.status(400).json({
                success: false,
                message: 'Selected user is not valid Faculty.',
            })
        }

        const student = await studentModel
            .findByIdAndUpdate(
                req.params.id,
                {
                    assignedFaculty,
                    enrolledCourses,
                    totalFee,
                    status: 'ACTIVE', // Flips them out of the Admin pending dashboard
                },
                { new: true, runValidators: true },
            )
            .populate('assignedFaculty', 'firstName lastName')
            .populate('enrolledCourses', 'courseTitle')

        if (!student) {
            return res
                .status(404)
                .json({ success: false, message: 'Student not found.' })
        }

        res.status(200).json({
            success: true,
            data: student,
            message: 'Student successfully mapped and activated.',
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server mapping error.',
            error: error.message,
        })
    }
}
