import { useState, useEffect } from 'react'
import api from '../api/axios'
import LeadsHeader from '../components/leads/LeadsHeader'
import LeadsTable from '../components/leads/LeadsTable'
import LeadModal from '../components/leads/LeadModal'
import LeadActivityPanel from '../components/leads/LeadActivityPanel'

const Leads = () => {
    // Determine if the logged-in user is an admin
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    const isAdmin = userInfo.role === 'admin'

    const [leads, setLeads] = useState([])
    const [usersList, setUsersList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [assigneeFilter, setAssigneeFilter] = useState('All')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingLead, setEditingLead] = useState(null)

    // Add new state for the activity panel
    const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false)
    const [activeLeadForActivity, setActiveLeadForActivity] = useState(null)

    const fetchData = async () => {
        try {
            setIsLoading(true)

            // 1. Fetch Leads
            const leadsRes = await api.get('/leads')
            setLeads(leadsRes.data.data || []) // leads returns { data: [...] }

            // 2. Fetch Users (Only if Admin)
            if (isAdmin) {
                try {
                    // Hitting the specific route defined in userRoutes.js
                    const usersRes = await api.get('/users/getUsers')

                    // Because your controller does `res.json(users)`,
                    // Axios puts that directly into `usersRes.data`
                    setUsersList(usersRes.data || [])
                } catch (userErr) {
                    console.error('Users API Failed:', userErr)
                }
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Failed to load data from server.',
            )
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenModal = (lead = null) => {
        setEditingLead(lead)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setEditingLead(null)
        setIsModalOpen(false)
    }

    const handleSaveLead = async (formData) => {
        try {
            if (editingLead) {
                await api.put(`/leads/${editingLead._id}`, formData)
            } else {
                await api.post('/leads', formData)
            }
            await fetchData()
            handleCloseModal()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save lead')
        }
    }

    const handleDeleteLead = async (leadId) => {
        if (
            window.confirm(
                'Are you sure you want to delete this lead? This cannot be undone.',
            )
        ) {
            try {
                await api.delete(`/leads/${leadId}`)
                setLeads(leads.filter((lead) => lead._id !== leadId))
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete lead')
            }
        }
    }

    const filteredLeads = (leads || []).filter((lead) => {
        const matchesSearch =
            lead?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead?.email &&
                lead.email.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus =
            statusFilter === 'All' || lead?.status === statusFilter

        const matchesAssignee =
            assigneeFilter === 'All' ||
            lead?.assignedTo?._id === assigneeFilter ||
            lead?.assignedTo === assigneeFilter

        return matchesSearch && matchesStatus && matchesAssignee
    })

    if (isLoading)
        return (
            <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
        )

    if (error)
        return (
            <div className='text-center text-red-600 mt-10 p-4 bg-red-50 rounded-lg'>
                {error}
            </div>
        )

    // New Handlers for the Activity Panel
    const handleOpenActivityPanel = (lead) => {
        setActiveLeadForActivity(lead)
        setIsActivityPanelOpen(true)
    }

    const handleCloseActivityPanel = () => {
        setActiveLeadForActivity(null)
        setIsActivityPanelOpen(false)
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <LeadsHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    assigneeFilter={assigneeFilter}
                    setAssigneeFilter={setAssigneeFilter}
                    usersList={usersList}
                    isAdmin={isAdmin}
                    onAddClick={() => handleOpenModal(null)}
                />
                <LeadsTable
                    leads={filteredLeads}
                    onEditClick={handleOpenModal}
                    onDeleteClick={handleDeleteLead}
                    onViewActivityClick={handleOpenActivityPanel}
                />
                <LeadModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSaveLead}
                    initialData={editingLead}
                />
                {/* Render the new Activity Panel */}
                <LeadActivityPanel
                    isOpen={isActivityPanelOpen}
                    onClose={handleCloseActivityPanel}
                    lead={activeLeadForActivity}
                />
            </div>
        </div>
    )
}

export default Leads
