import React, { useContext, useState, useEffect } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { localHost } from '@/utils/localhost';
import { useLocalSearchParams } from 'expo-router';
import { SocketContext } from '@/context/SocketContext';
import get from '@/utils/get';
import * as Location from 'expo-location';
import post from '@/utils/post';
import { formatDate, formatNoWeekday } from '@/utils/formatDate';
import Loading from '@/components/ui/Loading';
type Props = {}
export type Attend = {
    id: string,
    date: string,
    status: string,
    sessionNumber:number,
    teacherLatitude:number,
    teacherLongitude:number
}
export default function RollCall({ }: Props) {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        Alert.alert("Thông báo", "Đã xảy ra lỗi")
        return;
    }
    const socketContext = useContext(SocketContext);
    const { subjectId,code } = useLocalSearchParams()
    const { accessToken, user,FCMToken } = authContext;
    const [attends, setAttends] = useState<Attend[]>([])
    const [locationLongitude, setLocationLongitude] = useState<number>(0);
    const [locationLatitude, setLocationLatitude] = useState<number>(0);
    const [absent, setAbsent] = useState<number>(0);
    const [totalRollCall, setTotalRollCall] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        async function getData() {
            setLoading(true);
            const url = `${localHost}/api/v1/cAttend/findBySubject/${subjectId}`
            const res = await get({ url: url, token: accessToken })
            const url2 = `${localHost}/api/v1/subject/${subjectId}/user/${user?.id}/attendRecords`
            const res2 = await get({ url: url2, token: accessToken })

            if (res && res.status == 200 && res2 && res2.status == 200) {
                const listAttend = res.data.cAttends;
                const listReview = res2.data.attendRecords.filter((item: any) => item.status != "KP");
                let totalRollCall = 0;
                let absent = 0;
                const data = listAttend.map((item: any) => {
                    if (item.isActive) {
                        totalRollCall++;
                        let status = "Chưa điểm danh";
                        if (item.timeExpired == 0) {
                            status = "Hết hạn điểm danh";
                        }
                        status = listReview.find((review: any) => review.cAttendId.id == item.id) ? "Đã điểm danh" : status
                        if (status != "Đã điểm danh") {
                            absent++;
                        }
                        return {
                            id: item.id,
                            date: item.date,
                            status: status,
                            sessionNumber: item.sessionNumber,
                            teacherLatitude: item.teacherLatitude,
                            teacherLongitude: item.teacherLongitude
                        }
                    }
                    return null; // Trả về null nếu item không active
                }).filter((item: any) => item !== null).sort((a: Attend, b: Attend) => b.sessionNumber-a.sessionNumber); // Lọc bỏ các item null và sắp xếp giảm dần theo ngày
                setAttends(data)
                setAbsent(absent)
                setTotalRollCall(totalRollCall)
               
            }
            setLoading(false);
        }
        getData()
    }, [])
    //Connect to socket
      useEffect(() => {
        if (socketContext) {
          console.log('socket: ', socketContext.socket.id);
          const { socket } = socketContext;
          if (socket) {
            socket.emit('joinSubject', { userID: user?.id, subjectID: subjectId });
            socket.on('receiveAttendance', (dataMsg: any) => {
                const newAttend = dataMsg.cAttend;
                setAttends((prev) => {
                    const newAttends = prev.map((item) => {
                        if (item.id === newAttend.id) {
                            return {
                                ...item,
                                ...newAttend
                            };
                        }
                        return item;
                    });
                    
                    // If the new attendance record does not exist in the current state, add it
                    const isExisting = prev.some(item => item.id === newAttend.id);
                    if (!isExisting) {
                        setTotalRollCall(totalRollCall + 1);
                        newAttends.unshift(newAttend);
                    }
                    
                    return newAttends;
                });
            });
          }
        }
        return () => {
          if (socketContext) {
            const { socket } = socketContext;
            if (socket) {
              socket.emit('leaveSubject', {
                userID: user?.id,
                subjectID: subjectId
              });
              socket.off('receiveAttendance');
            }
          }
        };
      }, [socketContext]);
    const router = useRouter()
    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Thông báo', 'Cần cấp quyền truy cập vị trí để điểm danh');
            return null;
        }
        let currentLocation = await Location.getCurrentPositionAsync({});
       return{
        longitude:currentLocation.coords.longitude,
        latitude:currentLocation.coords.latitude
       }
    };

    const clickRollCall = async (attend: Attend) => {
        setLoading(true);
        let location = null;
        if(attend.teacherLatitude == 0 && attend.teacherLongitude == 0){
            location = {
                longitude:0,
                latitude:0
            }
        }
        else{
            location = await getLocation();
        }
        if(!location){
            setLoading(false);
            return;
        }

        if (attend.status == "Chưa điểm danh") {
            const url = `${localHost}/api/v1/cAttend/attendrecord/add`
            const data = {
                cAttendId: attend.id,
                studentId: user?.id,
                studentLatitude: location.latitude,
                studentLongitude: location.longitude,
                FCMToken: FCMToken
            }
            const res = await post({ url: url, token: accessToken, data: data })
            if (res && res.status == 201) {
                const record = res.data.attendRecord;
                console.log(record.status)
                if (record.status == "CM") {
                    setAbsent(absent - 1)
                    setAttends(attends.map((item: Attend) => item.id == attend.id ? { ...item, status: "Đã điểm danh" } : item))
                    if(socketContext?.socket){
                        socketContext.socket.emit('sendAttendance', { subjectID: subjectId, student: user?.id });
                    }
                    Alert.alert("Thông báo", "Điểm danh thành công")
                }
                if (record.status == "KP") {
                    Alert.alert("Thông báo", "Điểm danh không thành công")
                }
            }
            if(res?.status!=201){
                Alert.alert("Thông báo", `${res?.data?.message}`)
            }
        }
        setLoading(false);
    }

    return (
        <View>
            <Loading loading={loading} />
           <View className=' shadow-md  pb-[1.8%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
          <TouchableOpacity onPress={router.back}>
            <Ionicons name='chevron-back-sharp' size={24} color='white' />
          </TouchableOpacity>
          <View className='mx-auto items-center pr-6'>
            <Text className='text-[18px] font-msemibold uppercase text-white'>
              {code}
            </Text>
            <Text className='mt-[-3px] text-white font-mmedium'>
              Điểm danh
            </Text>
          </View>
        </View>
        <Text className=' text-center text-base font-semibold mt-[4%]'>Danh sách các buổi học</Text>
            {attends.length>0&&<Text className='font-medium text-blue_primary text-center -mt-[2px]'>Đã vắng {absent}/{totalRollCall} buổi</Text>}
            <ScrollView className='mt-3'>
                {   attends.length==0?<View className='flex-1 items-center justify-center h-full'>
          <Text className='text-gray-500'>Không tìm thấy</Text>
          </View> 
          :
          attends.map((item, index) => (
                    item.status == "Chưa điểm danh" ?
                        <TouchableOpacity key={index} onPress={() => clickRollCall(item)} className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                            <View className='mx-auto items-center justify-center'>
                                <Text>Buổi {item.sessionNumber} - {formatNoWeekday(item.date)}</Text>
                                <Text className='text-[#FE3535] text-base font-mmedium mt-1'>Chưa điểm danh</Text>
                            </View>
                            <FontAwesome6 name="exclamation" size={22} color="#FE3535" />
                        </TouchableOpacity>
                        : (item.status == "Đã điểm danh" ?
                            <View key={index} className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                                <View className='mx-auto items-center justify-center'>
                                    <Text>Buổi {item.sessionNumber} - {formatNoWeekday(item.date)}</Text>
                                    <Text className='text-green text-base font-mmedium mt-1'>Đã điểm danh</Text>
                                </View>
                            </View>
                            :
                            <View key={index} className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                                <View className='mx-auto items-center justify-center'>
                                    <Text>Buổi {item.sessionNumber} - {formatNoWeekday(item.date)}</Text>
                                    <Text className='text-orange text-base font-mmedium mt-1'>Hết hạn điểm danh</Text>
                                </View>
                            </View>
                        )
                ))}
            </ScrollView>
        </View>
    )
}