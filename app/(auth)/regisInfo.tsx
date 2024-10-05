import React,{useState,useEffect} from 'react'
import {Text, View, SafeAreaView,TouchableOpacity,TextInput,ScrollView,Image} from 'react-native'
import InputLayout from '@/components/ui/inputLayout'
import ButtonCustom from '@/components/ui/ButtonCustom'
import { Link, useGlobalSearchParams } from 'expo-router'
import { useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker';
import { images } from '@/constants/image'

type Props = {
    email:string,
    pass:string
}

export default function RegisInfo({}: Props) {
    const {  } =useGlobalSearchParams();
    const { email,pass } = useLocalSearchParams();
    // const [email, setEmail] = useState('')
    // const [pass, setPass] = useState('')
    const [visible, setVisible] = useState(true)
    const [image, setImage] = useState<string | null>(null);
    useEffect(() => {
        console.log(email + " " + pass); // In ra email và pass mỗi khi chúng thay đổi
      }, []); // useEffect sẽ chạy khi email hoặc pass thay đổi
    
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
    const login = () => {

    }
    const loginGoogle=()=>{

    }
    const [info,setInfo]=useState({
        name:"",
        ms:"",
        school:"",
        avatar:'',
        role:"Sinh viên"
    })
  return (
    <SafeAreaView>
        <ScrollView className="h-[100vh] relative">
                <View>
                    <Text className="text-blue_primary text-[28px] font-msemibold mt-[20%] ml-[7.5%]">Đăng kí thông tin</Text>
                    <TouchableOpacity onPress={pickImage}>
                        <View className="mx-auto rounded-full  border-gray-400 border-[1px] self-start mt-[10%]">
                        <Image className="overflow-hidden w-20 h-20 rounded-full"  resizeMode="cover"  source={image ? { uri: image } : images.avatarDefault}></Image>
                    </View>
                    </TouchableOpacity>
                    
                    <InputLayout style='w-[85%] mt-[5%]'
                        title='Họ và tên'
                        placeHorder='Nguyễn Văn A'
                        value={info.name}
                        handle={(e) => setInfo({...info,name:e})} />
                        <View className={` ml-auto mr-auto w-[85%] mt-4 pb-1`}>
            <Text className="text-[16px] font-msemibold text-gray_primary mb-2 ml-0">Vai trò</Text>
            <View className="border-[1.2px] rounded-2xl border-gray-400 justify-center  ">
              <Picker style={{ height: 43,color:'#1F2937'}}
               className="text-xs"
               selectedValue={info.role}
               onValueChange={(a)=>setInfo({...info,role:a})} >
                <Picker.Item label="Sinh viên" value="Sinh viên" />
                <Picker.Item label="Giảng viên" value="Giảng viên" />
              </Picker>
            </View>
          </View>
                        <InputLayout style='w-[85%] mt-[3%]'
                        title={info.role=="Sinh viên" ? "Mã số sinh viên":"Mã số giảng viên"}
                        placeHorder='22520266'
                        value={info.ms}
                        handle={(e) => setInfo({...info,ms:e})} />
                        <InputLayout style='w-[85%] mt-[3%]'
                        title='Tên trường'
                        placeHorder='Đạii học Công nghệ thông tin'
                        value={info.name}
                        handle={(e) => setInfo({...info,name:e})} />

                        

                        
                    <ButtonCustom content="Hoàn tất đăng kí" handle={login} otherStyle="w-[85%] mt-[10%]"/>
                </View>
               
                <View className="flex-row mx-auto mt-[6%]">
                    <Text>Đã có tài khoản ?</Text>
                    <Link href="/sign-in">
                        <Text className="ml-3 text-sm font-mbold first-letter"> Đăng nhập</Text>
                    </Link>
                </View>
            </ScrollView>
    </SafeAreaView>
  )
}