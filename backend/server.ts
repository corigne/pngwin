import {Jwks, JwksKey} from './types'
import express, { Request, Response} from 'express';
import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import e from 'express';
import { Jwt } from 'jsonwebtoken';

// Option 1: Passing a connection URI
const sequelize = new Sequelize({
  database: 'pngwin-dev',
  dialect: 'postgres',
  username: 'postgres',
  password: process.env.PG_PASS,
  storage: ':memory:',
  models: [__dirname + '/models'], // or [Player, Team],
});

//import jwt from 'jsonwebtoken'
const jwt = require('jsonwebtoken');

const app = express();
const port = 8080;

dotenv.config();
app.use(express.json());

const privateKey = process.env.RSA_PRIV_KEY;
const pub = process.env.RSA_PUB_KEY;

app.get('/.well-known/jwks.json', (res: Response) => {
    try {
        const modulus = process.env.RSA_KEY_N;
        const exponent = process.env.RSA_KEY_E;
        const kid = process.env.RSA_KEY_KID;

        if(!modulus || !exponent || !kid){
            throw new Error('RSA key informatiion is missing');
        }
        const jwksKey: JwksKey = {
            kid,
            kty: 'RSA',
            alg: 'RS256',
            use: 'sig',
            n: modulus,
            e: exponent,
        };

        const jwks: Jwks = {
            keys: [jwksKey],
        };

        res.json(jwks);
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
 });

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

  const {body} = req;

  if (!body.email || !body.username) {
    return res.json({user_created: false, reason: "User missing required fields."})
  }

  const email: String = body.email;
  const username: String = body.username;

})

// login route
app.post('/api/auth', async (req: Request, res: Response) => {
    const {body} = req;
    let valid = await verify_JWT(JSON.parse(JSON.stringify(body.jwt)));
    if(valid)
    {
      //check if user is banned or timed out
      //if they are, return invalid
      return res.json({valid: true});
    }
    else
    {
      //check invalid session id and return invalid
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

app.listen(port, () => {
  console.log(`Running on http://locahost:${port}`);
})

//
