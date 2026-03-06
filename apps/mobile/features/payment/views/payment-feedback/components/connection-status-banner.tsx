import { useTheme } from "@shopify/restyle";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { Theme } from "@/constants/theme";

export type ConnectionStatusBannerStatus = "success" | "error";

type ConnectionStatusBannerProps = {
    status: ConnectionStatusBannerStatus;
};

export function ConnectionStatusBanner({ status }: ConnectionStatusBannerProps) {
    const appTheme = useTheme<Theme>();
    const isSuccess = status === "success";

    const backgroundColorToken = isSuccess ? "success" : "dangerBackground";
    const textColorToken = isSuccess ? "white" : "danger";
    const text = isSuccess ? "WebSocket de pagamento conectado" : "WebSocket de pagamento desconectado";

    return (
        <ThemedView
            style={{
                position: "absolute",
                top: appTheme.spacing.lg,
                left: appTheme.spacing.lg,
                right: appTheme.spacing.lg,
                zIndex: 10,
            }}
        >
            <ThemedView backgroundColor={backgroundColorToken} borderRadius={appTheme.radii.md} padding="md">
                <ThemedText color={textColorToken} variant="defaultSemiBold" textAlign="center">
                    {text}
                </ThemedText>
            </ThemedView>
        </ThemedView>
    );
}
