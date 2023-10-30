import {Jwks, JwksKey} from './types'
import express, { Request, Response} from 'express'
import * as dotenv from 'dotenv'
import { Sequelize } from 'sequelize-typescript'
import User from './models/User.model'
import Session from './models/Session.model'

//import jwt from 'jsonwebtoken'
const jwt = require('jsonwebtoken')

const app = express()
const port = 3000

dotenv.config()
app.use(express.json())

// Option 1: Passing a connection URI
const sequelize = new Sequelize({
  database: 'pngwin_dev',
  dialect: 'postgres',
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  storage: ':memory:',
  models: [__dirname + '/models'], // or [Player, Team],
})


const privateKey = process.env.RSA_PRIV_KEY
const pub = process.env.RSA_PUB_KEY

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

const start_session = (user_id: number) => {

  // generate 6 digit OTP

  // create a new user session in db for user_id, with OTP, valid=false, pending=true

}

app.post('/api/verifyOTP', async (req: Request, res: Response) => {
  // takes in OTP and session_id

  // validates OTP with session_id

  // if valid issue JWT and return valid: true and jwt:token

  // if invalid return valid: false and jwt:null
})

app.post('/api/createUser', async (req: Request, res: Response) => {

  const {body} = req

  if (!body.email || !body.username) {
    return res.json({user_created: false, reason: "User missing required fields."})
  }

  const new_email: String = body.email
  const new_username: String = body.username
  const permissions_role: number = 0
  const initially_banned: Boolean = false

  const user = new User({
    username: new_username,
    email: new_email,
    role: permissions_role,
    banned: false
  })

  if ( !(user instanceof User) )
    return res.status(400).json({reason: "Invalid username or email."})

  user.save()

  return res.json({"new_user": user})
})

// login route
app.post('/api/auth', async (req: Request, res: Response) => {
    const {body} = req;
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
      return res.json({valid: false});
    }
});

// logout route
app.post('/api/logout', async (req: Request, res: Response) => {
  // needs JWT
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

app.post('/testJWT', async (req: Request, res: Response) => {
  const {body} = req;
  let token = issue_JWT(body.userid, body.session_id, body.length_days);
  return res.json({jwt: token});
})
