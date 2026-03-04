import { config as loadEnv } from "dotenv";
import type { ExpoConfig } from "expo/config";
import path from "path";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

const appJson = require("./app.json") as { expo: ExpoConfig };

export default (): ExpoConfig => ({
    ...appJson.expo,
    extra: {
        ...appJson.expo.extra,
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
});
