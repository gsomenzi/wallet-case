import { useTheme } from "@shopify/restyle";
import { ActivityIndicator, TouchableOpacity } from "react-native";

import { Theme } from "@/constants/theme";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

type ButtonProps = {
    children: React.ReactNode;
    isLoading?: boolean;
    onPress?: () => void;
    colorScheme?: "primary" | "secondary";
};

export function Button({ children, colorScheme = "primary", isLoading, onPress }: ButtonProps) {
    const appTheme = useTheme<Theme>();

    function handlePress() {
        if (isLoading) return;
        onPress?.();
    }

    function getColorSchemeStyles() {
        switch (colorScheme) {
            case "primary":
                return {
                    backgroundColor: appTheme.colors.primary,
                    borderColor: appTheme.colors.primary,
                };
            case "secondary":
                return {
                    backgroundColor: appTheme.colors.secondary,
                    borderColor: appTheme.colors.secondary,
                };
            default:
                return {};
        }
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <ThemedView
                borderWidth={1}
                alignItems="center"
                padding="md"
                borderColor="border"
                borderRadius={appTheme.radii.md}
                style={[getColorSchemeStyles(), { opacity: isLoading ? 0.7 : 1 }]}
            >
                {isLoading ? (
                    <ActivityIndicator
                        size={20}
                        style={{ display: isLoading ? "flex" : "none" }}
                        color={appTheme.colors.white}
                    />
                ) : typeof children === "string" ? (
                    <ThemedText variant="button" color="white">
                        {children}
                    </ThemedText>
                ) : (
                    children
                )}
            </ThemedView>
        </TouchableOpacity>
    );
}
