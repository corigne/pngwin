import { Column, CreatedAt, DataType, ForeignKey, Model, AllowNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'timeouts', updatedAt: false })
export default class Timeout extends Model{

  @AllowNull(false)
  @PrimaryKey
  @Column(DataType.BIGINT)
  public user_id: bigint

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  public start_on: Date

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public length_min: bigint

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public mod_id: bigint

  @AllowNull(false)
  @Column(DataType.CHAR(400))
  public reason: string

}
