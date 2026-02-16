import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth'

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return

    fetchTasks()

    // Realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => fetchTasks()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to(full_name, email),
          manager:assigned_by(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTasks(data || [])
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData) => {
    // Map frontend fields towards DB columns
    const dbPayload = {
      title: taskData.title,
      description: taskData.description,
      deadline: taskData.deadline,
      assigned_to: taskData.employee_id || taskData.assigned_to,
      assigned_by: user.id, // Current user is manager
      status: 'pending' // Default status
    };

    const { error } = await supabase.from('tasks').insert([dbPayload])
    if (error) throw error
  }

  const updateTaskStatus = async (taskId, status) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
      .eq('id', taskId)
    if (error) throw error
  }

  const deleteTask = async (taskId) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) throw error
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTaskStatus,
    deleteTask,
    fetchTasks // Expose if needed for manual refresh
  }
}
