import React from 'react'
import axios from 'axios'
import { Alert } from 'react-native'

type Props = {
    url:string,
    token:string |null

}

export default function get({url,token}: Props) {
    const get = async ()=>{
        console.log(url)
        console.log(token)
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
            console.log(response.data)
            return response; 
        }catch (error: unknown) {
            // Kiểm tra xem lỗi có phải là một đối tượng và có thuộc tính `response`
           console.log(error)
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
  return get();
}