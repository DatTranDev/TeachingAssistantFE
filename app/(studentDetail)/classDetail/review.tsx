import React, { useContext, useEffect, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';
import { localHost } from '@/utils/localhost';
import { useLocalSearchParams } from 'expo-router';
import get from '@/utils/get';
type Props = {}
export type Review={
    attendId:string,
    date:string,
    reviewed:boolean
}
export default function Review({ }: Props) {
    const authContext = useContext(AuthContext);  
    if (!authContext) {
      Alert.alert("Thông báo", "Đã xảy ra lỗi")
      return;
    }
    const {accessToken,user}=authContext;
    const [listReview,setListReview]=useState<Review[]>([])
    const router=useRouter()
    const {subjectId}=useLocalSearchParams()
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
        const formattedDate = `${date.toLocaleDateString('vi-VN', options)}`;
        return formattedDate;
      }
      
    useEffect(()=>{
        async function getData () {
            const url=`${localHost}/api/v1/cAttend/findBySubject/${subjectId}`
            const res= await get({url:url,token:accessToken})
            const url2=`${localHost}/api/v1/subject/${subjectId}/user/${user?.id}/reviews`
            const res2= await get({url:url2,token:accessToken})
            console.log(res2)
            if(res && res.status==200 && res2 && res2.status==200){
                const listAttend=res.data.cAttends;
                const listReview=res2.data.reviews;
                const data= listAttend.map((item:any)=>({
                    attendId:item.id,
                    date:item.date,
                    reviewed:listReview.find((review:any)=>review.cAttendId.id==item.id)
                }))
                setListReview(data)
            }
                        
            }
            getData()
    },[])
    const clickReview=(attendId:string,date:string)=>{
        router.push({
            pathname: '/(studentDetail)/classDetail/detailReview', 
            params: {
                attendId:attendId,
                date:date
            },
          });
    }

    return (
        <SafeAreaView className='flex-1'>
            <View className=' pb-[1.5%]  border-b-[1px] border-gray-200 flex-row  pt-[12%] px-[4%] items-center mr-6 '>
                <TouchableOpacity onPress={router.back}>
                    <Ionicons name="chevron-back-sharp" size={24} color="black" />
                </TouchableOpacity>
                <View className='mx-auto items-center'>
                    <Text className='text-[18px] font-msemibold uppercase'>SE310.P12</Text>
                    <Text className='mt-[-3px]'>Đánh giá</Text>
                </View>
            </View>
            <ScrollView className='mt-6'>
            {listReview.map((item,index)=>{
                        return(
                            !item.reviewed?
                            <TouchableOpacity key={index} onPress={()=>clickReview(item.attendId,item.date)} className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                                <View className='mx-auto items-center justify-center'>
                                    <Text>{formatDate(item.date)}</Text>
                                    <Text className='text-[#FE3535] text-base font-mmedium mt-1'>Chưa đánh giá</Text>
                                </View>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity key={index} onPress={()=>clickReview(item.attendId,item.date)} className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                                <View className='mx-auto items-center justify-center'>
                                <Text>{formatDate(item.date)}</Text>
                                    <Text className='text-green text-base font-mmedium mt-1'>Đã đánh giá</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                {/* <TouchableOpacity onPress={()=>clickReview()} className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                    
                    <View className='mx-auto items-center justify-center'>
                        <Text>Thứ 6, 18/05/2024</Text>
                        <Text className='text-[#FE3535] text-base font-mmedium mt-1'>Chưa đánh giá</Text>
                    </View>
                    <FontAwesome6 name="exclamation" size={22} color="#FE3535" />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>clickReview()} className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                    <View className='mx-auto items-center justify-center'>
                        <Text>Thứ 6, 18/05/2024</Text>
                        <Text className='text-green text-base font-mmedium mt-1'>Đã đánh giá</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity className='flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3'>
                    <View className='mx-auto items-center justify-center'>
                        <Text>Thứ 6, 18/05/2024</Text>
                        <Text className='text-orange text-base font-mmedium mt-1'>Hết hạn đánh giá</Text>
                    </View>
                </TouchableOpacity> */}

            </ScrollView>
        </SafeAreaView>
    )
}