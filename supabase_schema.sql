-- 1. CLEANUP
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS manager_employee;
DROP TABLE IF EXISTS profiles;

-- 2. PROFILES (Extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('manager', 'employee')) NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MANAGER_EMPLOYEE RELATIONSHIP
CREATE TABLE manager_employee (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(manager_id, employee_id)
);

-- 4. TASKS
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  manager_id UUID REFERENCES profiles(id) NOT NULL,
  employee_id UUID REFERENCES profiles(id),
  CONSTRAINT tasks_manager_check CHECK (manager_id != employee_id) -- Optional sanity check
);

-- 5. ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- MANAGERS can view profiles of their employees
CREATE POLICY "Managers can view employee profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM manager_employee 
      WHERE manager_id = auth.uid() 
      AND employee_id = profiles.id
    )
  );

-- USERS can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
  
-- Allow insert on signup (usually handled by trigger, but just in case)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- MANAGER_EMPLOYEE
-- Manager sees relationship
CREATE POLICY "Managers can view relationships" ON manager_employee
  FOR SELECT USING (manager_id = auth.uid());

-- Employee sees relationship
CREATE POLICY "Employees can view relationships" ON manager_employee
  FOR SELECT USING (employee_id = auth.uid());

-- Only managers can create relationships
CREATE POLICY "Managers can create relationships" ON manager_employee
  FOR INSERT WITH CHECK (manager_id = auth.uid());
  
-- Managers can delete relationships
CREATE POLICY "Managers can delete relationships" ON manager_employee
  FOR DELETE USING (manager_id = auth.uid());


-- TASKS
-- Manager sees their managed tasks
CREATE POLICY "Managers can view tasks" ON tasks
  FOR SELECT USING (manager_id = auth.uid());

-- Employee sees assigned tasks
CREATE POLICY "Employees can view tasks" ON tasks
  FOR SELECT USING (employee_id = auth.uid());

-- Managers can insert tasks
CREATE POLICY "Managers can create tasks" ON tasks
  FOR INSERT WITH CHECK (manager_id = auth.uid());
  
-- Managers can update tasks
CREATE POLICY "Managers can update tasks" ON tasks
  FOR UPDATE USING (manager_id = auth.uid());

-- Employees can update status of their tasks (assuming they can update the row but logically only status)
CREATE POLICY "Employees can update tasks" ON tasks
  FOR UPDATE USING (employee_id = auth.uid());

-- Managers can delete tasks
CREATE POLICY "Managers can delete tasks" ON tasks
  FOR DELETE USING (manager_id = auth.uid());
