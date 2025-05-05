import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "job_categories",
    timestamps: false,
})
export class JobCategories extends Model {
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
    })
    declare category_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare category_name: string;
}