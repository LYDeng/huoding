import type { ProxyOptions } from "vite";

type ProxyItem = [string, string];

type ProxyList = ProxyItem[];

type ProxyTargetList = Record<string, ProxyOptions>;

const httpsRE = /^https:\/\//;
// 创建代理，用于解析 .env.development 代理配置

export function createProxy(list: ProxyList = []) {
  const ret: ProxyTargetList = {};
  for (const [prefix, target] of list) {
    // const isHttp = target.startsWith("http");
    // const targetProtocol = isHttp ? "" : "http://";
    // const name = prefix.replace("/api", "");
    // ret[name] = {
    //   target: targetProtocol + target,
    //   changeOrigin: true,
    //   rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ""),
    // };

    const isHttps = httpsRE.test(target);
    ret[prefix] = {
      target: target,
      changeOrigin: true,
      ws: true,
      rewrite: path => path.replace(new RegExp(`^${prefix}`), ""),
      // https is require secure=false
      ...(isHttps ? { secure: false } : {})
    };
  }
  return ret;
}
