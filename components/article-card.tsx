import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import Image from 'next/image'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    main_image_url?: string
    format: 'text' | 'video' | 'audio'
    is_premium: boolean
    author?: {
      id: string
      name: string
      profile_image_url?: string
    }
    tags?: string[]
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/articles/${article.id}`}>
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9}>
            {article.main_image_url ? (
              <Image
                src={article.main_image_url}
                alt={article.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-2 mb-2">
            {article.format !== 'text' && (
              <Badge variant="secondary">
                {article.format === 'video' ? '動画' : '音声'}
              </Badge>
            )}
            {article.is_premium && <Badge variant="default">限定記事</Badge>}
          </div>
          <h3 className="font-semibold line-clamp-2 mb-2">{article.title}</h3>
          {article.author && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={article.author.profile_image_url} />
                <AvatarFallback>{article.author.name?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {article.author.name}
              </span>
            </div>
          )}
        </CardContent>
        {article.tags && article.tags.length > 0 && (
          <CardFooter className="p-4 pt-0">
            <div className="flex gap-1 flex-wrap">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardFooter>
        )}
      </Link>
    </Card>
  )
}