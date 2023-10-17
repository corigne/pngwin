import { AllowNull, Column, DataType, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'collections' })
export default class Collection extends Model{

  @PrimaryKey
  @AllowNull(false)
  @Unique
  @Column(DataType.BIGINT)
  public collection_id: bigint

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public author: bigint

  @Column(DataType.JSON)
  public children: JSON

  @Column(DataType.JSON)
  public votes: JSON

  @Column(DataType.BIGINT)
  public score: bigint

  @AllowNull(false)
  @Column(DataType.CHAR(40))
  public name: string

  @AllowNull(false)
  @Column(DataType.CHAR(400))
  public description: string

  @AllowNull(false)
  @Column(DataType.JSON)
  public tags: JSON

}
