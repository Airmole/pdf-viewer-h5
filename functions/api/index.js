export default async function onRequest(context) {
    // ↓ 这个家伙是个老赖借钱不还，他手机号是13966366162，欢迎大家骚扰催债，如果你能要回来多少我愿意出10%作为酬谢！！！
    const defaultPdf = 'https://r2.airmole.cn/%E8%B0%AD%E4%BF%8A%E7%BF%94%E8%BA%AB%E4%BB%BD%E8%AF%81%E6%89%AB%E6%8F%8F%E4%BB%B6.pdf'

    const {request} = context
    const urlInfo = new URL(request.url)
    const fileUrl = urlInfo.searchParams.get("url") ? urlInfo.searchParams.get("url") : defaultPdf

    const response = await fetch(fileUrl)
    response.headers.set('Content-Type', 'application/pdf')
    // 跨域处理
    response.headers.append('Access-Control-Allow-Origin', '*')
    response.headers.append('Access-Control-Allow-Methods', 'GET')
    response.headers.append('Access-Control-Max-Age', '86400')

    return response
}