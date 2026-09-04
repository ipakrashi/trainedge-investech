import PipelineCard from './PipelineCard'

const PipelineBoard = ({
    stages,
    leads,
    onDragStart,
    onDragOver,
    onDrop,
    onCardClick,
}) => {
    return (
        <div className='flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-200px)] snap-x custom-scrollbar'>
            {stages.map((stage) => {
                const stageLeads = leads.filter(
                    (lead) => lead.status === stage.name,
                )
                const stageValue = stageLeads.reduce(
                    (sum, lead) => sum + (lead.estimatedValue || 0),
                    0,
                )

                return (
                    <div
                        key={stage._id}
                        className={`flex-shrink-0 w-80 flex flex-col rounded-xl snap-center ${
                            stage.name === 'LOST'
                                ? 'bg-red-50/40 opacity-95'
                                : stage.name === 'JUNK'
                                  ? 'bg-gray-200/50 opacity-75 grayscale-[0.3]'
                                  : 'bg-gray-100/50'
                        }`}
                        onDragOver={
                            stage.name === 'LOST' ? undefined : onDragOver
                        }
                        onDrop={
                            stage.name === 'LOST'
                                ? undefined
                                : (e) => onDrop(e, stage.name)
                        }
                    >
                        <div
                            className={`p-4 border-t-4 ${stage.colorClass || 'border-gray-500'} ${stage.bgClass || 'bg-gray-50'} rounded-t-xl`}
                        >
                            <div className='flex justify-between items-center mb-1'>
                                <h3 className='font-bold text-gray-800 text-sm uppercase tracking-wider'>
                                    {stage.label}
                                </h3>
                                <span className='bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-gray-600 shadow-sm'>
                                    {stageLeads.length}
                                </span>
                            </div>
                            <p className='text-xs text-gray-500 font-medium'>
                                ₹{stageValue.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className='flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar'>
                            {stageLeads.map((lead) => (
                                <PipelineCard
                                    key={lead._id}
                                    lead={lead}
                                    onDragStart={onDragStart}
                                    onClick={onCardClick}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default PipelineBoard
