import { Column, DataType, ForeignKey, Model, AllowNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'sessions' })
export default class Session extends Model{

  @AllowNull(false)
  @PrimaryKey
  @Column(DataType.BIGINT)
  public user_id: bigint

  @Column(DataType.JSON)
  public token: JSON

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  public valid: Boolean

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  public pending: Boolean

  @AllowNull(false)
  @Column(DataType.CHAR(6))
  public otp: string

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  public remembered: Boolean

}
