import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "job_types",
    timestamps: false,
})
export class JobTypes extends Model {
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
    })
    declare type_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare type_name: string;
}