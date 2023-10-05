import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ResultEnum } from "./enums/httpEnum";
import { LOGIN_URL } from "@/config";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
import { ResultData } from "@/api/interface";
import router from "@/routers";

const config = {
  // 默认地址请求地址，可在 .env.** 文件中修改
  baseURL: import.meta.env.VITE_API_URL as string,
  // 设置超时时间
  timeout: ResultEnum.TIMEOUT as number,
  // 跨域时候允许携带凭证
  withCredentials: true
};

class RequestHttp {
  service: AxiosInstance;
  constructor(config: AxiosRequestConfig) {
    this.service = axios.create(config);
    this.service.interceptors.request.use(this.requestInterceptor, this.requestInterceptorCatch);
    this.service.interceptors.response.use(this.responseInterceptor, this.responseInterceptorCatch);
  }
  requestInterceptor = (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    const token = userStore.token;
    if (token) {
      config.headers["Authorization"] = token;
    }
    return config;
  };
  requestInterceptorCatch = (error: AxiosError) => {
    return Promise.reject(error);
  };
  responseInterceptor = (res: AxiosResponse) => {
    const { data } = res;
    const { code, msg } = data;
    const userStore = useUserStore();
    // 登陆失效
    if (code == ResultEnum.OVERDUE) {
      userStore.setToken("");
      router.replace(LOGIN_URL);
      ElMessage.error(msg);
      return Promise.reject(data);
    }
    // 全局错误信息拦截（防止下载文件的时候返回数据流，没有 code 直接报错）
    if (code && code !== ResultEnum.SUCCESS) {
      ElMessage.error(msg);
      return Promise.reject(data);
    }
    // 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
    return data;
  };
  responseInterceptorCatch = (error: AxiosError) => {
    return Promise.reject(error);
  };

  /**
   * @description 常用请求方法封装
   */
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.get(url, { params, ..._object });
  }
  post<T>(url: string, params?: object | string, _object = {}): Promise<ResultData<T>> {
    return this.service.post(url, params, _object);
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, _object);
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ..._object });
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ..._object, responseType: "blob" });
  }
}

export default new RequestHttp(config);
