import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "skills",
    timestamps: false,
})
export class Skills extends Model {
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
    })
    declare skill_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare skill_name: string;
}