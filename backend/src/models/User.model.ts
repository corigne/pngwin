import { Column, CreatedAt, DataType, ForeignKey, Model, AllowNull, PrimaryKey, Table, Unique, IsEmail, AutoIncrement } from 'sequelize-typescript';
import 'reflect-metadata';


@Table({ tableName: 'users', updatedAt: false })
export default class User extends Model{

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare public id: bigint

  @AllowNull(false)
  @Unique
  @IsEmail
  @Column(DataType.CHAR(75))
  public email: string

  @AllowNull(false)
  @Unique
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

  @Column(DataType.ARRAY(DataType.BIGINT))
  public posts: bigint[]

  @Column(DataType.ARRAY(DataType.BIGINT))
  public collections: bigint[]

  @Column(DataType.CHAR(400))
  public description: string

  @Column(DataType.ARRAY(DataType.TEXT))
  public fav_tags: string[]

  @Column(DataType.CHAR(2048))
  public img_path: string
}
