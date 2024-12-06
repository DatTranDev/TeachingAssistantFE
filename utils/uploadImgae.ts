import mime from "react-native-mime-types";
import { localHost } from "./localhost";
import post from "./post";
import postNoAuth from "./postNoAuth";

export const uploadImage = async (imageUri: string) => {
   const formData = new FormData();
   const extension = imageUri.split(".").pop();
   if (extension) {
      const type = mime.lookup(extension);
      if (type) {
         formData.append("image", {
            uri: imageUri,
            type: type || "image/jpeg",
            name: `${Date.now()}.${extension}` // Mặc định là JPEG nếu không xác định được loại
         } as any);
      }
   }
   const url = `${localHost}/api/v1/upload/image`;
   const response = await postNoAuth({ url: url, data: formData,token:null });
   if (response) {
      if (response.status == 200) {
         const json = await response.data;
         return json.image;
      } else {
         return false;
      }
   }
   return false;
};
