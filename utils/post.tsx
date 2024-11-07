import React from 'react'
import { Alert } from 'react-native'
import axios from 'axios'
import refreshAccessToken from './refreshAccessToken'

type Props = {
    url:string,
    data:FormData | Record<string, unknown>,
    token:string | null

}

export default function post({url,data,token}: Props) {
    const post= async()=>{
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };
    
      // Chỉ thêm Content-Type khi data là FormData
      if (data instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
      }
        
        if(!token)
        {
            token=''
        }
        try{
          const response= await axios.post(url,data, {headers},)
          return response;
        }
        catch (error: unknown) {
          // Kiểm tra xem lỗi có phải là một đối tượng và có thuộc tính `response`
          if (axios.isAxiosError(error)) {
            if (error.response) {
              if(error.response.status==401)
                {
                  token=await refreshAccessToken()
                  if(token)
                  {
                    return await post();
                  }
                  else{
                    return false
                  }
                }
              return error.response;
          } else {  
            console.log(error.message)
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
  
  return post()
   
  
}