import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "appliers",
    timestamps: false,
})
export class Appliers extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare applier_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare resume: string;
}