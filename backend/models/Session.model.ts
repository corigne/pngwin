import { Column, DataType, ForeignKey, Model, AllowNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';
import { UUID } from 'crypto';

@Table({ tableName: 'sessions' , updatedAt: false })
export default class Session extends Model{

  @PrimaryKey
  @Column(DataType.UUID)
  declare public id: UUID

  @AllowNull(false)
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
