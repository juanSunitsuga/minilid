import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Experiences } from "./experiences";
import { JobPosts } from "./job_posts";
import { InterviewSchedules } from "./interview_schedules";

export enum UserType {
  APPLIER = 'applier',
  RECRUITER = 'recruiter'
}

@Table({
    tableName: "users",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
})
export class User extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        field: 'user_id'
    })
    declare user_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;
    
    @Column({
        type: DataType.ENUM(...Object.values(UserType)),
        allowNull: false,
    })
    declare usertype: UserType;

    @HasMany(() => Experiences, { foreignKey: 'user_id' })
    declare experiences: Experiences[];

    @HasMany(() => JobPosts, { foreignKey: 'recruiter_id' })
    declare job_posts: JobPosts[];

    @HasMany(() => InterviewSchedules, { foreignKey: 'recruiter_id' })
    declare recruiter_interviews: InterviewSchedules[];

    @HasMany(() => InterviewSchedules, { foreignKey: 'applier_id' })
    declare applier_interviews: InterviewSchedules[];

    // Add other associations as needed...
}