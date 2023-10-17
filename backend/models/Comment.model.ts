import { Column, DataType, ForeignKey, Model, NotNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'comments' })
export class Comment extends Model{

  @NotNull
  @Column
  public image_id: bigint

  @NotNull
  @Column
  public author: bigint

  @NotNull
  @Column
  public index: number

  @NotNull
  @Column
  public created_on: Date;

  @NotNull
  @Column(DataType.CHAR(400))
  public content: string

}
