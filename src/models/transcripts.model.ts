import sequelize, { DataTypes, Model } from "sequelize";

import dbConfig from "../config/db.config";

interface TranscriptAttributes {
	id: number;
	transcript: string;
	timestamp: string;
	session_id: string;
	room_id: string;
	source: string;
	search_term: sequelize.Utils.Fn;
	meta_data: object;
	author?: object;
	created_at?: Date;
}

class Transcript
	extends Model<TranscriptAttributes>
	implements TranscriptAttributes
{
	public id!: number;
	public transcript!: string;
	public timestamp!: string;
	public session_id!: string;
	public room_id!: string;
	public source!: string;
	public author!: object;
	public search_term!: sequelize.Utils.Fn;
	public meta_data!: object;

	// timestamps!
	public readonly created_at!: Date;
}

Transcript.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		transcript: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		timestamp: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		session_id: {
			type: DataTypes.STRING(128),
			allowNull: false,
		},
		room_id: {
			type: DataTypes.STRING(128),
			allowNull: false,
		},
		source: {
			type: DataTypes.STRING(200),
			allowNull: true,
		},
		author: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		meta_data: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		search_term: {
			type: DataTypes.TSVECTOR,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: Date.now(),
		},
	},
	{
		sequelize: dbConfig,
		timestamps: false,
		tableName: "transcripts",
	}
);

export default Transcript;
