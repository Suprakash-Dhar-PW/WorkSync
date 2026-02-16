import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth'

export function useEmployees() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchEmployees()
  }, [user])

  const fetchEmployees = async () => {
    try {
      // Fetch employees assigned to this manager
      const { data, error } = await supabase
        .from('manager_employees')
        .select(`
          accepted_at,
          invited_at,
          employee:employee_id (
            id,
            email,
            full_name,
            role,
            created_at
          )
        `)
        .eq('manager_id', user.id)

      if (error) throw error

      // Flatten the response and merge status
      const flattened = data.map((item) => ({
        ...item.employee,
        accepted_at: item.accepted_at,
        invited_at: item.invited_at
      }))
      setEmployees(flattened)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeEmployee = async (employeeId) => {
    const { error } = await supabase
      .from('manager_employees')
      .delete()
      .eq('manager_id', user.id)
      .eq('employee_id', employeeId)

    if (error) throw error
    await fetchEmployees()
  }

  return { employees, loading, fetchEmployees, removeEmployee }
}
