import ButtonCustom from '@/components/ui/ButtonCustom';
import Loading from '@/components/ui/Loading';
import { colors } from '@/constants/colors';
import { formatNoWeekday } from '@/utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import { Alert, Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import * as Location from 'expo-location';
import patch from '@/utils/patch';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import get from '@/utils/get';
type Props = {}
type Student = {
  id: string;
  name: string;
  userCode: string;
}


export default function RollCall({ }: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const { date, attendId, subjectId } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false)
  const [totalStudent, setTotalStudent] = useState<number>(50);
  const [listStudent, setListStudent] = useState<Student[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [time, setTime] = useState<number>(3)
  const [checkLocation, setCheckLocation] = useState<boolean>(true)
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false)
  const handleRollCall = () => {
    setOpenModal(true);
    setTime(3)
    setCheckLocation(true)
  }
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần cấp quyền truy cập vị trí để điểm danh');
      return false;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude
    });
    return true;
  }
  const createRollCall = async () => {
    if (!isActive) {
      setLoading(true);
      if (checkLocation) {
        const check = await getLocation();
        if (!check) {
          return;
        }
      }
      else {
        setLocation({
          latitude: 0,
          longitude: 0
        })
      }
      const data = {
        isActive: "true",//Bắt đầu điểm danh
        teacherLatitude: location?.latitude,
        teacherLongitude: location?.longitude,
        timeExpired: time //Thời gian hết hạn(đơn vị phút)
      }
      const res = await patch({ url: localHost + `/api/v1/cAttend/update/${attendId}`, data: data, token: accessToken })
      if (res) {
        if (res.status === 200) {
          setIsActive(true)
          Alert.alert("Thông báo", "Tạo điểm danh thành công")
        }
        else{
          console.log(res.status)
          Alert.alert("Thông báo", "Đã xảy ra lỗi")
        }
      }
      setLoading(false)
      setOpenModal(false)
    }
  }
  const deleteRollCall = async () => {
  }
  useEffect(()=>{
    async function getAttend()
    {
      setLoading(true)
      const res = await get({url:localHost+`/api/v1/cAttend/${attendId}`,token:accessToken})
      if(res)
      {
        if(res.status==200)
        {
          console.log(res.data)
          setIsActive(res.data.cAttend.isActive)
          if(res.data.cAttend.isActive)
          {
            getPresentStudent()
          }
          else{
            setLoading(false)
            return;
          }
        }
        else{
          setLoading(false)
          Alert.alert("Thông báo", "Đã xảy ra lỗi")
        }
      }
      else{
        setLoading(false)
      }
      
    }
    async function getPresentStudent()
    {
      const res = await get({url:localHost+`/api/v1/cAttend/attendStudents/${attendId}`,token:accessToken})
      if(res)
      {
        if(res.status==200)
        {
          setLoading(false)
          setListStudent(res.data.students)
        }
        else{
          setLoading(false)
          Alert.alert("Thông báo", "Đã xảy ra lỗi")
        }
      }
      else{
        setLoading(false)
      }
    }
    async function getAllStudent()
    {
      const res = await get({url:localHost+`/api/v1/subject/${subjectId}/students`,token:accessToken})
      if(res)
      {
        if(res.status==200)
        {
          setTotalStudent(res.data.students.length)
        }
      }
    }
    getAllStudent();  
    getAttend();
   
  },[])

  return (
    <SafeAreaView className='flex-1'>
      <Loading loading={loading} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={openModal}
        onRequestClose={() => setOpenModal(false)}>
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setOpenModal(false)}>
          <TouchableWithoutFeedback>
            <View className=" bg-white  pt-4 pb-5 rounded-lg px-1 z-50 ">
              <Text className='text-base font-msemibold text-center'>
                {formatNoWeekday(date)}
              </Text>
              <View className='flex-row  w-[60%] px-[4%] items-center gap-4 mt-1'>
                <Text className='text-base font-mmedium'>Thời gian</Text>
                <View className="border-[1.2px] rounded-lg border-gray-400 justify-center w-full p-0 ">
                  <Picker style={{ height: 30, color: '#1F2937', marginBottom: -10 }}
                    className="text-xs"
                    selectedValue={time}
                    onValueChange={(a) => setTime(a)} >
                    <Picker.Item label="3 phút" value="3" />
                    <Picker.Item label="5 phút" value="5" />
                    <Picker.Item label="10 phút" value="10" />
                    <Picker.Item label="15 phút" value="15" />
                    <Picker.Item label="Không giới hạn" value="-1" />
                  </Picker>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setCheckLocation(!checkLocation)}
                className='flex-row items-center mt-5 px-[5%]'>
                <View className='relative w-8 h-8'>
                  <View
                    className='w-4 h-4 rounded-sm'
                    style={{
                      borderColor:
                        checkLocation ? colors.blue_primary : 'black',
                      borderWidth: 1.2
                    }}></View>
                  {checkLocation && (
                    <View
                      className='absolute '
                      style={{
                        top: -7,
                        left: -3
                      }}>
                      <AntDesign name="check" size={26} color={colors.blue_primary} />
                    </View>
                  )}
                </View>
                <Text className=' text-base  font-msemibold text-center mb-4 -ml-1'>
                  Sử dụng vị trí
                </Text>
              </TouchableOpacity>
              <ButtonCustom content='Bắt đầu' handle={() => createRollCall()} otherStyle='w-[70%]  px-5' />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
      <View className=' shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
        <TouchableOpacity onPress={router.back}>
          <Ionicons name='chevron-back-sharp' size={24} color='white' />
        </TouchableOpacity>
        <View className='mx-auto items-center pr-6'>
          <Text className='text-[18px] font-msemibold uppercase text-white'>
            Điểm danh
          </Text>
          <Text className='mt-[-3px] text-white font-mmedium'>
            {formatNoWeekday(date)}
          </Text>
        </View>
      </View>
      <View className='px-[5%] mt-[2%] flex-1'>
        <Text className='text-lg font-msemibold text-center mt-2'>
          Sinh viên có mặt ({listStudent.length}/{totalStudent})
        </Text>
        <ScrollView>
          {listStudent.map((item,index)=>(
            <View key={index} className='bg-white rounded-md p-3 mt-3'>
              <Text className='text-base font-mregular text-center'>
                {index+1}. {item.userCode} - {item.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <LinearGradient
        className='h-[1px] bg-[#dbd7d7]'
        colors={['#F7F7F7', '#dbd7d7']}
      />
      <View className='pb-4 pt-3'>
        {isActive?  <ButtonCustom content='Xóa điểm danh' handle={() => deleteRollCall()} otherStyle='w-[60%] bg-red' />
        :<ButtonCustom content='Tạo điểm danh' handle={() => handleRollCall()} otherStyle='w-[60%]' />
        }
       
      </View>
    </SafeAreaView>
  );
}