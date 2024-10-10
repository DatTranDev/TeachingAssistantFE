import React from 'react'
import { Alert } from 'react-native'
import axios from 'axios'

type Props = {
    url:string,
    data:Record<string, unknown>,
    token?:string | null

}

export default function patch({url,data,token}: Props) {
    const patch= async()=>{
        console.log(JSON.stringify(data))
        if(!token)
        {
            token=''
        }
        try{
          const response= await axios.patch(url,data)
          return response;
        }
        catch (error: unknown) {
          // Kiểm tra xem lỗi có phải là một đối tượng và có thuộc tính `response`
          if (axios.isAxiosError(error)) {
            if (error.response) {
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
  
  return patch()
   
  
}