import Constants from "expo-constants";
import { SocketIoWebSocketClient } from "./socket-io-websocket-client";
import { WebSocketClient } from "./websocket-client.interface";

const apiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;

export function createWebSocketClient(baseUrl: string = resolveBaseUrl(apiUrl)): WebSocketClient {
    return new SocketIoWebSocketClient(baseUrl);
}

function resolveBaseUrl(url?: string): string {
    if (!url) {
        return "http://localhost:3000";
    }

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.origin;
    } catch {
        const sanitizedBase = url.replace(/\/$/, "");
        return sanitizedBase.replace(/\/v\d+$/i, "");
    }
}
