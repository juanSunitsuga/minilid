import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "recruiters",
  timestamps: false,
})
export class Recruiters extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    field: 'recruiter_id'
  })
  declare recruiter_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
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
    allowNull: false
  })
  declare password: string;
}