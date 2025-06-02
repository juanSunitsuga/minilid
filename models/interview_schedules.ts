import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Recruiters } from "./recruiters";
import { JobPosts } from "./job_posts";
import { Appliers } from "./appliers";

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

    @ForeignKey(() => Recruiters)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'recruiter_id' // Keep field name the same for DB compatibility
    })
    declare recruiter_id: string;

    @BelongsTo(() => Recruiters, { foreignKey: 'recruiter_id', constraints: false })
    declare recruiter: Recruiters;
    
    @ForeignKey(() => Appliers)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'applier_id' // Keep field name the same for DB compatibility
    })
    declare applier_id: string;

    @BelongsTo(() => Appliers, { foreignKey: 'applier_id', constraints: false })
    declare applier: Appliers;

    @Column({
        type: DataType.ENUM('ACCEPTED', 'DECLINED', 'PENDING'),
        allowNull: false,
        defaultValue: 'PENDING'
    })
    declare status: 'ACCEPTED' | 'DECLINED' | 'PENDING';
}