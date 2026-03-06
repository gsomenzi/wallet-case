import { io, type Socket } from "socket.io-client";
import { WebSocketClient, type WebSocketSubscribeOptions } from "./websocket-client.interface";

export class SocketIoWebSocketClient extends WebSocketClient {
    constructor(private readonly baseUrl: string) {
        super();
    }

    subscribe<TSubscribePayload, TMessagePayload>(
        options: WebSocketSubscribeOptions<TSubscribePayload, TMessagePayload>
    ): () => void {
        const namespaceUrl = this.resolveNamespaceUrl(options.namespace);
        const socket: Socket = io(namespaceUrl, {
            transports: ["websocket"],
        });

        const handleConnect = () => {
            socket.emit(options.subscribeEvent, options.subscribePayload);
            options.onConnectionChange?.(true);
        };

        const handleDisconnect = () => {
            options.onConnectionChange?.(false);
        };

        const handleConnectError = () => {
            options.onConnectionChange?.(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.on(options.messageEvent, options.onMessage);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off(options.messageEvent, options.onMessage);
            options.onConnectionChange?.(false);
            socket.disconnect();
        };
    }

    private resolveNamespaceUrl(namespace: string): string {
        const normalizedNamespace = namespace.replace(/^\/+/, "");
        return `${this.baseUrl}/${normalizedNamespace}`;
    }
}
