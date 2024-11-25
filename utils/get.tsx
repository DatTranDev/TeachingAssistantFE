import React from 'react'
import axios from 'axios'
import { Alert } from 'react-native'
import { updateAccessToken } from './authEventEmitter'
import refreshAccessToken from './refreshAccessToken'

type Props = {
    url:string,
    token:string |null

}

export default function get({url,token}: Props) {
  let start=0;
    const get = async ()=>{
        if(!token)
        {
            Alert.alert('Thông báo','Đã xảy ra lỗi')
            return;
        }
        try{
            const response= await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
            },)
            return response; 

        }catch (error: unknown) {
            if (axios.isAxiosError(error)) {
              if (error.response) {
                if(error.response.status==401 && start==0)
                {
                  start=start+1;
                  token=await refreshAccessToken()
                  if(token)
                  {
                    return await get();
                  }
                  else{
                    return false
                  }
                }
                return error.response;
            } else {          
              Alert.alert("Thông báo","Đã xả ra lỗi, vui lòng thử lại sau !" )
              return null;
            }
          }
          else {
              Alert.alert("Thông báo","Đã xả ra lỗi, vui lòng thử lại sau !" )
              return null;
          }
        }
        
    }
  return get();
}