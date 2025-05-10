import { Table, Column, Model, DataType, BelongsTo } from "sequelize-typescript";
import { JobPosts } from "./job_posts";
import { Appliers } from "./appliers";

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

    @BelongsTo(() => JobPosts, {
        foreignKey: "job_id",
    })
    declare job_posts: JobPosts[];

    @BelongsTo(() => Appliers, {
        foreignKey: "applier_id",
    })
    declare applier: Appliers[];
}