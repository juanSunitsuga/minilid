import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Chats } from "./chats";

@Table({
    tableName: "messages",
    timestamps: false,
})
export class Messages extends Model {
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
    })
    declare message_id: string;

    @ForeignKey(() => Chats)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare chat_id: string;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare sender_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare content: string;

    @Column({
        type: DataType.ENUM("TEXT", "IMAGE", "VIDEO", "FILE"),
        allowNull: false,
    })
    declare message_type: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare timestamp: Date;

    @Column({
        type: DataType.ENUM("SENT", "DELIVERED", "READ"),
        allowNull: false,
        defaultValue: "SENT",
    })
    declare status: string;
}