import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getTasks, createTask, updateTaskStatus } from '../api/taskApi';

const COLUMNS = ['todo', 'in-progress', 'review', 'done'];

const COLUMN_LABELS: Record<string, string> = {
  'todo': '📋 To Do',
  'in-progress': '⚡ In Progress',
  'review': '🔍 Review',
  'done': '✅ Done',
};

const COLUMN_COLORS: Record<string, string> = {
  'todo': 'bg-gray-50',
  'in-progress': 'bg-blue-50',
  'review': 'bg-yellow-50',
  'done': 'bg-green-50',
};

const KanbanPage = () => {
  const [tasks, setTasks] = useState<Record<string, any[]>>({
    'todo': [], 'in-progress': [], 'review': [], 'done': [],
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      const grouped: Record<string, any[]> = {
        'todo': [], 'in-progress': [], 'review': [], 'done': [],
      };
      data.tasks.forEach((task: any) => {
        if (grouped[task.status]) grouped[task.status].push(task);
      });
      setTasks(grouped);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  // Called when user drops a card into a new column
  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, source, destination } = result;

    // Dropped outside any column
    if (!destination) return;

    // Dropped in same column same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    // Update UI immediately (optimistic update)
    const sourceTasks = Array.from(tasks[sourceCol]);
    const destTasks = Array.from(tasks[destCol]);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceCol === destCol) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setTasks({ ...tasks, [sourceCol]: sourceTasks });
    } else {
      destTasks.splice(destination.index, 0, movedTask);
      setTasks({ ...tasks, [sourceCol]: sourceTasks, [destCol]: destTasks });
    }

    // Save to backend
    try {
      await updateTaskStatus(draggableId, destCol);
    } catch {
      // Revert on error
      loadTasks();
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    setIsCreating(true);
    try {
      const data = await createTask({ title: newTaskTitle, status: 'todo' });
      setTasks((prev) => ({
        ...prev,
        'todo': [data.task, ...prev['todo']],
      }));
      setNewTaskTitle('');
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Task Board</h1>
        <div className="flex gap-2">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            placeholder="New task title..."
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleCreateTask}
            disabled={isCreating}
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            + Add Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map((colId) => (
            <div key={colId} className={`${COLUMN_COLORS[colId]} rounded-xl p-3 min-h-[400px]`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm text-slate-700">{COLUMN_LABELS[colId]}</h2>
                <span className="text-xs font-bold text-slate-500 bg-white shadow-sm px-2 py-0.5 rounded-full">
                  {tasks[colId].length}
                </span>
              </div>

              <Droppable droppableId={colId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 min-h-[200px]"
                  >
                    {tasks[colId].map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm cursor-grab hover:shadow-md transition-shadow"
                          >
                            <p className="text-sm font-medium text-slate-800">{task.title}</p>
                            {task.assignee && (
                              <p className="text-xs font-medium text-indigo-500 mt-2">
                                👤 {task.assignee.name}
                              </p>
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mt-3 inline-block ${
                              task.priority === 'high' ? 'bg-red-50 text-red-600' :
                              task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                              'bg-emerald-50 text-emerald-600'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanPage;
