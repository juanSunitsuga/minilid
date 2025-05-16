import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "companies",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Company extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    field: 'company_id'
  })
  declare company_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'company_name'
  })
  declare company_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'company_email'
  })
  declare company_email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare address: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare website: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'logo_url'
  })
  declare logo_url: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare description: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare industry: string | null;
}