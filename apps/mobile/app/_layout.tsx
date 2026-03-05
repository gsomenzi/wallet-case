import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { ThemeProvider as RestyleThemeProvider } from "@shopify/restyle";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { theme } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <RestyleThemeProvider theme={theme}>
                <Stack>
                    <Stack.Screen name="payment-form" options={{ headerShown: false }} />
                    <Stack.Screen name="payment-feedback" options={{ title: "Feedback", headerBackTitle: "Voltar" }} />
                </Stack>
                <StatusBar style="auto" />
            </RestyleThemeProvider>
        </ThemeProvider>
    );
}
