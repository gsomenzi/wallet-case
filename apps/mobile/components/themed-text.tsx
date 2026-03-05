import { createText, useTheme } from "@shopify/restyle";
import { type ComponentProps } from "react";

import { type Theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

const BaseText = createText<Theme>();

type TextVariant = keyof Theme["textVariants"];

export type ThemedTextProps = ComponentProps<typeof BaseText> & {
    textAlign?: "auto" | "left" | "right" | "center" | "justify";
    lightColor?: string;
    darkColor?: string;
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    variant = "default" as TextVariant,
    textAlign = "left",
    ...rest
}: ThemedTextProps) {
    const appTheme = useTheme<Theme>();
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
    const hasCustomColor = lightColor !== undefined || darkColor !== undefined;
    const hasRestyleColor = rest.color !== undefined;
    const resolvedColor = hasCustomColor ? color : variant === "link" ? appTheme.colors.primary : color;

    return (
        <BaseText
            variant={variant}
            style={[!hasRestyleColor && { color: resolvedColor }, { textAlign }, style]}
            {...rest}
        />
    );
}
