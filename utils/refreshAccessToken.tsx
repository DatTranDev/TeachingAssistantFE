import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import get from './get'
import { localHost } from './localhost'
import { updateAccessToken, logoutEndSession } from './authEventEmitter'
import { Alert } from 'react-native'
import axios from 'axios'

type Props = {}

export default function refreshAccessToken() {
      
      const refreshAcccess=async()=>{
            const refreshToken= await AsyncStorage.getItem('refreshToken');
            const url=`${localHost}/api/v1/token/refresh-token`           
            try{
                  const response= await axios.get(url, {
                  headers: {
                    Authorization: `Bearer ${refreshToken}`,
                  }
                  },)
                  if(response)
                        {
                              if(response.status==200)
                              {
                                    const data= await response.data
                                    updateAccessToken(data.access_token);
                                    return data.access_token;
                              }
                              else{
                                    throw new Error("Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại")
                              }
                        }else{
                              throw new Error("Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại")
                        }
              }catch{
                  await logoutEndSession();
                  Alert.alert("Thông báo","Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại")
                  return false;
              }
            
            
      }
  return (
    refreshAcccess()
  )
}