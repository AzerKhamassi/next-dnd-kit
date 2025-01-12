import { Task } from '@/app/types'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ComponentPropsWithRef } from 'react'

const TaskCard = (props: Task & ComponentPropsWithRef<'div'>) => {
  const { id, title, description, className = '', ...rest } = props
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white dark:bg-zinc-700 rounded-lg p-2 min-h-14 flex items-center cursor-grab',
        className
      )}
      {...attributes}
      {...listeners}
      {...rest}
    >
      {isDragging ? (
        <div className='border border-gray-300 w-full'></div>
      ) : (
        <div className='flex flex-col text-black dark:text-white'>
          <span className='text-sm mb-2'>{title}</span>
          <span className='text-xs'>{description}</span>
        </div>
      )}
    </div>
  )
}

export default TaskCard
