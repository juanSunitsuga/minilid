import { Table, Column, Model, DataType, BelongsToMany } from "sequelize-typescript";
import { JobPosts } from "./job_posts";
import { Appliers } from "./appliers";
import { JobPostSkill } from "./job_post_skills";
import { ApplierSkill } from "./applier_skills";

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
    declare skill_id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @BelongsToMany(() => JobPosts, () => JobPostSkill)
    declare job_posts: JobPosts[];
    
    @BelongsToMany(() => Appliers, () => ApplierSkill)
    declare appliers: Appliers[];
}