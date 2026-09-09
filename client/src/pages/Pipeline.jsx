// src/pages/Pipeline.jsx
import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import PipelineBoard from '../components/pipeline/PipelineBoard'
import LeadActivityPanel from '../components/leads/LeadActivityPanel'

const Pipeline = () => {
    const [leads, setLeads] = useState([])
    const [stages, setStages] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const [activeLeadForActivity, setActiveLeadForActivity] = useState(null)
    const [pendingMove, setPendingMove] = useState(null)

    const fetchPipelineData = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true)
            const [leadsRes, statusesRes] = await Promise.all([
                api.get('/leads?limit=500'),
                api.get('/statuses'),
            ])

            setLeads(leadsRes.data.data || [])
            setStages(statusesRes.data.data || [])
        } catch (err) {
            console.error('Failed to fetch pipeline data:', err)
        } finally {
            if (!silent) setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPipelineData()
    }, [fetchPipelineData])

    const handleDragStart = (e, leadId) => {
        e.dataTransfer.setData('leadId', leadId)
    }
    const handleDragOver = (e) => e.preventDefault()

    const handleDrop = (e, targetStatus) => {
        e.preventDefault()
        const leadId = e.dataTransfer.getData('leadId')
        const draggedLead = leads.find((l) => l._id === leadId)

        if (!draggedLead || draggedLead.status === targetStatus) return

        // 1. Optimistically update the UI immediately
        setLeads((prevLeads) =>
            prevLeads.map((lead) =>
                lead._id === leadId ? { ...lead, status: targetStatus } : lead,
            ),
        )

        // 2. Queue the pending move and force the activity panel to open
        setPendingMove({
            leadId,
            oldStatus: draggedLead.status,
            newStatus: targetStatus,
        })
        setActiveLeadForActivity(draggedLead)
    }

    const handlePanelClose = () => {
        // If there was a pending move, the user cancelled without logging activity. Revert the UI.
        if (pendingMove) {
            setLeads((prevLeads) =>
                prevLeads.map((lead) =>
                    lead._id === pendingMove.leadId
                        ? { ...lead, status: pendingMove.oldStatus }
                        : lead,
                ),
            )
            setPendingMove(null)
        }
        setActiveLeadForActivity(null)
    }

    const handleActivitySuccess = async () => {
        // The LeadActivityPanel has already successfully updated the DB with the new status.
        // Clear the pending move locks, close the modal, and silently refresh the pipeline to ensure perfect DB sync.
        setPendingMove(null)
        setActiveLeadForActivity(null)
        await fetchPipelineData(true) // Silent fetch
    }

    // Allows users to just click a card to view activities without moving it
    const handleCardClick = (lead) => {
        setPendingMove(null)
        setActiveLeadForActivity(lead)
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
                    onCardClick={handleCardClick}
                />

                <LeadActivityPanel
                    isOpen={!!activeLeadForActivity}
                    onClose={handlePanelClose}
                    lead={activeLeadForActivity}
                    onActivitySuccess={handleActivitySuccess}
                    isPendingMove={!!pendingMove}
                    targetStatus={pendingMove?.newStatus} // NEW: Pass down the target stage for Kanban overrides
                />
            </div>
        </div>
    )
}

export default Pipeline
