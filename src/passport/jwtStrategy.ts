import {Strategy, StrategyOptions} from 'passport-jwt';
import {ExtractJwt} from 'passport-jwt';
import passport from 'passport';
import { ResourceService } from '../services';
import { IUser } from 'interfaces';
import { HttpException } from '../exceptions';
import '../config/dotenv';

/**
 * @memberof JWTStrategy
 * @type options of jwt strategy
 */
const opt: StrategyOptions = {
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'secret'
}
/**
 * @memberof JWTStrategy
 * @description strategy of jwt in passport
 */
export default new Strategy(opt,
    async function(jwt_payload, done) {
    try {
        
        const user: IUser | null = await ResourceService.getByUsername(jwt_payload.username);
        if(user){
            const token = {
                user:user,
                token_type:jwt_payload.token_type,
                createdAt:jwt_payload.createdAt
            }
            return done(null, token);
        }
        else{
            throw new HttpException(401, 'Authentication failed');
        }
        
    } catch (err) {
        return done(err, false);
    }
});