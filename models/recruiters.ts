import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Companies } from "./companies";

@Table({
    tableName: "recruiters",
    timestamps: false,
})
export class Recruiters extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare recruiter_id: string;

    @ForeignKey(() => Companies)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    declare company_id: string;

    @BelongsTo(() => Companies, {
        foreignKey: 'company_id',
        as: 'company'
    })
    
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
        allowNull: false,
    })
    declare password: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare about: string | null;
}