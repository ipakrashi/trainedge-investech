// src/pages/Leads.jsx
import { useState, useEffect } from 'react'
import api from '../api/axios'
import LeadsHeader from '../components/leads/LeadsHeader'
import LeadsTable from '../components/leads/LeadsTable'
import LeadModal from '../components/leads/LeadModal'
import LeadActivityPanel from '../components/leads/LeadActivityPanel'

const Leads = () => {
    const userInfoString = localStorage.getItem('userInfo')
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null

    const roleName = (
        userInfo?.role?.name ||
        userInfo?.role ||
        ''
    ).toLowerCase()
    const isAdmin = roleName === 'admin'

    const [leads, setLeads] = useState([])
    const [usersList, setUsersList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filter States
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [assigneeFilter, setAssigneeFilter] = useState('All')
    const [followUpDateFilter, setFollowUpDateFilter] = useState('') // NEW: Follow-up date state

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingLead, setEditingLead] = useState(null)

    const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false)
    const [activeLeadForActivity, setActiveLeadForActivity] = useState(null)

    const fetchData = async () => {
        try {
            setIsLoading(true)

            // Build the query string dynamically based on filters
            let queryParams = ''
            if (followUpDateFilter) {
                queryParams += `?followUpDate=${followUpDateFilter}`
            }

            const leadsRes = await api.get(`/leads${queryParams}`)
            setLeads(leadsRes.data.data || [])

            if (isAdmin) {
                try {
                    const usersRes = await api.get('/users')
                    const fetchedUsers = usersRes.data?.data || usersRes.data
                    setUsersList(
                        Array.isArray(fetchedUsers) ? fetchedUsers : [],
                    )
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

    // Refetch data from backend specifically when the date filter changes
    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [followUpDateFilter])

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

    // Frontend filtering for text, status, and assignee
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

    const handleOpenActivityPanel = (lead) => {
        setActiveLeadForActivity(lead)
        setIsActivityPanelOpen(true)
    }

    const handleCloseActivityPanel = () => {
        setActiveLeadForActivity(null)
        setIsActivityPanelOpen(false)
        fetchData() // Refresh leads list when panel closes in case follow-up date was updated
    }

    const handleCSVImport = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            setIsLoading(true)
            const { data } = await api.post('/leads/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            alert(data.message || 'Leads imported successfully!')
            fetchData()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to import CSV file.')
        } finally {
            setIsLoading(false)
            e.target.value = null
        }
    }

    if (isLoading && leads.length === 0)
        return (
            <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
        )

    if (error)
        return (
            <div className='text-center text-red-600 mt-10 p-4 bg-red-50 rounded-lg max-w-7xl mx-auto'>
                {error}
            </div>
        )

    return (
        <div className='bg-gray-50 h-full  flex flex-col py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col min-h-0'>
                <input
                    type='file'
                    id='csvFileInput'
                    accept='.csv'
                    style={{ display: 'none' }}
                    onChange={handleCSVImport}
                />

                <div className='shrink-0'>
                    <LeadsHeader
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        assigneeFilter={assigneeFilter}
                        setAssigneeFilter={setAssigneeFilter}
                        followUpDateFilter={followUpDateFilter}
                        setFollowUpDateFilter={setFollowUpDateFilter}
                        usersList={usersList}
                        isAdmin={isAdmin}
                        onAddClick={() => handleOpenModal(null)}
                        onImportClick={() =>
                            document.getElementById('csvFileInput').click()
                        }
                    />
                </div>

                <div className='flex-1 min-h-0 pb-4 relative'>
                    {/* Overlay spinner when fetching new dates but keeping table visible */}
                    {isLoading && leads.length > 0 && (
                        <div className='absolute inset-0 bg-white/50 z-20 flex items-center justify-center'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                        </div>
                    )}
                    <LeadsTable
                        leads={filteredLeads}
                        onEditClick={handleOpenModal}
                        onDeleteClick={handleDeleteLead}
                        onViewActivityClick={handleOpenActivityPanel}
                        isAdmin={isAdmin}
                    />
                </div>

                <LeadModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSaveLead}
                    initialData={editingLead}
                    currentUser={userInfo}
                />
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
