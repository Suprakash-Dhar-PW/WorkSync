import { Badge } from "@/components/ui/badge";

export const TaskStatusBadge = ({ task }) => {
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';

  if (task.status === 'completed') {
    return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
  }

  if (isOverdue) {
    return <Badge variant="destructive">Overdue</Badge>;
  }

  return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
};