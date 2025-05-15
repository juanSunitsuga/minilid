import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./users";

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

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'user_id' // Change from applier_id if your database schema is updated
    })
    declare user_id: string;

    @BelongsTo(() => User)
    declare user: User;

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