import React, { useContext, useState, useEffect } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { localHost } from '@/utils/localhost';
import { useLocalSearchParams } from 'expo-router';
import get from '@/utils/get';
import * as Location from 'expo-location';
import post from '@/utils/post';
type Props = {}
export type Attend={
    id:string,
    date:string,
    status:boolean
}
export default function RollCall({ }: Props) {
    const authContext = useContext(AuthContext);  
    if (!authContext) {
      Alert.alert("Thông báo", "Đã xảy ra lỗi")
      return;
    }
    const {subjectId}=useLocalSearchParams()
    const {accessToken,user}=authContext;
    const [attends,setAttends]=useState<Attend[]>([])
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    function formatDate(dateString: string) {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long', // Thứ trong tuần
          day: '2-digit',  // Ngày
          month: '2-digit', // Tháng
          year: 'numeric',  // Năm
        };
        const date = new Date(dateString);
        // const vietnameseWeekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        // const weekday = vietnameseWeekdays[date.getDay()];
        // Chuyển đổi ngày tháng năm sang định dạng yêu cầu
        console.log(date)
        const formattedDate = `${date.toLocaleDateString('vi-VN', options)}`;
        return formattedDate;
      }
    useEffect(()=>{
        async function getData () {
            const url=`${localHost}/api/v1/cAttend/findBySubject/${subjectId}`
            const res= await get({url:url,token:accessToken})
            const url2=`${localHost}/api/v1/subject/${subjectId}/user/${user?.id}/attendRecords`
            const res2= await get({url:url2,token:accessToken})
            
            if(res && res.status==200 && res2 && res2.status==200){
                const listAttend=res.data.cAttends;
                const listReview=res2.data.attendRecords;
                const data= listAttend.map((item:any)=>({
                    id:item.id,
                    date:item.date,
                    status:listReview.find((review:any)=>review.cAttendId.id==item.id)?true:false
                }))
                setAttends(data)
            }                   
            }
            getData()
    },[])
    const router=useRouter()
    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Thông báo', 'Cần cấp quyền truy cập vị trí để điểm danh');
            return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
        });
    };

    const clickRollCall = async (attend:Attend) => {
       
        await getLocation();
        if(!attend.status){
            console.log(location)
            const url=`${localHost}/api/v1/cAttend/attendrecord/add`
            const data={
                cAttendId:attend.id,
                studentId:user?.id,
                studentLatitude: location?.latitude,
                studentLongitude: location?.longitude
            }
            console.log(data)
            const res = await post({ url: url, token: accessToken, data: data })
            if(res){
                console.log(res.data)
            }
            if(res && res.status==201){
                const record=res.data.attendRecord;
                if(record.status=="CM"){
                    Alert.alert("Thông báo", "Điểm danh thành công")
            }
            if(record.status=="KP"){
                Alert.alert("Thông báo", "Điểm danh không thành công")
            }
        }
        }
    }

    return (
        <View>
            <View className=' pb-[1.5%]  border-b-[1px] border-gray-200 flex-row  pt-[12%] px-[4%] items-center mr-6 '>
                <TouchableOpacity onPress={router.back}>
                    <Ionicons name="chevron-back-sharp" size={24} color="black" />
                </TouchableOpacity>
                <View className='mx-auto items-center'>
                    <Text className='text-[18px] font-msemibold uppercase'>SE310.P12</Text>
                    <Text className='mt-[-3px]'>Điểm danh</Text>
                </View>
            </View>
            <Text className='font-msemibold text-blue_primary mt-[5%] ml-[5%]'>Đã vắng 1/5 buổi</Text>
            <ScrollView className='mt-3'>
                {attends.map((item,index)=>(
                    !item.status?
                    <TouchableOpacity onPress={()=>clickRollCall(item)} className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                        <View className='mx-auto items-center justify-center'>
                        <Text>Thứ 6, 18/05/2024</Text>
                        <Text className='text-[#FE3535] text-base font-mmedium mt-1'>Chưa điểm danh</Text>
                    </View>
                        <FontAwesome6 name="exclamation" size={22} color="#FE3535" />
                    </TouchableOpacity>
                    :
                   
                    <TouchableOpacity onPress={()=>clickRollCall(item)} className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                        <View className='mx-auto items-center justify-center'>
                            <Text>Thứ 6, 18/05/2024</Text>
                            <Text className='text-green text-base font-mmedium mt-1'>Đã điểm danh</Text>
                        </View>
                    </TouchableOpacity>
                
                   
                ))}

                {/* <View className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                    <View className='mx-auto items-center justify-center'>
                        <Text>Thứ 6, 18/05/2024</Text>
                        <Text className='text-green text-base font-mmedium mt-1'>Đã điểm danh</Text>
                    </View>
                </View>
                <View className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                    <View className='mx-auto items-center justify-center'>
                        <Text>Thứ 6, 18/05/2024</Text>
                        <Text className='text-orange text-base font-mmedium mt-1'>Hết hạn điểm danh</Text>
                    </View>
                </View> */}

            </ScrollView>
        </View>
    )
}