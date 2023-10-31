import {Jwks, JwksKey} from './types'
import express, { Request, Response} from 'express'
import * as dotenv from 'dotenv'
import { Sequelize } from 'sequelize-typescript'
import User from './models/User.model'
import Session from './models/Session.model'
import { createTransport } from 'nodemailer'
import Email from 'email-templates'
import { v4 as uuidv4 } from 'uuid';
import { warn } from 'console'
import { stringify } from 'querystring'

//import jwt from 'jsonwebtoken'
const jwt = require('jsonwebtoken')

const app = express()
const port = 3000

dotenv.config()
app.use(express.json())

// Create a SMTP transporter object
var transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASS
  }
})

const email_message = new Email({
  message: {
    from: process.env.GMAIL
  },
  send: true,
  transport: transporter,
  preview: false
})

// Option 1: Passing a connection URI
const sequelize = new Sequelize({
  database: 'pngwin_dev',
  dialect: 'postgres',
  username: 'postgres',
  password: process.env.PG_PASS,
  storage: ':memory:',
  models: [__dirname + '/models'], // or [Player, Team],
})

const privateKey = process.env.RSA_PRIV_KEY

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

var issue_JWT = (userid: number, session_id: number, length_days: number) => {
  // create a JWT with the user_id, session_id, role, iat, and exp baked in
  // returns JWT or null
}

var verify_JWT = (token: JSON) => {
  // verify the user's JWT is valid, return true if valid, false if not
  // return true or false

}

// creates a new user session to be validated in the database
const create_session = async (in_user_id: number, is_remembered?: boolean) => {

  // Just checks for empty fields.
  if ( in_user_id == null ) {
    var missing: string = "";
    missing += (in_user_id) ? " " : "user_id "
    throw new Error("Missing Parameters:" + missing)
  }

  const user_id_exists: User|null = (await User.findOne({where: {id: in_user_id}}))
  //console.log(user_id_exists)
  if ( !user_id_exists ) {
    throw new Error("provided user_id doesn't exist")
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
    remembered: is_remembered,
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
    await Session.destroy({where: {session_id: new_session_id}})
    throw new Error("Unable to send verification email: " + err.toString())
  }

  // only runs if email sent successfully
  return new_session_id
}

// verifies login session for a user
// a new login attempt will be required for expired OTP
app.post('/api/verifyOTP', async (req: Request, res: Response) => {
  // takes in OTP and session_id
  const {body} = req
  if (!body.OTP || !body.session_id) {
    var missing: string = "";
    missing += (body.OTP) ? " " : "OTP, "
    missing += (body.session_id) ? " " : "session_id "
    return res.status(418).json({session_verified: false, reason: "Missing:" + missing})
  }
  const OTP = body.OTP
  const session_id = body.session_id

  // validates OTP with session_id
  await Session.findOne({
    where:{
      session_id: session_id
    }
  })
  .then((session) => {

    if (!session){
      return res.status(400).json({
        verified: false,
        token: null,
        reason: "Session not found."
      })
    }

    // TODO DELETEME
    console.log(session)

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
      // if (elapsed_min > 5){
      if (!true){
        // return an Error stating the OTP has expired
        return res.status(401).json({
          verified: false, token: null, reason: "OTP Expired"
        })
      }

      else{
        // validate the session
        // generate the jwt and store it in the session
        try{
          session.set({
            pending : false,
            valid : true,
            token : JSON.parse('{ "test": "placeholder" }')
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
    .catch((err) => {
      return res.status(400).json({session_verified: false, reason: "Session_id does not exist: ", error: err.toString()})
    })
  })

  app.post('/api/testSession', async (req: Request, res: Response) => {
    var session_id: string = ""

    const {body} = req
    if(!body.user_id){
      return res.status(400).json({session_created: false, reason: "Missing user_id."})
    }

    await create_session(body.user_id)
    .then((session_id) => {
      res.status(200).json({session_created: true, session_id: session_id})
    })
    .catch((err) => {
      res.status(400).json({session_created: false, reason: err.toString()})
    })

  })

  app.post('/api/createUser', async (req: Request, res: Response) => {

    const {body} = req
    if (!body.email || !body.username) {
      var missing: string = ""
      missing += (body.email) ? " " : "email, "
      missing += (body.username) ? " " : "username"
      return res.status(418).json({user_created: false, reason: "User missing required fields:" + missing})
    }

    // verify user doesn't already exist, return Error "user already exists" if exists
    const existing_user = await User.findOne({
      where:{
        username: body.username
      }
    })

    if (existing_user){
      // console.log(existing_user)
      return res.status(418).json({user_created: false, reason: "User already exists with that username."})
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
      return res.status(400).json({user_created: false, reason: "Invalid username or email."})

    try{
      await user.save()
    }
    catch(err: any){
      return res.status(500).json({user_created: false, reason: "Database error."})
    }

    return res.status(200).json({user_created: true, "new_user": user})
  })

  // login route
  app.post('/api/auth', async (req: Request, res: Response) => {
    const username = 'username'
    const password = 'password'

    const {body} = req

    if(!body.username || !body.password) {
      return res.status(400).json({message: `Username and password are necessary.`})
    }

    if(body.username === username && body.password === password) {

      //const token = jwt.sign({ username: body.username }, privateKey , { expiresIn: '1h', algorithm: "RS256" })

      return res.json({message: 'Auth successful'})
    } else {
      return res.status(401).json({message: 'Auth failed, invalid credentials.'})
    }

  })

  // logout route
  app.post('/api/logout', async (req: Request, res: Response) => {

    // needs JWT verification

    // if JWT is valid invalidate session under session_id

    // if session_id is invalidated, return success

    // else return failure
  })

app.get('/api', async (req: Request, res: Response) => {
  let date: Date = new Date()
  return res.json({"pong": date})
})

app.listen(port, () => {
  console.log(`Running on http://locahost:${port}`)
})

  //
