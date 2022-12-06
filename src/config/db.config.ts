import * as dotenv from "dotenv";
import path from "path";
import { Sequelize } from "sequelize";

dotenv.config({
	path: path.join(__dirname, "../../.env"),
});

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

const dbConfig = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
	host: DB_HOST,
	dialect: "postgres",
	logging: console.log,
});

dbConfig
	.authenticate()
	.then(() => {
		console.log("Connected to DB server");
	})
	.catch(() => {
		console.error("Failed to connect to DB server");
	});

export default dbConfig;
