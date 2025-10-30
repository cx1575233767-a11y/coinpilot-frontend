import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">设置</h2>
        <p className="text-muted-foreground">管理您的应用偏好设置</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>外观</CardTitle>
          <CardDescription>自定义应用的外观和感觉</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>主题</Label>
            <p className="text-sm text-muted-foreground">使用右上角的主题切换器更改主题</p>
          </div>
          <div className="space-y-2">
            <Label>语言</Label>
            <p className="text-sm text-muted-foreground">使用右上角的语言切换器更改语言</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>偏好设置</CardTitle>
          <CardDescription>配置您的应用偏好</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="time-format">时间格式</Label>
            <Select defaultValue="24h">
              <SelectTrigger id="time-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12小时制</SelectItem>
                <SelectItem value="24h">24小时制</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
