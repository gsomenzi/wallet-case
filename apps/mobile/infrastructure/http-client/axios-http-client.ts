/** biome-ignore-all lint/suspicious/noExplicitAny: request objects may have any shape  */
import axios, { AxiosInstance } from "axios";
import { HttpClient, POSTBODY } from "./http-client.interface";

export class AxiosHttpClient extends HttpClient {
    client: AxiosInstance;
    constructor(baseURL: string, timeout: number) {
        super();
        this.client = axios.create({
            baseURL,
            timeout,
        });
    }

    async get<T>(url: string, params?: Record<string, any>): Promise<T> {
        const response = await this.client.get<T>(url, { params });
        return response.data;
    }

    async post<T>(url: string, data?: POSTBODY): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data?: POSTBODY): Promise<T> {
        const response = await this.client.put<T>(url, data);
        return response.data;
    }

    async delete<T>(url: string, params?: Record<string, any>): Promise<T> {
        const response = await this.client.delete<T>(url, { params });
        return response.data;
    }
}
