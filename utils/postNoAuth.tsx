import React from 'react'
import { Alert } from 'react-native'
import axios from 'axios'

type Props = {
   url: string;
   data: FormData | Record<string, unknown>;
   token?: string | null;
};

export default function postNoAuth({url,data,token}: Props) {
    const post= async()=>{
        const headers: Record<string, string> = {
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
          const response= await axios.post(url,data,{headers})
          return response;
        }
        catch (error: unknown) {
          console.log(error)
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
        // try {
        //     const response = await fetch(url, {
        //         method: 'POST', 
        //         headers: {
        //           Accept: 'application/json',
        //           'Content-Type': 'application/json',
        //         },// Phương thức gửi dữ liệu là POST
        //         body: JSON.stringify(data),
        //       })
        //     if (!response.ok) {
        //       console.log(response)
                
        //       return response;
        //     }
            
        //   } catch (error) {
        //     console.log(error)
        //     Alert.alert("Thông báo","Đã xả ra lỗi, vui lòng thử lại sau !" )
        //     return null;
        //   } 
    }
  
  return post()
   
  
}