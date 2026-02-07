import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { TaskStatusBadge } from "../components/TaskStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskApi } from "../services/api";

export const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data } = await taskApi.getMyTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI Update: Update state immediately before API call
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: newStatus, completedAt: newStatus === 'Completed' ? new Date().toISOString() : null } 
        : t
    ));

    try {
      await taskApi.updateStatus(taskId, newStatus);
    } catch (error) {
      console.error("Update failed");
      fetchTasks(); // Revert on failure by fetching real data
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Tasks</h1>
        
        <div className="rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Task Details</TableHead>
                <TableHead>Group / Admin</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={5} className="text-center h-24">Loading tasks...</TableCell></TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{task.groupName}</div>
                      <div className="text-xs text-muted-foreground">by {task.assignedBy}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="text-muted-foreground">Due: <span className={new Date(task.deadline) < new Date() ? "text-red-500 font-bold" : ""}>
                        {new Date(task.deadline).toLocaleDateString()}
                      </span></div>
                      {task.completedAt && (
                        <div className="text-green-600 text-xs">Done: {new Date(task.completedAt).toLocaleDateString()}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <TaskStatusBadge task={task} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Select 
                        value={task.status} 
                        onValueChange={(val) => handleStatusChange(task.id, val)}
                      >
                        <SelectTrigger className="w-[130px] ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};