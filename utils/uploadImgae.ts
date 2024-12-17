import mime from "react-native-mime-types";
import { localHost } from "./localhost";
import post from "./post";
import postNoAuth from "./postNoAuth";

export const uploadImage = async (imageUri: string, name?: string) => {
   if(!name)
   {
      name=new Date().getTime().toString()
   }
   console.log(name)
  const formData = new FormData();
  const extension = imageUri.split('.').pop();
  if (extension) {
    const type = mime.lookup(extension);
    if (type) {
      formData.append('image', {
        uri: imageUri,
        type: type || 'image/jpeg', // Mặc định là JPEG nếu không xác định được loại
        name: name || 'photo.jpg'
      } as any);
    }
  }
  const url = `${localHost}/api/v1/upload/image`;
  try {
    const response = await post({
      url: url,
      token: null,
      data: formData
    });
    if (response) {
      if (response.status == 200) {
        const json = await response.data;
        return json.image;
      } else {
        return false;
      }
    }
  } catch (error) {
    return false;
  } finally {
  }
};
