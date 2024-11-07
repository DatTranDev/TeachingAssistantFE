// authEventEmitter.ts
import { EventEmitter } from 'eventemitter3';

export const authEventEmitter = new EventEmitter();
export const updateAccessToken = (newToken: string) => {
      authEventEmitter.emit('updateAccessToken', newToken);
    };
    export const logoutEndSession= async ()=>{
      authEventEmitter.emit('logoutEndSession');
    }