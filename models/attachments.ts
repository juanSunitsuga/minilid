import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Messages } from "./messages";

@Table({
    tableName: "attachments",
    timestamps: false,
})
export class Attachments extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare attachment_id: string;

    @ForeignKey(() => Messages)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare message_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare file_url: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare file_type: string;
}