import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Skills } from "./skills";

@Table({
    tableName: "appliers",
    timestamps: false,
})
export class Appliers extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare applier_id: string;

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
        allowNull: false,
    })
    declare password: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare about: string | null;
    
    @HasMany(() => Skills, {
        foreignKey: "job_id",
    })
    declare skills: Skills[];
}
