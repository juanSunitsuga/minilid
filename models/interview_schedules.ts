import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
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
}