import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "company",
    timestamps: false,
})
export class Company extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare company_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare company_name: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare address: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare website: string;
}