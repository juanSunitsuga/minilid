import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { JobPosts } from "./job_posts";

@Table({
    tableName: "appliers",
    timestamps: false,
})
export class Appliers extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID
    })
    declare applier_id: string;

    @ForeignKey(() => JobPosts)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare job_id: string;

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
        allowNull: true,
    })
    declare resume: string;
}