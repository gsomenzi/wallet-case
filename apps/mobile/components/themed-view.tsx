import { createBox } from "@shopify/restyle";
import { type ComponentProps } from "react";

import { type Theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

const BaseView = createBox<Theme>();

export type ThemedViewProps = ComponentProps<typeof BaseView> & {
    lightColor?: string;
    darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, backgroundColor, ...otherProps }: ThemedViewProps) {
    const resolvedBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background");

    return (
        <BaseView
            backgroundColor={backgroundColor}
            style={[!backgroundColor && { backgroundColor: resolvedBackgroundColor }, style]}
            {...otherProps}
        />
    );
}
