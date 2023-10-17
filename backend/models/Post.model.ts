import { Column, DataType, ForeignKey, Model, AllowNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'posts', updatedAt: false })
export default class Post extends Model{

  @Unique
  @AllowNull(false)
  @PrimaryKey
  @Column(DataType.BIGINT)
  declare public id: bigint

  @AllowNull(false)
  @Column(DataType.BIGINT)
  public author: bigint

  @AllowNull(false)
  @Column(DataType.JSON)
  public tags: JSON

  @AllowNull(false)
  @Column(DataType.CHAR(2048))
  public filepath: string

  @Column(DataType.JSON)
  public votes: JSON

  @Column(DataType.BIGINT)
  public score: bigint

  @Column(DataType.DATE)
  public created_on: Date;

}
