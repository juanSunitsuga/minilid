import { Table, Column, Model, ForeignKey, DataType } from "sequelize-typescript";
import { JobPosts } from "./job_posts";
import { Skills } from "./skills";

@Table({
    tableName: "job_post_skills",
    timestamps: false,
})
export class JobPostSkill extends Model {
    @ForeignKey(() => JobPosts)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataType.UUIDV4
    })
    declare job_id: string;

    @ForeignKey(() => Skills)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
    })
    declare skill_id: number;
}