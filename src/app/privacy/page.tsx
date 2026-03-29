import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '隐私政策 - AI图片背景移除',
  description: 'image-bg-remover.shop 隐私政策。我们重视您的隐私保护，承诺不会出售或滥用您的个人信息。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://image-bg-remover.shop/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">✂️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Background Remover</h1>
              <p className="text-xs text-gray-500">One-click intelligent background removal</p>
            </div>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>
        
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">我们收集的信息</h2>
            <p>为提供服务，我们可能收集以下信息：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>账户信息</strong>：注册时提供的邮箱和密码（加密存储）</li>
              <li><strong>使用数据</strong>：处理的图片数量、时间和频率</li>
              <li><strong>支付信息</strong>：通过PayPal处理的支付信息（由PayPal直接处理，我们不存储卡号）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">信息使用方式</h2>
            <p>我们使用收集的信息用于：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>提供和维护我们的AI图片背景移除服务</li>
              <li>处理您的账户注册和订阅管理</li>
              <li>提供客户支持</li>
              <li>改进服务质量</li>
              <li>发送服务相关通知（如账户安全警示）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">图片处理</h2>
            <p>您上传的图片仅在处理时使用，处理完成后即自动删除。我们不会将您的原始图片用于任何其他目的，也不会将图片存储在我们的服务器上超过必要时间。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">信息共享</h2>
            <p>我们不会出售、租借或交易您的个人信息给第三方。以下情况除外：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>PayPal：用于处理支付</li>
              <li>Cloudflare：用于网站安全和加速</li>
              <li>法律要求：当我们真诚地认为法律要求披露时</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">数据安全</h2>
            <p>我们采用行业标准的安全措施保护您的数据：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>HTTPS加密传输</li>
              <li>密码加密存储（bcrypt）</li>
              <li>Cloudflare安全防护</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">您的权利</h2>
            <p>您有权：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>访问您的个人数据</li>
              <li>更正不准确的信息</li>
              <li>删除您的账户（联系 support@image-bg-remover.shop）</li>
              <li>导出您的数据</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookie政策</h2>
            <p>我们使用必要的Cookie来维护会话和账户安全。Cookie是存储在您浏览器中的小文件，用于识别您的身份。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">第三方服务</h2>
            <p>我们的服务集成了以下第三方：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Cloudflare</strong>：网站安全、内容分发网络（<a href="https://www.cloudflare.com/privacypolicy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener">隐私政策</a>）</li>
              <li><strong>PayPal</strong>：支付处理（<a href="https://www.paypal.com/webapps/mpp/ua/privacy-full" className="text-blue-600 hover:underline" target="_blank" rel="noopener">隐私政策</a>）</li>
              <li><strong>Clerk</strong>：用户认证（<a href="https://clerk.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener">隐私政策</a>）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">政策变更</h2>
            <p>我们可能不时更新本隐私政策。任何重大变更都将通过网站公告通知。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">联系我们</h2>
            <p>如对隐私政策有任何疑问，请联系我们：</p>
            <p className="mt-2">邮箱：support@image-bg-remover.shop</p>
          </section>

          <p className="text-sm text-gray-500 mt-8">最后更新：2026年3月</p>
        </div>
      </main>
    </div>
  )
}
