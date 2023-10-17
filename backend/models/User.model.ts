import { Column, CreatedAt, DataType, ForeignKey, Model, NotNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';


@Table({ tableName: 'users' })
export class User extends Model{

  @Unique
  @NotNull
  @PrimaryKey
  @Column
  public user_id: bigint

  @NotNull
  @Column(DataType.CHAR(75))
  public email: string

  @NotNull
  @Column(DataType.CHAR(16))
  public username: string

  @NotNull
  @Column(DataType.SMALLINT)
  public role: number

  @Column
  @CreatedAt
  public created_on: Date;

  @Column
  public banned: Boolean

  @Column
  public posts: JSON

  @Column
  public collections: JSON

  @Column
  public descriptions: string

  @Column
  public fav_tags: JSON

  @Column(DataType.CHAR(2048))
  public img_path: string

}
