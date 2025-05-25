import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { JobAppliers } from "./job_applier";
import { Appliers } from "./appliers";
import { Recruiters } from "./recruiters";
import { Messages } from "./messages";

@Table({
    tableName: "chats",
    timestamps: false,
})
export class Chats extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare chat_id: string;

    @ForeignKey(() => JobAppliers)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare job_application_id: number;

    @BelongsTo(() => JobAppliers, { foreignKey: 'job_application_id' })
    declare jobApplication: JobAppliers;

    @ForeignKey(() => Appliers)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare applier_id: string;

    @BelongsTo(() => Appliers, { foreignKey: 'applier_id' })
    declare applier: Appliers;

    @ForeignKey(() => Recruiters)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare recruiter_id: string;

    @BelongsTo(() => Recruiters, { foreignKey: 'recruiter_id' })
    declare recruiter: Recruiters;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare last_message: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare created_at: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare updated_at: Date;

    @HasMany(() => Messages, { foreignKey: 'chat_id' })
    declare messages: Messages[];
}