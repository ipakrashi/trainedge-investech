import { useState, useEffect } from 'react'
import api from '../api/axios'
import PipelineBoard from '../components/pipeline/PipelineBoard'

const STAGES = [
    { id: 'NEW', title: 'New', color: 'border-blue-500', bg: 'bg-blue-50' },
    {
        id: 'CONTACTED',
        title: 'Contacted',
        color: 'border-yellow-500',
        bg: 'bg-yellow-50',
    },
    {
        id: 'QUALIFIED',
        title: 'Qualified',
        color: 'border-purple-500',
        bg: 'bg-purple-50',
    },
    {
        id: 'DEMO_SCHEDULED',
        title: 'Demo Scheduled',
        color: 'border-orange-500',
        bg: 'bg-orange-50',
    },
    {
        id: 'DEMO_ATTENDED',
        title: 'Demo Attended',
        color: 'border-teal-500',
        bg: 'bg-teal-50',
    },
    {
        id: 'ENROLLED',
        title: 'Enrolled (Won)',
        color: 'border-green-500',
        bg: 'bg-green-50',
    },
    { id: 'LOST', title: 'Lost', color: 'border-red-500', bg: 'bg-red-50' },
    { id: 'JUNK', title: 'Junk', color: 'border-gray-400', bg: 'bg-gray-200' },
]

const Pipeline = () => {
    const [leads, setLeads] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPipelineLeads = async () => {
            try {
                const response = await api.get('/leads?limit=500')

                // Removed the filter entirely so both LOST and JUNK render on the board
                setLeads(response.data.data || [])
            } catch (err) {
                console.error('Failed to fetch pipeline:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPipelineLeads()
    }, [])

    const handleDragStart = (e, leadId) => {
        e.dataTransfer.setData('leadId', leadId)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault()
        const leadId = e.dataTransfer.getData('leadId')

        setLeads((prevLeads) =>
            prevLeads.map((lead) =>
                lead._id === leadId ? { ...lead, status: targetStatus } : lead,
            ),
        )

        try {
            await api.put(`/leads/${leadId}`, { status: targetStatus })
        } catch (err) {
            console.error('Failed to update lead status:', err)
            alert('Failed to update status. Please refresh the page.')
        }
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
        )
    }

    return (
        <div className='bg-gray-50 min-h-screen py-8 overflow-hidden'>
            <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Sales Pipeline
                    </h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Drag and drop leads to update their status.
                    </p>
                </div>

                <PipelineBoard
                    stages={STAGES}
                    leads={leads}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                />
            </div>
        </div>
    )
}

export default Pipeline
