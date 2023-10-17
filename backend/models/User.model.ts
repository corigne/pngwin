import { Column, CreatedAt, DataType, ForeignKey, Model, AllowNull, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import 'reflect-metadata';


@Table({ tableName: 'users' })
export default class User extends Model{

  @Unique
  @AllowNull(false)
  @PrimaryKey
  @Column(DataType.BIGINT)
  public user_id: bigint

  @AllowNull(false)
  @Column(DataType.CHAR(75))
  public email: string

  @AllowNull(false)
  @Column(DataType.CHAR(16))
  public username: string

  @AllowNull(false)
  @Column(DataType.SMALLINT)
  public role: number

  @CreatedAt
  @Column(DataType.DATE)
  public created_on: Date;

  @Column(DataType.BOOLEAN)
  public banned: Boolean

  @Column(DataType.JSON)
  public posts: JSON

  @Column(DataType.JSON)
  public collections: JSON

  @Column(DataType.CHAR(400))
  public descriptions: string

  @Column(DataType.JSON)
  public fav_tags: JSON

  @Column(DataType.CHAR(2048))
  public img_path: string

}
