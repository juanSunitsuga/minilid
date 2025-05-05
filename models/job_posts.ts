import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "job_posts",
    timestamps: false,
})
export class JobPosts extends Model {
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
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

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    declare posted_date: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare deleted: boolean;
}