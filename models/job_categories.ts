import { Table, Column, Model, DataType, HasMany} from "sequelize-typescript";
import { JobPosts } from "./job_posts";

@Table({
    tableName: "job_categories",
    timestamps: false,
})
export class JobCategories extends Model {
    @Column({
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
    })
    declare category_id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare category_name: string;

    @HasMany(() => JobPosts)
    declare job_posts: JobPosts[];
}