export type JwksKey = {
    kid: string,
    kty: string;
    alg: string;
    use: string;
    n: string;
    e: string;
}

export type Jwks = {
    keys: JwksKey[];
}
