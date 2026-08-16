/**
 * Host 侧服务的最小类型面 + `@deepseek-ai/cordis` 的 Context 扩展。
 *
 * 这里只声明本插件实际使用的成员（与 rc.6 的真实服务签名一致），
 * 避免把整套 dsh-* 类型包变成硬依赖；插件也借此把“用到的能力”说清楚。
 */
import '@deepseek-ai/cordis';
