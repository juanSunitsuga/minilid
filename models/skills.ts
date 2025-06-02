import { Table, Column, Model, DataType, BelongsToMany } from "sequelize-typescript";
import { JobPosts } from "./job_posts";
import { Appliers } from "./appliers";
import { JobPostSkill } from "./job_post_skills";
import { ApplierSkill } from "./applier_skill";

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
        type: DataType.STRING(50),
        allowNull: false,
        unique: true
    })
    declare name: string;

    @BelongsToMany(() => JobPosts, {
        through: () => JobPostSkill,
        foreignKey: "skill_id",
        otherKey: "job_post_id",
        as: "job_posts"
    })
    declare job_posts: JobPosts[];
    
    // Many-to-Many relationship with Appliers
    @BelongsToMany(() => Appliers, {
        through: () => ApplierSkill,
        foreignKey: "skill_id",
        otherKey: "applier_id", 
        as: "appliers"
    })
    declare appliers: Appliers[];
}