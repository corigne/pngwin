// express imports
import express, { NextFunction, Request, Response} from 'express'
import cors from 'cors'
import fileUpload, { UploadedFile } from 'express-fileupload'

// general npm imports
import * as dotenv from 'dotenv'
import fs from 'fs'
import Sharp from 'sharp'

// sequelize imports for postgresql
import { Sequelize } from 'sequelize-typescript'
import { Op } from '@sequelize/core'
import User from './models/User.model'
import Session from './models/Session.model'
import Timeout from './models/Timeout.model'
import Post from './models/Post.model'
import Collection from './models/Collection.model'

// nodemailer and email-templates stuff
import { createTransport } from 'nodemailer'
import Email from 'email-templates'

// jwt imports
import {Jwks, JwksKey} from './types'
import { v4 as uuidv4, validate as validateUUID } from 'uuid'
const jwt = require('jsonwebtoken')

// Express Setup
const app = express()
const port = 3000
dotenv.config()
app.use(express.json())
app.use(cors())
app.use(fileUpload({
  useTempFiles: false,
  tempFileDir: 'tmp/'
}))

// Nodemailer Transport Setup
var transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASS
  }
})
// Email-templates Connected To Nodemailer
const email_message = new Email({
  views: {
    root: 'src/emails/',
  },
  message: {
    from: process.env.GMAIL
  },
  send: true,
  transport: transporter,
  preview: false
})

// Sequelize Setup
const sequelize = new Sequelize({
  database: 'pngwin_dev',
  dialect: 'postgres',
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  storage: ':memory:',
  models: [__dirname + '/models'], // or [Player, Team],
})

// JWT Setup
const privateKey = process.env.RSA_PRIV_KEY
const pub = process.env.RSA_PUB_KEY

// App Environment Setup
const badwords: Array<string> = fs.readFileSync('blocklist.txt')
  .toString('utf-8')
  .split(/[,\s]/)
  .filter(Boolean)
console.log('Blocklist parsed:\n', badwords)

///////////////////
// Helper Functions
// Internal to API

const check_user_ban = async (username: string,) => {
  const user = await User.findOne({
    attributes: ['id','banned'],
    where: { username: username }
  })
  if (!user) {
    throw new Error("User not found")
  }
  const data = user.get({ plain: true })
  return data.banned ? true : false
}

const check_user_timeout = async (username: string,) => {
  const user = await User.findOne({
    attributes: ['id'],
    where: { username: username}
  })
  if (!user) {
    throw new Error("User not found")
  }
  const data = user.get({ plain: true })
  //query timeout table for id
  const timeouts = await Timeout.findAll({
    attributes: ['start_on', 'length_min'],
    where: { user_id: data.id}
  })
  //for each timeout, check if it is expired
  let most_recent = new Date(0)
  let most_recent_length = 0
  timeouts.forEach(timeout => {
    if(timeout.dataValues.start_on > most_recent) {
      most_recent = timeout.dataValues.start_on
      most_recent_length = timeout.dataValues.length_min
    }
  })
  //convert to unix time
  let most_recent_unix = most_recent.getTime()
  //add length in minutes
  most_recent_unix += most_recent_length * 60000
  //compare to current time
  if(most_recent_unix > Date.now()) {
    return true
  } else {
    return false
  }

}

// creates a new user session to be validated in the database
const create_session = async (in_user_id: number, is_remembered?: boolean) => {

  // Just checks for empty fields.
  if ( in_user_id == null ) {
    var missing: string = ""
    missing += (in_user_id) ? " " : "user_id "
    throw new Error("Missing Parameters:" + missing)
  }

  const user_id_exists: User|null = (await User.findOne({where: {id: in_user_id}}))
  //console.log(user_id_exists)
  if ( !user_id_exists ) {
    throw new Error("Provided user_id doesn't exist")
  }

  const email = user_id_exists.dataValues.email
  const username = user_id_exists.dataValues.username

  // Create a 6 digit OTP string and session_id
  const newOTP: string = Math.floor(100000 + Math.random() * 900000 ).toString()
  const new_session_id : string = uuidv4()

  // attempt to create a session in the database
  const session = new Session({
    user_id: in_user_id,
    token: null,
    valid: false,
    pending: true,
    otp: newOTP,
    remembered: is_remembered ?? false,
    session_id: new_session_id,
  })

  if ( !(session instanceof Session) ) {
    throw new Error("Unable to create session, unable to create model.")
  }

  try{
    await session.save()
  }
  catch(err: any){
    throw new Error("Unable to create session:" + err.toString())
  }

  try{
    console.log(`Sending OTP to...\n User: ${username}\n Email: ${email}`)
    await email_message.send({
      template: 'otp',
      message: {
        to: email
      },
      locals: {
        confirmation_code: newOTP,
        username: username
      }
    })
  }
  catch(err: any){
    console.log(err.toString())
    await Session.destroy({where: {session_id: new_session_id}})
    throw new Error("Unable to send verification email.")
  }
  // only runs if email sent successfully
  return new_session_id
}

const delete_image = async (imgPath: string, postID: bigint) => {
  try{
    fs.rmSync(`${imgPath}/prev/${postID}.png`)
    fs.rmSync(`${imgPath}/${postID}.png`)
    return true
  }
  catch(err){
      throw new Error("Filesystem error:" + err)
  }
}

const delete_session = async (session_id: string) => {

  if ( !validateUUID(session_id) ){
    throw new Error("Error: Session id is not valid uuid.")
  }

  const session = await Session.findByPk(session_id)

  if (!session) {
    throw new Error("Error: Session id not found.")
  }

  try{
    await session.destroy()
  }
  catch(err){
    throw new Error(`Database error, session could not be deleted... ${err}`)
  }
}

const getImagePathByID = (imageID: bigint) => {
  if(!imageID){
    throw new Error("Image ID not provided.")
  }
  if(isNaN(Number(imageID))){
    throw new Error("Image ID not a number.")
  }
  // Basic bucket sort by image ID
  return `data/images/${Math.floor(Number(imageID)/4096)}`
}

const issue_JWT =  async (userid: number, session_id: string, length_days: number) => {
  const user = await User.findOne({
    attributes: ['role'],
    where : {id: userid}
  })
  if (!user) {
    throw new Error("User not found")
  }
  const data = user.get({ plain: true })
  const token = jwt.sign({ userid: userid, session_id: session_id, role: data.role },
  privateKey , { expiresIn: length_days + 'd', algorithm: "RS256" })
  return token
}

const storeNewImage = async (imgFile: UploadedFile, imgID: bigint) => {

  if(!imgFile){
    throw new Error("No file provided.")
  }

  let sharpImage = Sharp(imgFile.data)

  let thumbnail: Buffer
  let imgPath: string = ""

  try {
    // thumbnail = await imageThumbnail(imgFile.data)
    thumbnail = await sharpImage.resize(1280,720,{withoutEnlargement:true})
      .png().toBuffer()

  } catch (err) {
    console.error(err)
    throw new Error("Error creating thumbnail:" + err)
  }

  try {
    imgPath = getImagePathByID(imgID)
  }
  catch (err){
    console.log("Image path error:" + err)
    throw err
  }

  const thumb_path: string = `${imgPath}/prev`

  if(!fs.existsSync(imgPath)){
    try{
      fs.mkdirSync(imgPath, {recursive: true})
    }
    catch(err){
      throw new Error("Mkdir image path error:" + err)
    }
  }
  if(!fs.existsSync(thumb_path)){
    try{
      fs.mkdirSync(thumb_path, {recursive: true})
    }
    catch(err){
      throw new Error("Mkdir image path error:" + err)
    }
  }

  const fileName = `${imgID}.png`

  try {
    fs.writeFileSync(`${thumb_path}/${fileName}`, thumbnail)
    fs.writeFileSync(`${imgPath}/${fileName}`, imgFile.data)
  }
  catch (err){
    throw new Error("Write file error:" + err)
  }

  return imgPath
}

const verify_JWT = async (token: JSON) => {
  return await jwt.verify(token, pub, (err: Error, payload: object) => {
    if(err) {
      return false
    }
    return true
  })
}

// the auth middleware function
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers['authorization']
  if(typeof bearerHeader !== 'undefined'){

    const bearer = bearerHeader.split(' ');
    const token = bearer[1]
    req.token = token
    next()
  } else {
    res.sendStatus(403)
  }
}

/////////////////////////////////
// API Endpoints ////////////////
// External Facing API Functions

app.get('/api', async (req: Request, res: Response) => {
  let date: Date = new Date()
  return res.json({"pong": date})
})


app.post('/api/createUser', async (req: Request, res: Response) => {

  const {body} = req
  if (!body.email || !body.username) {
    var missing: string = ""
    missing += (body.email) ? " " : "email, "
    missing += (body.username) ? " " : "username"
    return res.status(418).json({
      user_created: false,
      reason: "User missing required fields:" + missing
    })
  }

  // verify user doesn't already exist, return Error "user already exists" if exists
  const existing_user = await User.findOne({
    where:{
      username: body.username
    }
  })

  if (existing_user){
    // console.log(existing_user)
    return res.status(418).json({
      user_created: false,
      reason: "User already exists with that username."
    })
  }

  // create new user
  const new_email: String = body.email
  const new_username: String = body.username
  const permissions_role: number = 0

  const user = new User({
    username: new_username,
    email: new_email,
    role: permissions_role,
    banned: false
  })

  if ( !(user instanceof User) )
    return res.status(400).json({
      user_created: false,
      reason: "Invalid username or email."
    })

  try{
    await user.save()
  }
  catch(err: any){
    return res.status(500).json({
      user_created: false,
      reason: "Database error."
    })
  }

  return res.status(200).json({
    user_created: true,
    "new_user": user
  })
})

// delete image route
// inputs: token: jwt string, postID
// outputs: status of image post deletion
app.delete('/api/deleteImage', async (req: Request, res: Response) => {

  const params = req.query

  if(!params.token){
    return res.status(401).json({
      deleted: false,
      error: "JWT not provided."
    })
  }

  let token

  try{
    token = await jwt.verify(params.token, pub)
  }
  catch(err){
    return res.status(400).json({
      post_created: false,
      reason:"Invalid JWT",
      error: err
    })
  }

  if(!params.postID || typeof params.postID !== 'string'){
    return res.status(401).json({
      deleted: false,
      error: "ImageID not provided or is not a string."
    })
  }

  const postID:bigint= BigInt(params.postID)

  const post: Post|null = await Post.findByPk(postID)

  if(!post){
    return res.status(401).json({
      deleted: false,
      error: "Post with provided imageID does not exist."
    })
  }

  const isAuthor:boolean = post.dataValues.author === token.userid
  const isModerator:boolean = token.role > 0
  if(!isAuthor && !isModerator){
    return res.status(401).json({
      deleted: false,
      error: "Not authorized to delete this post, not author or moderator."
    })
  }

  const imgPath = getImagePathByID(BigInt(postID))

  try{
    post.destroy()
  }
  catch(err){
    return res.status(500).json({
      deleted: false,
      error: "Database error:" + err
    })
  }

  const collections:Collection[]|null = await Collection.findAll({
    where: {
      'children' : {[Op.contains]: [BigInt(postID)]}
    }
  })

  if(collections.length !== 0){
    try{
      collections.forEach(collection => {
        collection.update({
          children: collection.children.filter(id => id !== postID)
        })
      })
    }
    catch(err){
      return res.status(500).json({
        deleted: false,
        error: "Database error:" + err
      })
    }
  }

  try{
    delete_image(imgPath, postID)
  }
  catch(err){
    return res.status(500).json({
      deleted: false,
      error: err
    })
  }

  // return deleted
  return res.status(200).json({
    deleted: true,
    error: null
  })
})

// Get a single image's blob data
// by default return the image blob from the server storage, 720p or less
// optional input fullsize returns instead a blob of full image size
// input: imageID: number
// output: success: bool, buffer: buffer, error: string
app.get('/api/getImage', async (req: Request, res: Response) => {

  const {query} = req

  if (!query.imageID) {
    return res.status(418).json({
      success: false,
      buffer: null,
      error: "No imageID provided."
    })
  }

  const imageID:bigint = BigInt(query.imageID as string)

  let fullsize = (query.fullsize)? query.fullsize : false
  let image_buffer = null
  let filepath = getImagePathByID(imageID)

  try{
  if(fullsize){
    image_buffer = fs.readFileSync(`${filepath}/${imageID}.png`)
  }

  image_buffer = fs.readFileSync(`${filepath}/prev/${imageID}.png`)
  }
  catch(err){
    return res.status(500).json({
      success: false,
      buffer: null,
      error: "FS Read error: " + err
    })
  }

  return res.status(200).json({
    success: true,
    buffer: image_buffer,
    error: null
  })

})
// Get a single image's relevant row information from the database by imgID
// inputs: imageID: string, fullsize: boolean
// outputs: success: bool, image: json, error: string
app.get('/api/getPost', async (req: Request, res: Response) => {

  const {query} = req

  if (!query.imageID) {
    return res.status(418).json({
      success: false,
      post: null,
      error: "No imageID provided."
    })
  }

  const imageID:bigint = BigInt(query.imageID as string)

  const post = await Post.findByPk(imageID, {
    attributes: [ "id", "author", "tags", "score", "date_created" ]
  })

  if(!post){
    return res.status(500).json({
      success: false,
      post: null,
      error: `Image with id:${imageID} not found.`
    })
  }

  return res.status(200).json({
    success: true,
    post: post,
    error: null
  })
})

// api endpoint to get the current user's vote for a specific image
// input token: string, postID: number
// output liked: bool, disliked: bool, error: string
// TODO: generalize the vote code
app.get('/api/getVoted', verifyToken, async (req: Request, res: Response) => {

  const {query} = req

  if(!query.postID) {
    return res.status(400).json({
      liked: null,
      disliked: null,
      error: "No postID in query string."
    })
  }

  if(!req.token) {
    return res.status(400).json({
      liked: null,
      disliked: null,
      error: "No token in request body."
    })
  }

  let valid = await jwt.verify(req.token, pub)

  if(!valid) {
    return res.status(403).json({
      liked: null,
      disliked: null,
      error: "No token in request body."
    })
  }

  const {userid} = jwt.decode(req.token)
  const postID:bigint = BigInt(query.postID as string)
  const post = await Post.findByPk(postID)

  if(!post){
    return res.status(500).json({
      liked: null,
      disliked: null,
      error: `Post with id:${postID} was not found.`
    })
  }

  const up = post.get('upvotes')
  const down = post.get('downvotes')

  const liked: Boolean = (up) ? up.includes(userid) : false
  const disliked: Boolean = (down) ? down.includes(userid) : false

  return res.status(200).json({ liked: liked, disliked: disliked })

})

// login route
// inputs: username: string, (optional) jwt: string, (optional bool) remembered: boolean
app.post('/api/login', async (req: Request, res: Response) => {
  const {body} = req
  if (body.jwt) {
    let valid = await verify_JWT(JSON.parse(JSON.stringify(body.jwt)))
    const payload = jwt.decode(body.jwt, {complete: true})
    if(valid)
    {
      if(!body.username) {
        return res.status(418).json({
          login: false,
          otp_required: false,
          session_id: null,
          error: "Username not provided"
        })
      }
      let ban =  await check_user_ban(body.username)
      let timeout = await check_user_timeout(body.username)
      if(ban) {
        return res.status(200).json({
          login: false,
          otp_required: false,
          session_id: null,
          error: "User is banned"
        })
      }
      if(timeout) {
        return res.status(200).json({
          login: false,
          otp_required: false,
          session_id: null,
          error: "User is timed out"
        })
      }
      return res.status(200).json({
        login: true,
        otp_required: false,
        session_id: payload.payload.session_id,
        error: "No error, JWT is valid"
      })
    }
    else
    {
      return res.status(401).json({
        login: false,
        otp_required: false,
        session_id: null,
        error: "Invalid JWT"
      })
    }
  }
  // if no jwt included, new login, create a new session
  else
  {
    const username = body.username
    if (!username) {
      return res.status(418).json({
        login: false,
        otp_required: false,
        session_id: null,
        error: "Username not provided"
      })
    }
    const ban =  await check_user_ban(username)
    const timeout = await check_user_timeout(username)
    if(ban) {
      return res.status(200).json({
        login: false,
        otp_required: false,
        session_id: null,
        error: "User is banned"
      })
    }
    if(timeout) {
      return res.status(200).json({
        login: false,
        otp_required: false,
        session_id: null,
        error: "User is timed out"
      })
    }

    const user = await User.findOne({
      attributes: ['id'],
      where: { username: username }
    })
    if(!user) {
      return res.status(200).json({
        login: false,
        otp_required: false,
        session_id: null,
        error: "User not found"
      })
    }
    const data = user.get({ plain: true })

    try{
      return await create_session(data.id, body.remembered)
      .then((session_id) => {
        return res.status(200).json({
          login: true,
          otp_required: true,
          session_id: session_id,
          error: "No error, OTP required"
        })
      })
    }
    catch(err: any){
      console.error("Unable to create session:", err)
      return res.status(500).json({
        login: false,
        otp_required: false,
        session_id: null,
        error: err.toString()
      })
    }

  }
})

// logout route
// inputs: jwt
app.delete('/api/logout', async (req: Request, res: Response) => {
  const body = req.body

  // check for jwt in request
  if (!body.jwt){
    return res.status(418).json({
      logged_out: false,
      reason: "Error: no jwt provided."
    })
  }

  const authenticated: boolean = await verify_JWT(body.jwt)

  // if JWT is valid invalidate session under session_id
  if(!authenticated){
    return res.status(401).json({logout:false, reason:"Invalid JWT"})
  }

  // if session_id is invalidated, return success
  const payload: any = jwt.decode(body.jwt)

  await delete_session(payload.session_id)
  .then(() => res.status(200).json({logout:true}))
  .catch((err:any) => res.status(500).json({logout:false, error:err}))
})

// no filetype checking, expects infile already validated as png
app.post('/api/postImage', async (req: Request, res: Response) => {

  const body = req.body

  // verify JWT exists
  if(!body?.token){
    return res.status(400).json({post_created: false, reason:"No JWT"})
  }

  let token

  try{
    token = await jwt.verify(body.token, pub)
  }
  catch(err){
    return res.status(400).json({
      post_created: false,
      reason:"Invalid JWT",
      error: err
    })
  }

  if(req?.files?.image){

    const post = new Post({
      author: token.userid,
      tags: JSON.parse(body.tags),
      upvotes: [token.userid],
      downvotes: [],
      score: 1
    })

    try{
      await post.save()
    }
    catch(err: any){
      return res.status(500).json({
        post_created: false,
        reason: "Database error.",
        err: err.toString()
      })
    }

    const img: UploadedFile = req.files.image as UploadedFile
    let imgPath: string

    try{
      imgPath = await storeNewImage(img, post.id)
    }
    catch(err){
      try{
        await post.destroy()
      }
      catch(err){
        console.log("Error cleaning up bad POST:" + err)
      }

      return res.status(500).json({
        postSucess: false,
        post: null,
        error: "Database error:" + err
      })
    }

    try{
      await post.update({
        filepath: imgPath
      })

      const user = await User.findByPk(token.userid)

      if(!user){
        throw new Error("Unable to add post to user.")
      }

      const user_posts = user.get('posts')

      if (!user_posts){
        await user.update({
          posts: [post.id]
        })
      }
      else{
        const new_posts = [... user_posts, post.get("id")]
        await user.update({
          posts: new_posts
        })
      }
    }
    catch(err){
      try{
        await delete_image(imgPath, post.id)
        await post.destroy()
      }
      catch(err){
        console.log("Error cleaning up bad POST:" + err)
      }
      return res.status(500).json({
        postSucess: false,
        post: null,
        error: "Post creation error:" + err
      })
    }

    return res.status(200).json({postSucess: true, post: post})
  }
  return res.status(400).json({error: "No file sent."})

})

// Search api endpoint
// Takes in a page # and optional taglist and returns a list of posts which
// match the taglist (or all posts if no taglist), paginated by the page number
// by default will return only 25 at a time.
// TODO add variable pagination (25, 50, 100 posts etc)
app.get('/api/search', async (req: Request, res: Response) => {

  const {query} = req

  const limit:number = 20 // TODO page size
  const offset:number = (query.pageNumber) ? (Number(query.pageNumber) - 1) * limit : 0

  console.log(`Taglist searched: ${query.tags}`)

  try{
    if(!query.tags){
      // most recent 25 posts
      const posts = await Post.findAll({
        order: [['date_created', 'DESC']],
        limit,
        offset
      })

      return res.status(200).json({
        posts: posts,
        error: null
      })
    }

    // search for posts with all tags by date
    const taglist = query.tags.toString().split(',')

    const posts = await Post.findAll({
      where: {
        tags: {
          [Op.contains]: taglist,
        }
      },
      order: [['date_created', 'DESC']],
      limit,
      offset
    })

    return res.status(200).json({
      posts: posts,
      error: null
    })
  }
  catch(err){
    return res.status(500).json({
      posts: null,
      error: 'Database error:' + err
    })
  }
})

app.post('/testFileUpload', async (req: Request, res: Response) => {

  if(req?.files?.image){
    const img: UploadedFile = req.files.image as UploadedFile
    await img.mv('tmp/test.png')
    const img_buffer = fs.readFileSync('tmp/test.png')
    res.setHeader('Content-Type', 'image/png')
    return res.send(img_buffer)
  }
  return res.status(400).json({error: "No file sent."})

})

app.post('/testSession', async (req: Request, res: Response) => {
  var session_id: string = ""

  const {body} = req
  if(!body.user_id){
    return res.status(400).json({
      session_created: false,
      reason: "Missing user_id."
    })
  }

  await create_session(body.user_id, body?.remembered)
  .then((session_id) => {
    res.status(200).json({session_created: true, session_id: session_id})
  })
  .catch((err) => {
    res.status(400).json({session_created: false, reason: err.toString()})
  })

})

app.post('/testTimeout', async (req: Request, res: Response) => {
  const {body} = req
  if(!body.user_id){
    return res.status(400).json({
      timeout_created: false,
      reason: "Missing user_id."
    })
  }
  if(!body.length_min){
    return res.status(400).json({
      timeout_created: false,
      reason: "Missing length."
    })
  }
  if(!body.mod_id){
    return res.status(400).json({
      timeout_created: false,
      reason: "Missing mod_id."
    })
  }
  if(!body.reason){
    return res.status(400).json({
      timeout_created: false,
      reason: "Missing reason."
    })
  }

  const user_id = body.user_id
  const length = body.length_min
  const mod_id = body.mod_id
  const reason = body.reason

  const timeout = new Timeout({
    user_id: user_id,
    start_on: new Date(),
    length_min: length,
    mod_id: mod_id,
    reason: reason
  })

  if ( !(timeout instanceof Timeout) )
    return res.status(400).json({
      timeout_created: false,
      reason: "Invalid timeout."
    })

  try{
    await timeout.save()
  }
  catch(err: any){
    return res.status(500).json({
      timeout_created: false,
      reason: "Database error: " + err.toString()
    })
  }

  return res.status(200).json({
    timeout_created: true,
    "new_timeout": timeout
  })
})

app.get('/testToken', async (req: Request, res: Response) => {

  if(!req.query.token){
    return res.status(418).json({
      valid: false,
      status: "No JWT provided for validation.",
    })
  }

  let token
  try{
    token = await jwt.verify(req.query.token, pub)
  }
  catch(err){
    return res.status(401).json({
      valid: false,
      status: "Error, invalid JWT:" + err
    })
  }

  console.log(token)
  return res.status(200).json({
    valid: true,
    status: "Valid token."
  })
})

app.post('/testJWT', async (req: Request, res: Response) => {
  const {body} = req
  let token = await issue_JWT(body.userid, body.session_id, body.length_days)
  return res.json({jwt: token})
})

app.get('/api/userID', async (req: Request, res: Response) => {
  if("username" in req.query ){

    const username: string | undefined = req.query.username?.toString()

    if(!username){
      return res.status(418).json({
        user_exists: false,
        username: null,
        error: `Error: Field "username" is not defined in the query.`
      })
    }

    const user = await User.findOne({
      attributes: ['id'],
      where: { username: username }
    })
    .then((user) => {
      if(user === null){
        // Catches user DNE
        return res.status(200).json({
          user_exists: false,
          username: null,
          error: `User with username '${username}' does not exist.`
        })
      }

      const userdata = user.get({plain:true})
      return res.json({user_id: userdata.id})

    })
    .catch((err: any) => {
      console.log("ERROR:" + err.toString())
      // Catches database errors.
      return res.status(500).json({
        user_exists: null,
        username: null,
        error: err.toString()
      })
    })

  }
  else{
    return res.status(418).json({
      user_exists: false,
      username: null,
      error: `No username provided.`
    })
  }
})

// verifies login session for a user
// a new login attempt will be required for expired OTP
app.post('/api/verifyOTP', async (req: Request, res: Response) => {

  const {body} = req

  if (!body.OTP || !body.session_id) {
    var missing: string = ""
    missing += (body.OTP) ? " " : "OTP, "
    missing += (body.session_id) ? " " : "session_id "
    return res.status(418).json({
      session_verified: false,
      reason: "Missing:" + missing
    })
  }

  const OTP = body.OTP
  const session_id = body.session_id
  const session = await Session.findOne({
    where:{
      session_id: session_id
    }
  })

  if (!session){
    return res.status(400).json({
      verified: false,
      token: null,
      reason: "Session not found."
    })
  }

  if(session?.dataValues.pending === false){
    return res.status(401).json({
      verified: false,
      token: null,
      reason: "Session is already verified or expired."
    })
  }

  if(OTP === session?.dataValues.otp){
    console.log("OTP Matched")

    var created: Date = new Date(session?.dataValues.created_on.toString())

    const elapsed_min: number = (Date.now() - created.getTime()) /1000/60
    console.log(`Elapsed time in min: ${elapsed_min}`)

    // Check for expired OTP Session
    if (elapsed_min > 5){
      // return an Error stating the OTP has expired
      return res.status(401).json({
        verified: false, token: null, reason: "OTP Expired"
      })
    }

    else{
      // generate the jwt and store it in the session
      const jwt_result: string|Error = await issue_JWT(
          session.dataValues.user_id,
          session.dataValues.session_id,
          (session.dataValues.remembered) ? 30 : 1
        )

      if(jwt_result instanceof Error){
        return res.status(500).json({
          verified: false,
          token: null,
          reason: "Server Issue JWT Error: ",
          error: jwt_result
        })
      }

      console.log(jwt_result)

      try{
        session.set({
          pending : false,
          valid : true,
          token : jwt_result,
        })
        session.save()
        .then((result) => {
          console.log(result)
          return res.status(200).json(result)
        })
      }
      catch(err: any){
        console.log("Database Error:" + err.toString())
        return res.status(500).json(err)
      }
    }
  }
  else{
    console.log("OTP Did Not Match")
    return res.status(418).json({
      verified: false, token: null, reason: "Invalid OTP"
    })
  }
})

// api endpoint for upvoting or downvoting a post
// input postID: bigint/number, vote: number
// 1 = liked, -1 = disliked, 0 = the votes will be reset
// output success: boolean, error: string
// TODO: generalize the vote code
app.post('/api/vote', verifyToken, async (req: Request, res: Response) => {

  const {body} = req

  if(!body.postID) {
    return res.status(400).json({
      success: false,
      error: "No postID in query string."
    })
  }

  if(!req.token) {
    return res.status(400).json({
      success: false,
      error: "No token in request body."
    })
  }

  let valid = await jwt.verify(req.token, pub)

  if(!valid) {
    return res.status(403).json({
      success: false,
      error: "No token in request body."
    })
  }

  const userid:bigint = BigInt(jwt.decode(req.token).userid)
  const postID:bigint = BigInt(body.postID as string)

  const post = await Post.findByPk(postID)

  if(!post){
    return res.status(500).json({
      success: false,
      error: `Post with id:${postID} was not found.`
    })
  }

  let up: Array<bigint> = post.get('upvotes').map(id => BigInt(id))
  let down: Array<bigint> = post.get('downvotes').map(id => BigInt(id))
  let score:bigint = BigInt(post.get('score'))

  try {

    if(body.vote > 0 && !up.includes(userid)){

      const new_up = [...up, userid]
      const new_down = down.filter(id => id !== userid)
      score = BigInt(new_up.length - new_down.length)

      console.log("up:", new_up)
      console.log("down:", new_down)
      console.log("score:", score)

      await post.update({
        upvotes: new_up,
        downvotes: new_down,
        score: score
      })
    }

    else if(body.vote < 0 && !down.includes(userid)){

      const new_down = [...down, userid]
      const new_up = up.filter(id => id !== userid)
      score = BigInt(new_up.length - new_down.length)

      console.log("up:", new_up)
      console.log("down:", new_down)
      console.log("score:", score)

      await post.update({
        upvotes: new_up,
        downvotes: new_down,
        score: score
      })
    }

    else if (body.vote == 0){
      const new_up = up.filter(id => id !== userid)
      const new_down = down.filter(id => id !== userid)
      score = BigInt(new_up.length - new_down.length)

      await post.update({
        upvotes: new_up,
        downvotes: new_down,
        score: score
      })
    }
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      error: "Database update error: " + err
    })
  }

  return res.status(200).json({
    success: true,
    error: null
  })
})

//api endpoint for getting user profile information
//input: jwt
//output: user profile information
app.get('/api/userProfile', verifyToken, async (req: Request, res: Response) => {

  if(!req.token) {
    return res.status(400).json({
      success: false,
      username: null,
      email: null,
      posts: null,
      error: "No token in request body."
    })
  }

  let valid = await jwt.verify(req.token, pub)

  if(!valid) {
    return res.status(403).json({
      success: false,
      username: null,
      email: null,
      posts: null,
      error: "No token in request body."
    })
  }

  const userid = jwt.decode(req.token).userid

  console.log(jwt.decode(req.token))
  console.log(userid)

  const user = await User.findByPk(userid)

  if(!user){
    return res.status(500).json({
      success: false,
      username: null,
      email: null,
      posts: null,
      error: `User with id:${userid} was not found.`
    })
  }

  return res.status(200).json({
    success: true,
    username : user.get('username'),
    email : user.get('email'),
    posts : user.get('posts'),
    user_id : user.get('id'),
  })
})

app.get('/.well-known/jwks.json', (res: Response) => {
  try {
    const modulus = process.env.RSA_KEY_N
    const exponent = process.env.RSA_KEY_E
    const kid = process.env.RSA_KEY_KID

    if(!modulus || !exponent || !kid){
      throw new Error('RSA key informatiion is missing')
    }
    const jwksKey: JwksKey = {
      kid,
      kty: 'RSA',
      alg: 'RS256',
      use: 'sig',
      n: modulus,
      e: exponent,
    }

    const jwks: Jwks = {
      keys: [jwksKey],
    }

    res.json(jwks)
  } catch (error) {
    res.status(500).json({error: 'Internal Server Error'})
  }
})

app.listen(port, () => {
  console.log(`Running on http://locahost:${port}`)
})
