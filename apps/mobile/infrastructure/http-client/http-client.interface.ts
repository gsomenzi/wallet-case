/** biome-ignore-all lint/suspicious/noExplicitAny: request objects may have any shape */

export type POSTBODY = Record<string, any>;

export abstract class HttpClient {
    abstract get<T>(url: string, params?: Record<string, any>): Promise<T>;
    abstract post<T>(url: string, data?: POSTBODY): Promise<T>;
    abstract put<T>(url: string, data?: POSTBODY): Promise<T>;
    abstract delete<T>(url: string, params?: Record<string, any>): Promise<T>;
}
