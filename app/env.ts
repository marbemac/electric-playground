import dotenvFlow from "dotenv-flow";
import { cleanEnv, str } from "envalid";

dotenvFlow.config();

export const env = cleanEnv(process.env, {
	PG_URL: str(),
	VITE_ELECTRIC_URL: str(),
});
