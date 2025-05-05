import { Table, Column, Model, DataType } from "sequelize-typescript";

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