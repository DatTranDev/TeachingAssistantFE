import React from 'react'
import { Alert } from 'react-native'

type Props = {
    url:string,
    data:Record<string, unknown>,
    token?:string | null

}

export default function postNoAuth({url,data,token}: Props) {
    const post= async()=>{
        console.log(data)
        if(!token)
        {
            token=''
        }
        try {
            const response = await fetch(url, {
                method: 'POST', 
                headers: {
					Authorization: `Bearer ${token}`,
				},// Phương thức gửi dữ liệu là POST
                body: JSON.stringify(data),
              })
            if (!response.ok) {
              console.log(response)
                
              return response;
            }
            
          } catch (error) {
            console.log(error)
            Alert.alert("Thông báo","Đã xả ra lỗi, vui lòng thử lại sau !" )
            return null;
          } 
    }
  
  return post()
   
  
}