import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./users";

@Table({
    tableName: "chats",
    timestamps: false,
})
export class Chats extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare chat_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare chat_name: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare created_at: Date;
}