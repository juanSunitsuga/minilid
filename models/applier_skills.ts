import { Table, Column, Model, ForeignKey, DataType } from "sequelize-typescript";
import { Appliers } from "./appliers";
import { Skills } from "./skills";

@Table({
    tableName: "applier_skill",
    timestamps: false,
})
export class ApplierSkill extends Model {
    @ForeignKey(() => Appliers)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataType.UUIDV4
    })
    declare applier_id: string;

    @ForeignKey(() => Skills)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
    })
    declare skill_id: number;
}