import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from "sequelize-typescript";
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
    })
    declare applier_id: string;

    @ForeignKey(() => Skills)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
    })
    declare skill_id: number;

    // Add BelongsTo associations for proper includes in queries
    @BelongsTo(() => Appliers)
    declare Applier: Appliers;

    @BelongsTo(() => Skills)
    declare Skill: Skills;

}