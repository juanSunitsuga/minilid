import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Appliers } from "./appliers";
import { Recruiters } from "./recruiters";

@Table({
    tableName: "experiences",
    timestamps: false,
})
export class Experiences extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare experience_id: string;

    @ForeignKey(() => Appliers)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'user_id'
    })
    declare user_id: string;

    @Column({
        type: DataType.ENUM('applier', 'recruiter'),
        allowNull: false,
    })
    declare user_type: 'applier' | 'recruiter';

    @Column({
        type: DataType.STRING(30),
        allowNull: false,
    })
    declare company_name: string;

    @Column({
        type: DataType.STRING(30),
        allowNull: false,
    })
    declare job_title: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare start_date: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare end_date: Date | null;
    
    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string | null;

    // Associations based on user_type
    @BelongsTo(() => Appliers, {
        foreignKey: 'user_id',
        constraints: false,
        scope: {
            user_type: 'applier'
        }
    })
    declare applier?: Appliers;

    @BelongsTo(() => Recruiters, {
        foreignKey: 'user_id', 
        constraints: false,
        scope: {
            user_type: 'recruiter'
        }
    })
    declare recruiter?: Recruiters;

    // Helper method to get the associated user
    async getUser() {
        if (this.user_type === 'applier') {
            return await Appliers.findByPk(this.user_id);
        } else if (this.user_type === 'recruiter') {
            return await Recruiters.findByPk(this.user_id);
        }
        return null;
    }
}