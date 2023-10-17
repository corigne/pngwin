import { Column, DataType, ForeignKey, Model, NotNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';

@Table({ tableName: 'collections' })
export class Collection extends Model{

  @PrimaryKey
  @NotNull
  @Unique
  @Column
  public collection_id: bigint

  @NotNull
  @Column
  public author: bigint

  @Column
  public children: JSON

  @Column
  public votes: JSON

  @Column
  public score: bigint

  @NotNull
  @Column(DataType.CHAR(40))
  public name: string

  @NotNull
  @Column(DataType.CHAR(400))
  public description: string

  @NotNull
  @Column
  public tags: JSON

}
