import React, {useContext, useState} from 'react'
import { router, Link} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View,SafeAreaView,Text, Alert, TouchableOpacity,Image, } from 'react-native'
import InputLayout from '@/components/ui/inputLayout'
import { Picker } from '@react-native-picker/picker'
import { AuthContext } from '@/context/AuthContext'
import ButtonCustom from '@/components/ui/ButtonCustom'
import * as ImagePicker from 'expo-image-picker';
import { images } from '@/constants/image'
import { uploadImage } from '@/utils/uploadImgae'
import patch from '@/utils/patch'
import { localHost } from '@/utils/localhost';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Loading from '@/components/ui/Loading';

type Props = {}

export default function EditProfile({}: Props) {
  const authContext = useContext(AuthContext);
  if(!authContext){
    Alert.alert('Error','Xảy ra lỗi, vui lòng thử lại sau')
    return;
  }
  const user = authContext.user;
  if(!user){
    Alert.alert('Error','Xảy ra lỗi, vui lòng thử lại sau')
    return;
  }
  const accessToken = authContext.accessToken;
  const refreshToken = authContext.refreshToken;
  if(!accessToken || !refreshToken){
    Alert.alert('Error','Xảy ra lỗi, vui lòng thử lại sau')
    return;
  }
  const [visible, setVisible] = useState(false)
  const [image, setImage] = useState<string | null>(user.avatar);
  const [info,setInfo]=useState({
    _id:user.id,
    id:user.id,
    email:user.email,
    name:user.name,
    userCode:user.userCode,
    school:user.school,
    avatar: user.avatar,
    role:user.role,
  })
  const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setInfo({...info,avatar:result.assets[0].uri})
      }
  };

  const handleUpdate = async()=>{
    if(info.name=='' || info.school=='' || info.userCode=='')
    {
      Alert.alert('Thông báo','Vui lòng nhập đủ thông tin để tiếp tục')
    }
    if(user.name==info.name && user.userCode==info.userCode && user.school==info.school && user.avatar==info.avatar)
    {
      Alert.alert('Thông báo','Không có gì thay đổi')
      return;
    }
    setVisible(true)
    let imageRes = user.avatar;
    if(user.avatar!=info.avatar){
      imageRes = await uploadImage(info.avatar);
      if(imageRes){
        setInfo({...info,avatar:imageRes})
      }
      else{
        Alert.alert('Tải ảnh lên thất bại','Vui lòng thử lại sau')
        setVisible(false)
        return;
      }
    }

    const url = `${localHost}/api/v1/user/update/${user.id}`
    const data = info;
    if(imageRes){
      data.avatar = imageRes;
    }

    
    const response = await patch({ url, data, token: authContext.accessToken })
    if(response){
      if(response.status == 200){
        data._id = user.id;
        await authContext.login(data,accessToken,refreshToken)
        Alert.alert('Thông báo','Cập nhật thông tin thành công')
        setVisible(false)
      }
      else{
        setVisible(false)
        Alert.alert('Thông báo','Đã xảy ra lỗi, vui lòng thử lại sau')
      }
  }
}

  return (
   <SafeAreaView>
    <View>
      <Loading loading={visible}/>
      <View className=' pb-[3.5%]  border-b-[1px] border-gray-200 flex-row  pt-[13%] px-[4%] items-center bg-blue_primary '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <Text className='mx-auto text-[18px] font-msemibold uppercase text-white pr-6'>Cập nhật thông tin</Text>
      </View>
        <TouchableOpacity onPress={pickImage}>
            <View className="mx-auto rounded-full  border-gray-400 border-[1px] self-start mt-[10%]">
            <Image className="overflow-hidden w-20 h-20 rounded-full"  resizeMode="cover"  source={image ? { uri: image } : images.avatarDefault}></Image>
        </View>
        </TouchableOpacity>
        <InputLayout style='w-[85%] mt-[5%]'
            title='Email'
            placeHorder='user@example.com'
            value={info.email}
            handle={(e) => setInfo({...info,name:e})} />
        <InputLayout style='w-[85%] mt-[3%]'
            title='Họ và tên'
            placeHorder='Nguyễn Văn A'
            value={info.name}
            handle={(e) => setInfo({...info,name:e})} />
        <InputLayout style='w-[85%] mt-[3%]'
          title={info.role=="student" ? "Mã số sinh viên":"Mã số giảng viên"}
          placeHorder='22520266'
          value={info.userCode}
          handle={(e) => setInfo({...info,userCode:e})} />
        <InputLayout style='w-[85%] mt-[3%]'
          title='Tên trường'
          placeHorder='Đại học Công nghệ thông tin'
          value={info.school}
          handle={(e) => setInfo({...info,school:e})} />
        <Link href="/forgotPassword" className='mx-auto ml-[62%] mt-[3%]'>
            <Text className="font-msemibold text-xs mt-[2px] ">Thay đổi mật khẩu</Text>
        </Link>
        <ButtonCustom content="Cập nhật" handle={handleUpdate} otherStyle="w-[85%] mt-[5%]"/>
    </View>
   </SafeAreaView>
  )
}