import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { Companies } from "./companies";
import { Experiences } from "./experiences";
import { JobPosts } from "./job_posts";

@Table({
    tableName: "recruiters",
    timestamps: false,
})
export class Recruiters extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare recruiter_id: string;

    @ForeignKey(() => Companies)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    declare company_id: string;

    @BelongsTo(() => Companies, {
        foreignKey: 'company_id',
        as: 'company'
    })
    
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare about: string | null;

    @HasMany(() => Experiences, {
        foreignKey: 'user_id',
        scope: {
            user_type: 'recruiter'
        },
        as: 'experiences'
    })
    declare experiences: Experiences[];

    //add has many relationship with job posts
    @HasMany(() => JobPosts, {
        foreignKey: 'recruiter_id',
        as: 'job_posts'
    })  
    declare job_posts?: JobPosts[];
}