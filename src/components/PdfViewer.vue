<template>
  <div class="container">
    <div class="toolbar">
      <div class="left">
        <button @click="prevPage" :disabled="pageNum <= 1">上一页</button>
        <span class="page-info">{{ pageNum }} / {{ numPages || '?' }}</span>
        <button @click="nextPage" :disabled="!numPages || pageNum >= numPages">下一页</button>
      </div>
      <div class="right">
        <button @click="zoomOut">-</button>
        <span>{{ (scale * 100).toFixed(0) }}%</span>
        <button @click="zoomIn">+</button>
      </div>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvasEl"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, watch, onBeforeUnmount } from 'vue'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs'
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
GlobalWorkerOptions.workerSrc = workerUrl

const props = defineProps({
  url: { type: String, required: true }
})

const canvasEl = ref(null)
const pdfDocRef = shallowRef(null)
const pageNum = ref(1)
const numPages = ref(null)
const scale = ref(1.25)


async function loadPdf(url) {
  cleanup()

  // 设置后直接创建加载任务（ESM 入口）
  const loadingTask = getDocument({ url })

  const pdfDoc = await loadingTask.promise
  pdfDocRef.value = pdfDoc
  numPages.value = pdfDoc.numPages
  pageNum.value = 1
  await renderPage(pageNum.value)
}

async function renderPage(num) {
  const pdfDoc = pdfDocRef.value
  if (!pdfDoc) return
  const page = await pdfDoc.getPage(num)
  const viewport = page.getViewport({ scale: scale.value })

  const canvas = canvasEl.value
  const ctx = canvas.getContext('2d')

  canvas.height = viewport.height
  canvas.width = viewport.width

  const renderContext = { canvasContext: ctx, viewport }
  await page.render(renderContext).promise
}

function prevPage() {
  if (pageNum.value <= 1) return
  pageNum.value--
  renderPage(pageNum.value)
}

function nextPage() {
  if (!numPages.value || pageNum.value >= numPages.value) return
  pageNum.value++
  renderPage(pageNum.value)
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.1, 3)
  renderPage(pageNum.value)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.1, 0.5)
  renderPage(pageNum.value)
}

function cleanup() {
  try {
    const pdfDoc = pdfDocRef.value
    if (pdfDoc) pdfDoc.destroy()
  } catch {}
  pdfDocRef.value = null
  numPages.value = null
  pageNum.value = 1


}

onMounted(() => {
  if (props.url) loadPdf(props.url)
})

watch(() => props.url, (newUrl) => {
  if (newUrl) loadPdf(newUrl)
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid #eee;
  padding: 8px 10px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.toolbar .left, .toolbar .right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar button {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
}

.page-info {
  min-width: 70px;
  text-align: center;
}

.canvas-wrap {
  display: flex;
  justify-content: center;
  padding: 12px;
}

canvas {
  width: 100%;
  height: auto;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-radius: 8px;
}
</style>