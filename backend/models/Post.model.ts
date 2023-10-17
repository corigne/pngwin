import { Column, DataType, ForeignKey, Model, NotNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'posts' })
export class Post extends Model{

  @Unique
  @NotNull
  @PrimaryKey
  @Column
  public post_id: bigint

  @NotNull
  @Column
  public author: bigint

  @NotNull
  @Column
  public tags: JSON

  @NotNull
  @Column(DataType.CHAR(2048))
  public filepath: string

  @Column
  public votes: JSON

  @Column
  public score: bigint

  @Column
  public created_on: Date;

}
