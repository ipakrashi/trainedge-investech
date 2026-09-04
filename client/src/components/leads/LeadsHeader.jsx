import { FiSearch, FiPlus, FiFilter, FiUser, FiUpload } from 'react-icons/fi'

const LeadsHeader = ({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    assigneeFilter,
    setAssigneeFilter,
    usersList,
    isAdmin,
    onAddClick,
    onImportClick,
}) => {
    return (
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6'>
            <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                    Lead Management
                </h1>
                <p className='text-sm text-gray-500 mt-1'>
                    Track, manage, and convert your prospective clients.
                </p>
            </div>

            {/* Changed flex-wrap to lg:flex-nowrap and reduced gap to gap-2 */}
            <div className='flex flex-col sm:flex-row w-full lg:w-auto gap-2 flex-wrap lg:flex-nowrap items-center'>
                {/* Search Bar - Reduced width from w-52 to w-44 */}
                <div className='relative w-full sm:w-auto'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <FiSearch className='text-gray-400' />
                    </div>
                    <input
                        type='text'
                        placeholder='Search leads...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-10 pr-4 py-2 w-full sm:w-44 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm'
                    />
                </div>
                {/* Status Filter */}
                <div className='relative w-full sm:w-auto'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <FiFilter className='text-gray-400' />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className='pl-10 pr-8 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white'
                    >
                        <option value='All'>All Statuses</option>
                        <option value='NEW'>New</option>
                        <option value='CONTACTED'>Contacted</option>
                        <option value='QUALIFIED'>Qualified</option>
                        <option value='DEMO_SCHEDULED'>Demo Scheduled</option>
                        <option value='DEMO_ATTENDED'>Demo Attended</option>
                        <option value='ENROLLED'>Enrolled</option>
                        <option value='LOST'>Lost</option>
                        <option value='JUNK'>Junk</option>
                    </select>
                </div>
                {/* Assignee Filter - ONLY ADMINS */}
                {isAdmin && (
                    <div className='relative w-full sm:w-auto'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <FiUser className='text-gray-400' />
                        </div>
                        <select
                            value={assigneeFilter}
                            onChange={(e) => setAssigneeFilter(e.target.value)}
                            className='pl-10 pr-8 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white'
                        >
                            <option value='All'>All Owners</option>
                            {usersList?.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.email}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {/* Import CSV Button */}

                {console.log(isAdmin)}
                {isAdmin && (
                    <button
                        onClick={onImportClick}
                        className='flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap w-full sm:w-auto'
                    >
                        <FiUpload className='mr-2 text-gray-500' />
                        Import CSV
                    </button>
                )}
                {/* Add Button */}
                <button
                    onClick={onAddClick}
                    className='flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap w-full sm:w-auto'
                >
                    <FiPlus className='mr-2' />
                    Add Lead
                </button>
            </div>
        </div>
    )
}

export default LeadsHeader
