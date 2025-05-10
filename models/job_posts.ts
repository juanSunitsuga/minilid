import { Table, Column, Model, DataType, ForeignKey, HasMany } from "sequelize-typescript";
import { JobCategories } from "./job_categories";
import { JobTypes } from "./job_types";
import { Skills } from "./skills";

@Table({
    tableName: "job_posts",
    timestamps: false,
})
export class JobPosts extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
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

    @ForeignKey(() => JobCategories)
    @Column({ 
        type: DataType.INTEGER,
        allowNull: false
    })
    declare JobCategories: string;

    @ForeignKey(() => JobTypes)
    @Column({ 
        type: DataType.INTEGER,
        allowNull: false
    })
    declare JobTypes: string;

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

    @HasMany(() => Skills, {
        foreignKey: "job_id",
    })
    declare skills: Skills[];
}