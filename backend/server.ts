// express imports
import express, { Request, Response} from 'express'
import * as dotenv from 'dotenv'

// sequelize imports for postgresql
import { Sequelize } from 'sequelize-typescript'
import User from './models/User.model'
import Session from './models/Session.model'

// nodemailer and email-templates stuff
import { createTransport } from 'nodemailer'
import Email from 'email-templates'

// jwt imports
import {Jwks, JwksKey} from './types'
import { v4 as uuidv4 } from 'uuid';
const jwt = require('jsonwebtoken')

// Express Setup
const app = express()
const port = 3000
dotenv.config()
app.use(express.json())

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

///////////////////
// Helper Functions
// Internal to API

var issue_JWT = (userid: number, session_id: number, length_days: number) => {
    const token = jwt.sign({ userid: userid, session_id: session_id, role: 'user' },
    privateKey , { expiresIn: length_days + 'd', algorithm: "RS256" });
    return token;
}

 var verify_JWT = (token: JSON): Promise<boolean> => {
  return new Promise((resolve) => {
      jwt.verify(token, pub, (err: any) => {
          if(err) {
              console.log(err);
              resolve(false);
          } else {
              resolve(true);
          }
      });
  });
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

/////////////////////////////////
// API Endpoints ////////////////
// External Facing API Functions

app.get('/api', async (req: Request, res: Response) => {
  let date: Date = new Date()
  return res.json({"pong": date})
})

// login route
app.post('/api/login', async (req: Request, res: Response) => {
  const {body} = req;
  if (body.jwt) {
    let valid = await verify_JWT(JSON.parse(JSON.stringify(body.jwt)));
    const payload = jwt.decode(body.jwt, {complete: true});
    if(valid)
    {
      //check if user is banned or timed out
      //query users table for id and if banned is true
      const user = await User.findByPk(payload.payload.userid)
      if (!user) {
        return res.json({valid: false});
      }
      if (user.banned) {
        return res.json({valid: false, banned:true});
      }
      return res.json({valid: true, banned: false});
    }
    else
    {
      //query
      console.log("Invalid JWT");
      const [updateCount] = await Session.update({valid: false}, {where: {session_id: payload.payload.session_id}});
      if (updateCount > 0) {

      } else {
        console.log("Session not invalidated");
      }
    }
  }
  else
  {
    const username = body.username;
    if (!username) {
      return res.status(400).json({
        valid: false,
        reason: "Username not provided"
      })
    }

    const user = await User.findOne({
      attributes: ['id'],
      where: { username: username }
    })
    .then((user) => {
      if(user === null){
        return res.status(200).json({
          valid: false,
          reason: "User not found"
        })
      }
      const data = user.get({ plain: true })
      
      // create a new session for the user
      create_session(data.id)
      .then((session_id) => {
        // return the session_id to the user
        return res.status(200).json({
          valid: true,
          session_id: session_id
        })
      })
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        valid: false,
        reason: err.toString()
      })
    })

  }
});

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

// logout route
app.post('/api/logout', async (req: Request, res: Response) => {

  // needs JWT verification

  // if JWT is valid invalidate session under session_id

  // if session_id is invalidated, return success

  // else return failure
})

app.post('/testSession', async (req: Request, res: Response) => {
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

app.post('/testJWT', async (req: Request, res: Response) => {
  const {body} = req;
  let token = issue_JWT(body.userid, body.session_id, body.length_days);
  return res.json({jwt: token});
})

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
