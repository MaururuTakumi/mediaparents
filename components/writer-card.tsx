import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

interface WriterCardProps {
  writer: {
    id: string
    name: string
    university: string
    faculty?: string
    grade?: number
    avatar_url?: string
    is_verified: boolean
    bio?: string
  }
}

export default function WriterCard({ writer }: WriterCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/writers/${writer.id}`}>
        <CardHeader className="text-center pb-2">
          <Avatar className="h-24 w-24 mx-auto mb-3">
            <AvatarImage src={writer.avatar_url} />
            <AvatarFallback className="text-2xl">{writer.name[0]}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg">{writer.name}</h3>
          {writer.is_verified && (
            <Badge className="mx-auto mt-2">認証済みライター</Badge>
          )}
        </CardHeader>
        <CardContent className="text-center text-sm space-y-1">
          <p className="text-muted-foreground">{writer.university}</p>
          {(writer.faculty || writer.grade) && (
            <p className="text-muted-foreground">
              {writer.faculty} {writer.grade ? `${writer.grade}年生` : ''}
            </p>
          )}
          {writer.bio && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
              {writer.bio}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}