import { useState, useEffect } from 'react'
import api from '../api/axios'
import PipelineBoard from '../components/pipeline/PipelineBoard'

const Pipeline = () => {
    const [leads, setLeads] = useState([])
    const [stages, setStages] = useState([]) // Dynamic Stages State
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPipelineData = async () => {
            try {
                // Fetch both Leads and Statuses concurrently
                const [leadsRes, statusesRes] = await Promise.all([
                    api.get('/leads?limit=500'),
                    api.get('/statuses'),
                ])

                setLeads(leadsRes.data.data || [])
                setStages(statusesRes.data.data || [])
            } catch (err) {
                console.error('Failed to fetch pipeline data:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPipelineData()
    }, [])

    const handleDragStart = (e, leadId) => {
        e.dataTransfer.setData('leadId', leadId)
    }
    const handleDragOver = (e) => e.preventDefault()

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
                    stages={stages}
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
