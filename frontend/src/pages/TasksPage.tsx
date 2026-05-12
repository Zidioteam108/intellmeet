import { useState } from 'react'
import { CheckSquare, Clock, Filter, Sparkles, AlertCircle, CheckCircle2, ChevronDown, Plus, PlayCircle } from 'lucide-react'

const TasksPage = () => {
  const [filter, setFilter] = useState('All Tasks')

  const tasks = [
    {
      id: 1,
      title: 'Finalize Q3 Marketing Strategy',
      meeting: 'Strategy & Growth Planning',
      dueDate: 'Today, 5:00 PM',
      priority: 'High',
      status: 'Pending',
      isAiGenerated: true,
      assignees: [1, 2, 3]
    },
    {
      id: 2,
      title: 'Review New Design Mockups',
      meeting: 'Design Sync',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'Medium',
      status: 'Pending',
      isAiGenerated: true,
      assignees: [2, 4]
    },
    {
      id: 3,
      title: 'Update Backend API Documentation',
      meeting: 'Engineering Standup',
      dueDate: 'May 15, 2026',
      priority: 'High',
      status: 'Completed',
      isAiGenerated: false,
      assignees: [1]
    },
    {
      id: 4,
      title: 'Send Follow-up Email to Investors',
      meeting: 'Seed Round Discussion',
      dueDate: 'May 16, 2026',
      priority: 'Urgent',
      status: 'Pending',
      isAiGenerated: true,
      assignees: [1, 5]
    }
  ]

  const filteredTasks = tasks.filter(t => filter === 'All Tasks' ? true : t.status === filter)

  return (
    <div className="w-full lg:max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            AI Extracted Tasks
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Tasks</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Manage actionable items extracted from your intelligent meetings.</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-standard shadow-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter:</span> {filter}
            <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
          </button>
          <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-standard active:scale-95 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pending Tasks', value: '3', color: 'indigo', icon: Clock },
          { label: 'Completed This Week', value: '12', color: 'green', icon: CheckCircle2 },
          { label: 'Urgent Actions', value: '1', color: 'red', icon: AlertCircle }
        ].map((metric, idx) => (
          <div key={idx} className="glass-card p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-300">
            <div>
              <p className={`text-[10px] font-black text-${metric.color}-600 uppercase tracking-widest mb-1`}>{metric.label}</p>
              <p className="text-3xl font-black text-slate-900">{metric.value}</p>
            </div>
            <div className={`p-4 bg-${metric.color}-50 text-${metric.color}-600 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
              <metric.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Task Board */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
        
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 p-6 border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="col-span-5">Task Details</div>
          <div className="col-span-3">Meeting Source</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        <div className="flex flex-col gap-4 lg:gap-0 lg:divide-y divide-slate-100/80 p-4 lg:p-0">
          {filteredTasks.map((task) => (
            <div key={task.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 p-5 lg:p-6 items-start lg:items-center bg-slate-50 lg:bg-transparent rounded-[2rem] lg:rounded-none border border-slate-100 lg:border-none hover:bg-slate-50/80 transition-colors group">
              
              {/* Task Details */}
              <div className="lg:col-span-5 flex items-start gap-4">
                <button className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  task.status === 'Completed' 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'border-slate-300 text-transparent hover:border-indigo-400 bg-white'
                }`}>
                  <CheckSquare className="w-4 h-4" />
                </button>
                <div>
                  <h3 className={`text-base font-extrabold mb-1.5 ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {task.isAiGenerated && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100/50 text-purple-600 text-[9px] font-black uppercase tracking-widest border border-purple-200/50">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Extracted
                      </span>
                    )}
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                      task.priority === 'Urgent' ? 'bg-red-50 border-red-100 text-red-600' :
                      task.priority === 'High' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                      'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Separator */}
              <div className="hidden lg:hidden h-px bg-slate-200/60 w-full my-1"></div>

              {/* Meeting Source */}
              <div className="lg:col-span-3 flex items-center gap-3 lg:gap-2 text-sm font-bold text-slate-600 bg-white lg:bg-transparent p-3 lg:p-0 rounded-xl lg:rounded-none shadow-sm lg:shadow-none border border-slate-100 lg:border-none">
                <div className="p-1.5 bg-indigo-50 rounded-lg lg:p-0 lg:bg-transparent">
                  <PlayCircle className="w-4 h-4 text-indigo-500 lg:text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <span className="truncate group-hover:text-indigo-600 transition-colors cursor-pointer">{task.meeting}</span>
              </div>

              {/* Due Date */}
              <div className="lg:col-span-2 flex items-center gap-3 lg:gap-2 text-sm font-bold text-slate-600 bg-white lg:bg-transparent p-3 lg:p-0 rounded-xl lg:rounded-none shadow-sm lg:shadow-none border border-slate-100 lg:border-none">
                <div className="p-1.5 bg-slate-100 rounded-lg lg:p-0 lg:bg-transparent">
                  <Clock className="w-4 h-4 text-slate-500 lg:text-slate-400" />
                </div>
                {task.dueDate}
              </div>

              {/* Assignees & Status */}
              <div className="lg:col-span-2 flex items-center justify-between gap-4 mt-2 lg:mt-0">
                <div className="flex -space-x-2">
                  {task.assignees.map(a => (
                    <img key={a} src={`https://i.pravatar.cc/150?u=${a + 40}`} alt="assignee" className="w-8 h-8 rounded-xl border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer relative z-10 hover:z-20" />
                  ))}
                </div>
                
                <button className="lg:opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-200 lg:hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-sm lg:shadow-none">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TasksPage
