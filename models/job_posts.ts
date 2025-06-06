import { Table, Column, Model, DataType, ForeignKey, BelongsToMany, BelongsTo } from "sequelize-typescript";
import { JobCategories } from "./job_categories";
import { JobTypes } from "./job_types";
import { Skills } from "./skills";
import { JobPostSkill } from "./job_post_skills";
import { Recruiters } from "./recruiters";

@Table({
    tableName: "job_posts",
    timestamps: false,
})
export class JobPosts extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
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

    // Tambahkan BelongsTo untuk category
    @BelongsTo(() => JobCategories)
    declare category: JobCategories;

    // Tambahkan BelongsTo untuk type
    @BelongsTo(() => JobTypes)
    declare type: JobTypes;

    @BelongsTo(() => Recruiters)
    declare recruiter: Recruiters;

    @ForeignKey(() => JobCategories)
    @Column({ 
        type: DataType.INTEGER,
        allowNull: false
    })
    declare category_id: number;

    @ForeignKey(() => JobTypes)
    @Column({ 
        type: DataType.INTEGER,
        allowNull: false
    })
    declare type_id: number;

    @Column({ 
        type: DataType.INTEGER,
        allowNull: false
    })
    declare salary_min: number;

    @Column({ 
        type: DataType.INTEGER,
        allowNull: false
    })
    declare salary_max: number;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare salary_type: string;

    @ForeignKey(() => Recruiters)
    @Column({ 
        type: DataType.UUID,
        allowNull: false
    })
    declare recruiter_id: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare posted_date: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare edit_date: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare deleted: boolean;

    @BelongsToMany(() => Skills, () => JobPostSkill)
    declare skills: Skills[];
}