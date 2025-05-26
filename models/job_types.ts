import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { JobPosts } from "./job_posts";

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
    declare type_id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare type_name: string;

    @HasMany(() => JobPosts)
    declare job_posts: JobPosts[];
}