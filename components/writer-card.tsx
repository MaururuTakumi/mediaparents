import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

interface WriterCardProps {
  writer: {
    id: string
    name: string
    university: string
    faculty: string
    grade: number
    profile_image_url?: string
    is_certified: boolean
    tags?: string[]
  }
}

export default function WriterCard({ writer }: WriterCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/writers/${writer.id}`}>
        <CardHeader className="text-center pb-2">
          <Avatar className="h-24 w-24 mx-auto mb-3">
            <AvatarImage src={writer.profile_image_url} />
            <AvatarFallback className="text-2xl">{writer.name[0]}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg">{writer.name}</h3>
          {writer.is_certified && (
            <Badge className="mx-auto mt-2">Oyakology認定メンター</Badge>
          )}
        </CardHeader>
        <CardContent className="text-center text-sm space-y-1">
          <p className="text-muted-foreground">{writer.university}</p>
          <p className="text-muted-foreground">
            {writer.faculty} {writer.grade}年生
          </p>
          {writer.tags && writer.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap justify-center mt-3">
              {writer.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}