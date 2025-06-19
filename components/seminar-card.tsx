import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Calendar, Users, Clock } from 'lucide-react'

interface SeminarCardProps {
  seminar: {
    id: string
    title: string
    description: string
    host_writer: {
      id: string
      name: string
      profile_image_url?: string
    }
    start_at: string
    duration_minutes: number
    price: number
    capacity: number
  }
}

export default function SeminarCard({ seminar }: SeminarCardProps) {
  const date = new Date(seminar.start_at)
  const formattedDate = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedTime = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/seminars/${seminar.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">
              {seminar.title}
            </h3>
            {seminar.price === 0 ? (
              <Badge variant="secondary">無料</Badge>
            ) : (
              <Badge>¥{seminar.price.toLocaleString()}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {seminar.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={seminar.host_writer.profile_image_url} />
              <AvatarFallback>{seminar.host_writer.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">ホスト: {seminar.host_writer.name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>定員 {seminar.capacity}名</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{seminar.duration_minutes}分</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}