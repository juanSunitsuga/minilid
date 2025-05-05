import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { Company } from "./company";

@Table({
    tableName: "company_accounts",
    timestamps: false,
})
export class CompanyAccounts extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare account_id: string;

    @ForeignKey(() => Company)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare company_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare username: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;
}