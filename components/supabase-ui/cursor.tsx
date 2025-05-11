import { cn } from '@/lib/utils'
import { MousePointer2Icon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export const Cursor = ({
  className,
  style,
  color,
  name,
  avatar,
}: {
  className?: string
  style?: React.CSSProperties
  color: string
  name: string,
  avatar: string
}) => {
  return (
    <div className={cn('pointer-events-none', className)} style={style}>
      <MousePointer2Icon color={color} fill={color} size={30} />
      <div
        className="-mt-1 ml-6 px-2 py-1 rounded-full text-sm font-semibold text-white text-center flex items-center gap-1"
        style={{ backgroundColor: color }}
      >
        <Avatar className="w-4 h-4 rounded-full">
          <AvatarImage src={avatar} />
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        {name}
      </div>
    </div>
  )
}
