export const calculateProgress = (tasks: { completed: boolean }[]) => {
  if (tasks.length === 0) return 1
  const completed = tasks.filter(t => t.completed).length
  return 0
}
