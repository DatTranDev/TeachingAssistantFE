import React from 'react'
import axios from 'axios'
import { Alert } from 'react-native'
import { updateAccessToken } from './authEventEmitter'
import refreshAccessToken from './refreshAccessToken'

type Props = {
    url:string,
    token:string |null

}

export default async function get({url,token}: Props) {
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
                if(error.response.status==401)
                {
                  token=await refreshAccessToken()
                  if(token)
                  {
                    try{
                      const response= await axios.get(url, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                      }
                      },)
                      return response; 
                    }catch(error){
                      Alert.alert("Thông báo","Đã xả ra lỗi, vui lòng thử lại sau !" )
                      return false;
                    }
                  }
                  else{
                    return false;
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
  return await get();
}