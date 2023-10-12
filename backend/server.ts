import {Jwks, JwksKey} from './types'
import express, { Request, Response} from 'express';
import * as dotenv from 'dotenv';
//import jwt from 'jsonwebtoken'
const jwt = require('jsonwebtoken');

const app = express();
const port = 8080;

dotenv.config();
app.use(express.json());

const privateKey = process.env.RSA_PRIV_KEY;

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

app.post('/auth', async (req: Request, res: Response) => {
    const username = 'username'; 
    const password = 'password';
    
    const {body} = req;

    if(!body.username || !body.password) {
        return res.status(400).json({message: `Username and password are necessary.`})
    }

    if(body.username === username && body.password === password) {
        
        //const token = jwt.sign({ username: body.username }, privateKey , { expiresIn: '1h', algorithm: "RS256" });

        return res.json({message: 'Auth successful'});
    } else {
        return res.status(401).json({message: 'Auth failed, invalid credentials.'});
    }
    
});
app.listen(port, () => {
    console.log('Running on http://locahost:8080');
})