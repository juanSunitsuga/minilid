import { Table, Column, Model, DataType, BelongsToMany, HasMany } from "sequelize-typescript";
import { Skills } from "./skills";
import { ApplierSkill } from "./applier_skill";
import { Experiences } from "./experiences";

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
        type: DataType.STRING(30),
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING(30),
        allowNull: false,
        unique: true
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
    
    // Many-to-Many relationship with Skills through ApplierSkill junction table
    @BelongsToMany(() => Skills, {
        through: () => ApplierSkill,
        foreignKey: "applier_id",
        otherKey: "skill_id",
        as: "skills"
    })
    declare skills: Skills[];

    // One-to-Many relationship with Experiences
    @HasMany(() => Experiences, {
        foreignKey: 'user_id',
        scope: {
            user_type: 'applier'
        },
        as: 'experiences'
    })
    declare experiences: Experiences[];

}