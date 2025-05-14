import { Table, Column, Model, DataType } from "sequelize-typescript";

export enum UserType {
  APPLIER = 'applier',
  RECRUITER = 'recruiter'
}

@Table({
    tableName: "users",
    timestamps: false,
})
export class User extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        field: 'user_id'
    })
    declare user_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
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
        type: DataType.ENUM(...Object.values(UserType)),
        allowNull: false,
    })
    declare usertype: UserType;
}