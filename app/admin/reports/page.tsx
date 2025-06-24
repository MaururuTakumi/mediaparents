import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

export default async function AdminReportsPage() {
  const supabase = await createClient()
  
  // 通報を取得
  const { data: reports } = await supabase
    .from('article_reports')
    .select(`
      *,
      articles (
        id,
        title,
        writers (name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">通報管理</h1>
        <p className="mt-2 text-gray-600">記事に対する通報の確認と対応</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>通報一覧</CardTitle>
          <CardDescription>
            最新の通報内容
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports && reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        記事: {report.articles?.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        ライター: {report.articles?.writers?.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="destructive">
                          {report.report_type === 'inappropriate' && '不適切'}
                          {report.report_type === 'spam' && 'スパム'}
                          {report.report_type === 'copyright' && '著作権侵害'}
                          {report.report_type === 'other' && 'その他'}
                        </Badge>
                        <Badge variant={report.status === 'pending' ? 'secondary' : 'outline'}>
                          {report.status === 'pending' && '未対応'}
                          {report.status === 'reviewing' && '確認中'}
                          {report.status === 'resolved' && '解決済み'}
                          {report.status === 'dismissed' && '却下'}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm">{report.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>通報はありません</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}