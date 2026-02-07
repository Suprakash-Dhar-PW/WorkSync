import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskApi } from "../services/api";

export const CreateTaskDialog = ({ onTaskCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState("");
  const [deadline, setDeadline] = useState("");
  const [employees, setEmployees] = useState([]);

  // Fetch employees on open
  useEffect(() => {
    if (open) {
      taskApi.getEmployees().then(({ data }) => setEmployees(data)).catch(console.error);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await taskApi.createTask({
        title,
        description: desc,
        assigned_to: assignee,
        deadline: deadline ? new Date(deadline).toISOString().slice(0, 19).replace('T', ' ') : null,
      });
      setOpen(false);
      onTaskCreated(); // Trigger refresh in parent
      
      // Reset form
      setTitle(""); setDesc(""); setAssignee(""); setDeadline("");
    } catch (err) {
      console.error("Failed to create task", err);
      if (err.response && err.response.data) {
          alert(`Error: ${err.response.data.message}\nDetails: ${err.response.data.error || err.response.data.sqlMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Create New Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assign Employee</Label>
            <Select onValueChange={setAssignee} value={assignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                    <SelectItem key={emp.id} value={String(emp.id)}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input 
              id="deadline" 
              type="datetime-local" 
              required 
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Assign Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};