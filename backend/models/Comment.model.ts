import { Column, DataType, ForeignKey, Model, AllowNull,
  PrimaryKey, Table, Unique, CreatedAt } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'comments', updatedAt: false })
export default class Comment extends Model{

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public image_id: bigint

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public author: bigint

  @AllowNull(false)
  @Column(DataType.INTEGER)
  public index: number

  @CreatedAt
  @AllowNull(false)
  @Column(DataType.DATE)
  public created_on: Date;

  @AllowNull(false)
  @Column(DataType.CHAR(400))
  public content: string

}
