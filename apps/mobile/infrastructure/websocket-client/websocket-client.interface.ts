export type WebSocketSubscribeOptions<TSubscribePayload, TMessagePayload> = {
    namespace: string;
    subscribeEvent: string;
    subscribePayload: TSubscribePayload;
    messageEvent: string;
    onMessage: (payload: TMessagePayload) => void;
    onConnectionChange?: (isConnected: boolean) => void;
};

export abstract class WebSocketClient {
    abstract subscribe<TSubscribePayload, TMessagePayload>(
        options: WebSocketSubscribeOptions<TSubscribePayload, TMessagePayload>
    ): () => void;
}
