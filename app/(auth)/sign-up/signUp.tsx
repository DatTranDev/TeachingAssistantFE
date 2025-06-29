import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import InputLayout from '@/components/ui/inputLayout';
import Feather from '@expo/vector-icons/Feather';
import ButtonCustom from '@/components/ui/ButtonCustom';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { icons } from '@/constants/icons';
import { Link, useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import postNoAuth from '@/utils/postNoAuth';
import { AuthContext } from '@/context/AuthContext';
import Loading from '@/components/ui/Loading';
import { localHost } from '@/utils/localhost';
import { uploadImage } from '@/utils/uploadImgae';
type Props = {};

export default function SignUp({}: Props) {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(true);
  const [check, setCheck] = useState(true);
  const router = useRouter();
  const { jsonInfo } = useLocalSearchParams();
  const info = JSON.parse(String(jsonInfo));
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  if (!authContext) {
    throw new Error(
      'AuthContext is undefined, make sure you are using AuthProvider'
    );
  }

  const { login } = authContext;

  const register = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if ( pass == '' || confirm == '') {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập đầy đủ mật khẩu để đăng kí'
      );
      return;
    }
    if (pass != confirm) {
      Alert.alert('Thông báo', 'Xác nhận mật khẩu sai');
    } else {
      setLoading(true);
      let image=''
      if(!info.avatar)
      {
        image = await uploadImage(info.avatar);
      }
      
      if (image) {
        const url = `${localHost}/api/v1/user/register`;
        const data = {
          name: info.name,
          email: info.email,
          password: pass,
          role: info.role,
          avatar: image,
          school: info.school,
          userCode: info.userCode
        };

        const response = await postNoAuth({ url, data });
        if (response) {
         
          if (response.status == 500) {
            Alert.alert('Thông báo', 'Đã xảy ra lỗi, vui lòng thử lại sau');
          } else {
            if (response.status == 400) {
              const message = await response.data;
              Alert.alert('Thông báo', `${message.message}`);
            } else {
              if (response.status == 201) {
                const result = await response.data;
                await login(
                  result.user,
                  result.accessToken,
                  result.refreshToken
                );
              } else {
                Alert.alert('Thông báo', 'Đã xảy ra lỗi');
              }
            }
          }
        }
        setLoading(false);
      }
      setLoading(false);
    }
    setLoading(false);
  };
  const regisGoogle = () => {};
  return (
    <SafeAreaView className='bg-white flex-1'>
      <Loading loading={loading} />
      <ScrollView>
        <View>
          <Text className='text-blue_primary text-[28px] font-msemibold mt-[30%] ml-[8%]'>
            Tạo tài khoản
          </Text>
          {/* Mật khẩu */}
          <View className={` ml-auto mr-auto w-[85%] mt-4 pb-1`}>
            <Text className='text-[16px] font-msemibold text-gray_primary mb-2'>
              Password
            </Text>
            <View className='border-[1.2px] rounded-2xl border-gray-400 px-2 py-[6px] flex-row justify-center items-center'>
              <TextInput
                className='text-[14px] font-mmedium text-gray-800 flex-1'
                secureTextEntry={visible}
                autoCorrect={false}
                value={pass}
                placeholder='.................'
                onChangeText={p => setPass(p)}
              />
              <TouchableOpacity
                className='inline-block ml-1 mr-[2px]'
                onPress={() => setVisible(!visible)}>
                <Feather
                  name={visible ? 'eye' : 'eye-off'}
                  size={18}
                  color='black'
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Xác nhận Mật khẩu */}
          <View className={` ml-auto mr-auto w-[85%] mt-4 pb-1`}>
            <Text className='text-[16px] font-msemibold text-gray_primary mb-2'>
              Confirm Password
            </Text>
            <View className='border-[1.2px] rounded-2xl border-gray-400 px-2 py-[6px] flex-row justify-center items-center'>
              <TextInput
                className='text-[14px] font-mmedium text-gray-800 flex-1'
                secureTextEntry={visible}
                autoCorrect={false}
                value={confirm}
                placeholder='.................'
                onChangeText={p => setConfirm(p)}
              />
              <TouchableOpacity
                className='inline-block ml-1 mr-[2px]'
                onPress={() => setVisible(!visible)}>
                <Feather
                  name={visible ? 'eye' : 'eye-off'}
                  size={18}
                  color='black'
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className='flex-row w-[85%] mx-auto items-center mt-[3%] pl-1'>
            <TouchableOpacity onPress={() => setCheck(!check)}>
              <FontAwesome
                name={check ? 'check-square-o' : 'square-o'}
                size={22}
                color={colors.text_gray}
              />
            </TouchableOpacity>

            <Text className='font-msemibold ml-1 text-sm text-gray-800'>
              Tôi đồng ý với các điều khoản sử dụng
            </Text>
          </View>
          <ButtonCustom
            content='Đăng kí'
            handle={register}
            otherStyle='mt-[10%]'
          />
          <View>
            <View className='flex-row items-center w-[85%] mt-[10%] ml-auto mr-auto'>
              <View className='bg-slate-500 flex-1 h-[1px]'></View>
              <Text className='text-slate-500 mx-1 font-msemibold text-xs'>
                hoặc đăng kí với
              </Text>
              <View className='bg-slate-500 flex-1 h-[1px]'></View>
            </View>
            <TouchableOpacity
              className='rounded-md border-slate-500 border-[1px] flex-row px-5 py-[10px] self-start ml-auto mr-auto mt-[5%]'
              onPress={regisGoogle}>
              <Image source={icons.google} className='w-5 h-5'></Image>
              <Text className='ml-2 font-msemibold text-sm'>Google</Text>
            </TouchableOpacity>
          </View>
          <View className='flex-row mx-auto mt-[5%]'>
            <Text>Đã có tài khoản ?</Text>
            <Link href='/sign-in'>
              <Text className='ml-3 text-sm font-mbold first-letter'>
                {' '}
                Đăng nhập
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
