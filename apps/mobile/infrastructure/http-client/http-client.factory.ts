import Constants from "expo-constants";
import { AxiosHttpClient } from "./axios-http-client";
import { HttpClient } from "./http-client.interface";

const apiUrl = Constants.expoConfig?.extra?.apiUrl;

export function createHttpClient(baseURL: string = apiUrl, timeout = 6000): HttpClient {
    return new AxiosHttpClient(baseURL, timeout);
}
