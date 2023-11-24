import { Column, DataType, ForeignKey, Model, AllowNull,
  PrimaryKey, Table, Unique, CreatedAt, AutoIncrement } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'posts', updatedAt: false })
export default class Post extends Model{

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare public id: bigint

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public author: bigint

  @AllowNull(false)
  @Column(DataType.JSON)
  public tags: JSON

  @Column(DataType.CHAR(2048))
  public filepath: string

  @Column(DataType.JSON)
  public votes: JSON

  @Column(DataType.BIGINT)
  public score: bigint

  @CreatedAt
  @Column(DataType.DATE)
  public date_created: Date;

}
