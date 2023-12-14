import { AllowNull, Column, DataType, Model,
  PrimaryKey, Table, Unique, CreatedAt } from 'sequelize-typescript';
import { BIGINT } from '@sequelize/core/types/dialects/abstract/data-types';

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

  @Column(DataType.ARRAY(DataType.BIGINT))
  public children: bigint[]

  @Column(DataType.ARRAY(DataType.BIGINT))
  public upvotes: bigint[]

  @Column(DataType.ARRAY(DataType.BIGINT))
  public downvotes: bigint[]

  @Column(DataType.BIGINT)
  public score: bigint

  @AllowNull(false)
  @Column(DataType.CHAR(40))
  public name: string

  @AllowNull(false)
  @Column(DataType.CHAR(400))
  public description: string

  @AllowNull(false)
  @Column(DataType.ARRAY(DataType.TEXT))
  public tags: string[]

  @CreatedAt
  @Column(DataType.DATE)
  public created_on: Date;
}
