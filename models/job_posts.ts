import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./users";
import { Company } from "./company";

@Table({
    tableName: "job_posts",
    timestamps: false,
})
export class JobPosts extends Model {
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
    })
    declare job_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare posted_date: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare deleted: boolean;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'recruiter_id' // Keep field name the same for DB compatibility
    })
    declare recruiter_id: string;

    @BelongsTo(() => User, { foreignKey: 'recruiter_id', constraints: false })
    declare recruiter: User;
}