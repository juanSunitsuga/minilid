import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Companies } from "./companies";

@Table({
    tableName: "branch",
    timestamps: false,
})
export class Branch extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare branch_id: string;

    @ForeignKey(() => Companies)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare company_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare branch_name: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare location: string;
}