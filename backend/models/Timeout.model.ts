import { Column, CreatedAt, DataType, ForeignKey, Model, NotNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'timeouts' })
export class Timeout extends Model{

  @NotNull
  @PrimaryKey
  @Column
  public user_id: bigint

  @NotNull
  @CreatedAt
  @Column
  public start_on: Date

  @NotNull
  @Column
  public length: bigint

  @NotNull
  @Column
  public mod_id: bigint

  @NotNull
  @Column(DataType.CHAR(400))
  public reason: string

}
