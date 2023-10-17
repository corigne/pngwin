import { Column, DataType, ForeignKey, Model, NotNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'sessions' })
export class Session extends Model{

  @NotNull
  @PrimaryKey
  @Column
  public user_id: bigint

  @Column
  public token: JSON

  @NotNull
  @Column
  public valid: Boolean

  @NotNull
  @Column
  public pending: Boolean

  @NotNull
  @Column(DataType.CHAR(6))
  public otp: string

  @NotNull
  @Column
  public remembered: Boolean

}
