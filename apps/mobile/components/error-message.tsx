import { useTheme } from "@shopify/restyle";
import { Theme } from "@/constants/theme";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type ErrorMessageProps = {
    title: string;
    message: string;
};

export function ErrorMessage({ title, message }: ErrorMessageProps) {
    const appTheme = useTheme<Theme>();
    return (
        <ThemedView padding="lg" borderRadius={appTheme.radii.md} backgroundColor="dangerBackground">
            <ThemedText color="danger" fontWeight="bold">
                {title}
            </ThemedText>
            <ThemedText color="danger">{message}</ThemedText>
        </ThemedView>
    );
}
