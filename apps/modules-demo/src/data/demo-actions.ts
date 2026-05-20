import { notify } from '../marketplace'

export function triggerDemoNotifications() {
  notify.info('系统就绪', { message: '所有模块已加载完成，可以开始演示' })
  setTimeout(() => notify.success('数据刷新', { message: '行情数据已更新至最新' }), 1500)
  setTimeout(() => notify.warning('连接延迟', { message: 'WebSocket 响应超过 500ms', duration: 6000 }), 3000)
}
