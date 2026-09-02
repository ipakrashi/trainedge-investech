import courseModel from '../models/courseModel.js'

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category, fee, durationWeeks, isActive } = req.body

        const newCourse = await courseModel.create({
            courseTitle,
            category,
            fee,
            durationWeeks,
            isActive,
        })

        res.status(201).json({
            success: true,
            data: newCourse,
        })
    } catch (error) {
        // Handle duplicate courseTitle (MongoDB duplicate key error code 11000)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A course with this title already exists.',
            })
        }

        // Handle Mongoose validation errors (enums, required fields, min value)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(
                (val) => val.message,
            )
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            })
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating course.',
            error: error.message,
        })
    }
}

// @desc    Get all courses (with optional filters for category and status)
// @route   GET /api/courses
// @access  Private / Public
export const getAllCourses = async (req, res) => {
    try {
        const { category, isActive } = req.query
        const filter = {}

        if (category) filter.category = category
        if (isActive !== undefined) filter.isActive = isActive === 'true'

        const courses = await courseModel.find(filter).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching courses.',
            error: error.message,
        })
    }
}

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private / Public
export const getCourseById = async (req, res) => {
    try {
        const course = await courseModel.findById(req.params.id)

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found.',
            })
        }

        res.status(200).json({
            success: true,
            data: course,
        })
    } catch (error) {
        // Handle invalid MongoDB ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format.',
            })
        }

        res.status(500).json({
            success: false,
            message: 'Server error while fetching course.',
            error: error.message,
        })
    }
}

// @desc    Update course details
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
    try {
        const course = await courseModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, // Return updated document
                runValidators: true, // Enforce schema rules during update
            },
        )

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found.',
            })
        }

        res.status(200).json({
            success: true,
            data: course,
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A course with this title already exists.',
            })
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(
                (val) => val.message,
            )
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            })
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format.',
            })
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating course.',
            error: error.message,
        })
    }
}

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
    try {
        const course = await courseModel.findByIdAndDelete(req.params.id)

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found.',
            })
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully.',
        })
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format.',
            })
        }

        res.status(500).json({
            success: false,
            message: 'Server error while deleting course.',
            error: error.message,
        })
    }
}
