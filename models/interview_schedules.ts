import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./users";
import { JobPosts } from "./job_posts";

@Table({
    tableName: "interview_schedules",
    timestamps: false,
})
export class InterviewSchedules extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare schedule_id: string;

    @ForeignKey(() => JobPosts)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare job_id: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare interview_date: Date;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare location: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'recruiter_id' // Keep field name the same for DB compatibility
    })
    declare recruiter_id: string;

    @BelongsTo(() => User, { foreignKey: 'recruiter_id', constraints: false })
    declare recruiter: User;
    
    // If you have applier_id as well:
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'applier_id' // Keep field name the same for DB compatibility
    })
    declare applier_id: string;

    @BelongsTo(() => User, { foreignKey: 'applier_id', constraints: false })
    declare applier: User;
}