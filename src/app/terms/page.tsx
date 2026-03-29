import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '服务条款 - AI图片背景移除',
  description: 'image-bg-remover.shop 服务条款。使用我们的AI图片背景移除工具即表示您同意以下条款。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://image-bg-remover.shop/terms',
  },
}

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">服务条款</h1>
        
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 服务说明</h2>
            <p>image-bg-remover.shop 提供AI驱动的图片背景移除服务。用户可通过我们的网站上传图片，并使用我们的AI技术移除图片背景。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 使用限制</h2>
            <p>我们的服务仅限合法用途。您不得使用本服务处理：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>侵犯他人知识产权的内容</li>
              <li>用于欺诈或诈骗的材料</li>
              <li>违法或有害内容</li>
              <li>未经同意的他人隐私信息</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 积分与订阅</h2>
            <p>积分购买后永久有效，可随时使用。订阅服务按月计费，随时可取消。取消后您仍可使用剩余积分直至用完。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 知识产权</h2>
            <p>处理后的图片版权归您所有。我们保留服务本身的所有知识产权。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 免责声明</h2>
            <p>我们尽力保证服务质量，但不对处理结果的特定用途作任何保证。对于因服务中断或错误导致的损失，我们不承担责任。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 服务变更</h2>
            <p>我们保留随时修改或终止服务的权利。如有重大变更，我们将提前通知用户。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 联系我们</h2>
            <p>如有任何问题，请通过以下方式联系我们：</p>
            <p className="mt-2">邮箱：support@image-bg-remover.shop</p>
          </section>

          <p className="text-sm text-gray-500 mt-8">最后更新：2026年3月</p>
        </div>
      </main>
    </div>
  )
}
