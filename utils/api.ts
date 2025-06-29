import axios from "axios";
import { Alert } from "react-native";
import refreshAccessToken from "./refreshAccessToken";

type Props = {
    url: string;
    token: string | null;
}

 async function getAPI({url,token}: Props) {
    const get = async ()=>{
        if(!token)
        {
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
                      return false;
                    }
                  }
                  else{
                    return false;
                  }
                }
                return error.response;
            } else {          
              return null;
            }
          }
          else {
              return null;
          }
        }
        
    }
  return await get();
}
async function postAPI({url,data,token}: {
    url:string,
    data:FormData | Record<string, unknown>,
    token:string | null

}) {
    const post= async()=>{
      if (!token) {
        token = '';
      } 
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };
    
      // Chỉ thêm Content-Type khi data là FormData
      if (data instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
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
                    const headers: Record<string, string> = {
                      'Authorization': `Bearer ${token}`,
                    };
                  
                    // Chỉ thêm Content-Type khi data là FormData
                    if (data instanceof FormData) {
                      headers['Content-Type'] = 'multipart/form-data';
                    }
                      try{
                        const response= await axios.post(url,data, {headers},)
                        return response;
                      }catch(error){
                         return null;
                      }
                  }
                  else{
                    return null;
                  }
                }
              return error.response;
          } else {  
            if(error.message=="Network Error")
            {
              return null;
            }
            return null;
          }
        }
        else {
            return null;
        }
      }
        
    }
  
  return await post()
   
  
}
export {getAPI,postAPI}