import { Task } from '@/app/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useDroppable } from '@dnd-kit/core'
import { Label } from '@radix-ui/react-label'
import { ChangeEvent, ReactNode, useState } from 'react'

interface ColumnProps {
  id: string
  children: ReactNode
  items: Array<Task>
  addTaskHandler: (container: string, task: Omit<Task, 'id'>) => void
}

const Column = (props: ColumnProps) => {
  const { children, id, items, addTaskHandler } = props
  const { setNodeRef } = useDroppable({ id })
  const [showAddModal, setShowAddModal] = useState(false)
  const [task, setTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
  })

  const toggleAddModalHandler = () => {
    setTask({ title: '', description: '' })
    setShowAddModal((prevState) => !prevState)
  }

  const onTaskChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setTask((prevState) => ({ ...prevState, [e.target.name]: e.target.value }))
  }

  const onSubmitHandler = () => {
    if (task.title && task.description) {
      addTaskHandler(id, task)
      toggleAddModalHandler()
    }
  }

  return (
    <div ref={setNodeRef}>
      <div className='bg-slate-800 dark:bg-zinc-800 rounded-lg w-60 p-2 px-3'>
        <div className='flex justify-between  border-b-2 border-slate-600 dark:border-zinc-600 pb-1'>
          <span className='text-sm font-semibold text-neutral-100'>{id}</span>
          <span className='text-sm font-semibold text-neutral-100'>
            ({items.length})
          </span>
        </div>
        <div className='flex flex-col gap-2 my-3'>{children}</div>

        <Button
          className='w-full rounded-lg bg-transparent dark:bg-transparent border dark:text-white dark:hover:bg-zinc-900 border-slate-200'
          onClick={toggleAddModalHandler}
        >
          + Task
        </Button>
      </div>

      <Dialog open={showAddModal} onOpenChange={toggleAddModalHandler}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='pb-2'>New Task - {id}</DialogTitle>
            <DialogDescription className='flex flex-col gap-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                name='title'
                value={task.title}
                onChange={(e) => onTaskChangeHandler(e)}
              />
              <Label htmlFor='description'>Description</Label>
              <Input
                id='description'
                name='description'
                value={task.description}
                onChange={(e) => onTaskChangeHandler(e)}
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='secondary'
              onClick={onSubmitHandler}
              className='rounded-md'
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Column
