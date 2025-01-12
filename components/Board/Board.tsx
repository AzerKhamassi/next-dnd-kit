'use client'

import { Task } from '@/app/types'
import {
  CollisionDetection,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useId, useState } from 'react'
import { Column } from './Column'
import { TaskCard } from './TaskCard'

interface ContainerItems {
  [key: string]: Task[]
}

const Board = () => {
  const [items, setItems] = useState<ContainerItems>({
    'To Do': [
      {
        id: crypto.randomUUID(),
        title: 'Learn NextJS',
        description: 'Watch youtube courses',
      },
      {
        id: crypto.randomUUID(),
        title: 'Learn Python',
        description: 'Watch datacamp courses',
      },
    ],
    'In Progress': [],
    Done: [],
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  const id = useId()

  const customCollisionDetectionAlgorithm: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }
    return rectIntersection(args)
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const findContainer = (id: string) => {
    if (id in items) return id

    const container = Object.keys(items).find((key) =>
      items[key].some((item) => item.id === id)
    )

    return container
  }

  const addTaskHandler = (container: string, task: Omit<Task, 'id'>) => {
    const tasks = [...items[container], { id: crypto.randomUUID(), ...task }]
    setItems((prev) => {
      return {
        ...prev,
        [container]: tasks,
      }
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || !active) return

    const currentId = active.id
    const overId = over.id

    const activeContainer = findContainer(currentId as string)
    const overContainer = findContainer(overId as string)

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return
    }

    setItems((prev) => {
      const activeItems = [...prev[activeContainer]]
      const overItems = [...prev[overContainer]]

      const activeIndex = activeItems.findIndex((item) => item.id === activeId)
      const overIndex = overItems.findIndex((item) => item.id === overId)

      let newIndex: number
      if (overId in prev) {
        newIndex = overItems.length + 1
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height

        const modifier = isBelowOverItem ? 1 : 0
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
      }

      const itemToMove = activeItems[activeIndex]
      activeItems.splice(activeIndex, 1)
      overItems.splice(newIndex - 1, 0, itemToMove)

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      setActiveId(null)
      return
    }

    const activeContainer = findContainer(active.id as string)
    const overContainer = findContainer(over.id as string)

    if (!activeContainer || !overContainer) {
      setActiveId(null)
      return
    }

    if (activeContainer === overContainer) {
      const activeIndex = items[activeContainer].findIndex(
        (item) => item.id === active.id
      )
      const overIndex = items[overContainer].findIndex(
        (item) => item.id === over.id
      )

      if (activeIndex !== overIndex) {
        setItems((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(
            prev[activeContainer],
            activeIndex,
            overIndex
          ),
        }))
      }
    }

    setActiveId(null)
  }

  const renderActiveCard = () => {
    if (activeId) {
      const activeCard = items[findContainer(activeId.toString())!].find(
        (item) => item.id === activeId
      )
      if (activeCard)
        return (
          <TaskCard
            className='bg-slate-900 opacity-85'
            id={activeCard?.id}
            title={activeCard?.title}
            description={activeCard?.description}
          />
        )
    }
    return null
  }

  return (
    <div className='flex gap-3'>
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetectionAlgorithm}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        id={id}
      >
        {Object.keys(items).map((containerId) => (
          <Column
            key={containerId}
            id={containerId}
            items={items[containerId]}
            addTaskHandler={addTaskHandler}
          >
            <SortableContext
              items={items[containerId].map((item) => item?.id)}
              strategy={verticalListSortingStrategy}
              id={containerId}
            >
              {items[containerId].map((item) => (
                <TaskCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </SortableContext>
          </Column>
        ))}
        <DragOverlay dropAnimation={dropAnimation}>
          {renderActiveCard()}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default Board
