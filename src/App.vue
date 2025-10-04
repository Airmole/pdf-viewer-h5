<template>
  <div class="page">
    <header class="topbar">
      <h1>PDF预览</h1>
    </header>

    <section class="controls">
      <input
        v-model.trim="inputUrl"
        type="url"
        placeholder="输入公开可访问的 PDF 链接"
      />
      <button @click="loadFromInput" :disabled="!inputUrl">加载</button>
      <button @click="downloadPdf" :disabled="!url">下载</button>
      <p class="hint">也可通过地址栏传参：?url=PDF链接</p>
    </section>

    <section class="viewer">
      <PdfViewer v-if="url" :url="proxiedUrl" />
      <div v-else class="placeholder">
        <p>请输入或通过路由参数 ?url= 传入 PDF 链接进行预览</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import PdfViewer from './components/PdfViewer.vue'

const route = useRoute()
const router = useRouter()

const api = ref('https://pdfviewer.airmole.cn/api?url=')
const url = ref(route.query.url || '')
const inputUrl = ref(url.value)
const proxiedUrl = computed(() => url.value ? api.value + encodeURIComponent(url.value) : '')

watch(() => route.query.url, (v) => {
  url.value = v || ''
  inputUrl.value = url.value
})

function loadFromInput() {
  router.replace({ path: '/', query: { url: inputUrl.value } })
}

async function downloadPdf() {
  try {
    if (!url.value) return

    const ua = navigator.userAgent
    // 微信浏览器
    const isWechat = /micromessenger/i.test(ua)
    if (isWechat) {
      alert('请点击右上角「...」-> 在浏览器中打开后再点击下载！')
      return
    }

    const res = await fetch(proxiedUrl.value)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()

    // 从响应头或原始 URL 推断文件名
    const cd = res.headers.get('content-disposition') || ''
    let filename = ''
    const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i)
    if (match) {
      filename = decodeURIComponent(match[1] || match[2] || '')
    }
    if (!filename) {
      try {
        const u = new URL(url.value)
        filename = decodeURIComponent(u.pathname.split('/').pop() || '') || 'document.pdf'
      } catch {
        filename = 'document.pdf'
      }
    }
    if (!/\.(pdf)$/i.test(filename)) filename += '.pdf'

    // 触发浏览器下载
    const a = document.createElement('a')
    const objectUrl = URL.createObjectURL(blob)
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch (e) {
    console.error('下载失败:', e)
    alert('下载失败')
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.topbar {
  background: #111827;
  color: #fff;
  padding: 6px 12px;
}
.topbar h1 {
  font-size: 16px;
  margin: 0;
  font-weight: 600;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.controls input {
  flex: 1;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

.controls button {
  height: 36px;
  padding: 0 14px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
}

.hint {
  margin-left: auto;
  color: #6b7280;
  font-size: 12px;
}

.viewer {
  flex: 1;
  overflow: auto;
  background: #f7f7f7;
}

.placeholder {
  color: #6b7280;
  text-align: center;
  padding: 60px 20px;
}
/* 移动端适配增强 */
.page {
  padding-bottom: env(safe-area-inset-bottom);
}

.topbar {
  padding-top: calc(6px + env(safe-area-inset-top));
  -webkit-user-select: none;
  user-select: none;
}

.controls {
  flex-wrap: wrap;
}

.controls input {
  -webkit-tap-highlight-color: transparent;
}

.viewer {
  -webkit-overflow-scrolling: touch;
}

/* 小屏优化 */
@media (max-width: 640px) {
  .topbar h1 {
    font-size: 15px;
  }

  .controls {
    gap: 6px;
    padding: 10px 10px;
  }

  .controls input {
    flex: 1 1 100%;
    width: 100%;
    height: 40px;
    font-size: 16px; /* 避免 iOS 触发自动缩放 */
  }

  .controls button {
    flex: 1 1 auto;
    height: 40px;
    min-width: 84px;
    padding: 0 12px;
  }

  .hint {
    flex-basis: 100%;
    margin-left: 0;
    margin-top: 2px;
    font-size: 12px;
  }

  .placeholder {
    padding: 40px 16px;
  }
}
</style>