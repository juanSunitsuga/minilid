import { Table, Column, Model, DataType, BelongsToMany } from "sequelize-typescript";
import { Skills } from "./skills";
import { ApplierSkill } from "./applier_skills";

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
    
    @BelongsToMany(() => Skills, {
        through: () => ApplierSkill,
        foreignKey: "applier_id",
        otherKey: "skill_id",
        as: "skills"
    })
    declare skills: Skills[];
}
