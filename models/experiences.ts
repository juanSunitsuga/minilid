import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Appliers } from "./appliers";

@Table({
    tableName: "experiences",
    timestamps: false,
})
export class Experiences extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare experience_id: string;

    @ForeignKey(() => Appliers)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare applier_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare company_name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare position: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare start_date: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare end_date: Date;
}