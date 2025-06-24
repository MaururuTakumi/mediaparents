import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Heart, MessageCircle, Eye } from 'lucide-react'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    excerpt?: string
    main_image_url?: string
    format: 'text' | 'video' | 'audio'
    is_premium: boolean
    created_at?: string
    view_count?: number
    like_count?: number
    author?: {
      id: string
      name: string
      profile_image_url?: string
    }
    tags?: string[]
  }
  variant?: 'default' | 'large' | 'compact'
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const isLarge = variant === 'large'
  const isCompact = variant === 'compact'

  return (
    <article className={`group border-b border-gray-100 hover:bg-gray-50 transition-colors ${
      isLarge ? 'py-6' : isCompact ? 'py-3' : 'py-4'
    }`}>
      <Link href={`/articles/${article.id}`} className="block">
        <div className={`flex gap-4 ${isLarge ? 'flex-col' : 'flex-row'}`}>
          {/* Thumbnail */}
          {article.main_image_url && (
            <div className={`
              overflow-hidden rounded-lg flex-shrink-0 relative
              ${isLarge ? 'w-full aspect-[16/9]' : 
                isCompact ? 'w-16 h-16' : 'w-32 h-24'}
            `}>
              <Image
                src={article.main_image_url}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta info */}
            <div className="flex items-center gap-2 mb-2">
              {article.author && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={article.author.profile_image_url} />
                    <AvatarFallback className="text-xs">
                      {article.author.name?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 font-medium">
                    {article.author.name}
                  </span>
                </div>
              )}
              {article.created_at && (
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(article.created_at), { 
                    addSuffix: true, 
                    locale: ja 
                  })}
                </span>
              )}
              {article.is_premium && (
                <Badge variant="default" className="h-4 text-xs bg-blue-600">
                  プレミアム
                </Badge>
              )}
              {article.format !== 'text' && (
                <Badge variant="secondary" className="h-4 text-xs">
                  {article.format === 'video' ? '動画' : '音声'}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className={`
              font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2
              ${isLarge ? 'text-xl leading-tight' : 
                isCompact ? 'text-sm' : 'text-base'}
            `}>
              {article.title}
            </h3>

            {/* Excerpt (only for large variant) */}
            {isLarge && article.excerpt && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {article.excerpt}
              </p>
            )}

            {/* Stats and Tags */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* View count */}
                {article.view_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {article.view_count.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Like count */}
                {article.like_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {article.like_count}
                    </span>
                  </div>
                )}

                {/* Picks count placeholder */}
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {Math.floor(Math.random() * 50)}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && !isCompact && (
                <div className="flex gap-1">
                  {article.tags.slice(0, 2).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs h-5 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}