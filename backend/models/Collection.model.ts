import { AllowNull, Column, DataType, Model,
  PrimaryKey, Table, Unique, CreatedAt } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'collections', updatedAt: false })
export default class Collection extends Model{

  @PrimaryKey
  @AllowNull(false)
  @Unique
  @Column(DataType.BIGINT)
  declare public id: bigint

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public author: bigint

  @Column(DataType.JSONB)
  public children: JSON

  @Column(DataType.JSONB)
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
  @Column(DataType.JSONB)
  public tags: JSON

  @CreatedAt
  @Column(DataType.DATE)
  public created_on: Date;
}
