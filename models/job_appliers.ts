import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { JobPosts } from "./job_posts";
import { Appliers } from "./appliers";

@Table({
    tableName: "job_appliers",
    timestamps: true,
})
export class JobAppliers extends Model {
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
        allowNull: false
    })
    declare id: number;

    @ForeignKey(() => JobPosts)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'job_id'
    })
    declare job_id: number;

    @BelongsTo(() => JobPosts, { foreignKey: 'job_id' })
    declare jobPost: JobPosts;

    @ForeignKey(() => Appliers)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'applier_id'
    })
    declare applier_id: number;

    @BelongsTo(() => Appliers, { foreignKey: 'applier_id' })
    declare applier: Appliers;

    @Column({
        type: DataType.ENUM('applied', 'interviewing', 'hired', 'rejected'),
        allowNull: false,
        defaultValue: 'applied'
    })
    declare status: 'applied' | 'interviewing' | 'hired' | 'rejected';

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    })
    declare createdAt: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    })
    declare updatedAt: Date;
}