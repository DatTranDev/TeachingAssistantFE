import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import RatingLayout from "@/components/ui/ratingLayout";
import ButtonCustom from "@/components/ui/ButtonCustom";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import SliderCustom from "@/components/ui/SliderCustom";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { localHost } from "@/utils/localhost";
import { useLocalSearchParams } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import get from "@/utils/get";
import post from "@/utils/post";
import Loading from "@/components/ui/Loading";
import { formatNoWeekday } from "@/utils/formatDate";

type Props = {};

export default function DetailReview({ }: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi")
    return;
  }
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false);
  const { accessToken, user } = authContext;
  const { attendId, date } = useLocalSearchParams();
  const [avgReview, setAvgReview] = useState({
    understandPercent: 0,
    usefulPercent: 0,
    teachingMethodScore: 0,
    atmosphereScore: 0,
    documentScore: 0,
    totalReview: 0,
  })
  const [review, setReview] = useState({
    understandPercent: 70,
    usefulPercent: 50,
    teachingMethodScore: 5,
    atmosphereScore: 5,
    documentScore: 5,
    thinking: "",
  })
  function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',  // Ngày
      month: '2-digit', // Tháng
      year: 'numeric',  // Năm
    };
    const date = new Date(dateString);
    const formattedDate = `${date.toLocaleDateString('vi-VN', options)}`;
    return formattedDate;
  }
  const getData = async () => {
    setLoading(true)
    const url = `${localHost}/api/v1/review/findByCAttend/${attendId}`
    const res = await get({ url: url, token: accessToken })
    if (res && res.status == 200) {
      setData(res.data.reviews)
      // Tính trung bình các thuộc tính
      if (res.data.reviews.length > 0) {
        const avg = {
          understandPercent: res.data.reviews.reduce((sum: number, item: any) => sum + Number(item.understandPercent), 0) / res.data.reviews.length,
          usefulPercent: res.data.reviews.reduce((sum: number, item: any) => sum + Number(item.usefulPercent), 0) / res.data.reviews.length,
          teachingMethodScore: res.data.reviews.reduce((sum: number, item: any) => sum + Number(item.teachingMethodScore), 0) / res.data.reviews.length,
          atmosphereScore: res.data.reviews.reduce((sum: number, item: any) => sum + Number(item.atmosphereScore), 0) / res.data.reviews.length,
          documentScore: res.data.reviews.reduce((sum: number, item: any) => sum + Number(item.documentScore), 0) / res.data.reviews.length,
          totalReview: res.data.reviews.length
        }
        console.log(avg)
        setAvgReview(avg)
      }
    }
    setLoading(false)
  }
  const sendReview = async () => {
    let thinking = review.thinking.trim()
    if(!thinking){
      thinking = " "
    }
    setLoading(true)
    const url = `${localHost}/api/v1/review/add`
    const data = {
      ...review,
      thinking: thinking,
      cAttendId: attendId,
      studentId: user?.id,
    }

    const res = await post({ url: url, data: data, token: accessToken })
    if (res && res.status == 409) {
      Alert.alert("Thông báo", "Không thể gửi đánh giá do trước đó đã đánh giá rồi")
      setLoading(false)
      return;
    }
    if (res && res.status == 201) {
      setVisible(false)
      Alert.alert("Thông báo", "Đánh giá thành công")
      setReview({
        understandPercent: 70,
        usefulPercent: 50,
        teachingMethodScore: 5,
        atmosphereScore: 5,
        documentScore: 5,
        thinking: "",
      });
      await getData();
    } else {
      Alert.alert("Thông báo", "Đã xảy ra lỗi")
    }
    setLoading(false)
  }
  useEffect(() => {
    getData()
  }, [])
  const router = useRouter();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className='flex-1'>
        <Loading loading={loading} />
        <Modal
          visible={visible}
          className='flex-1'
          transparent={true}
          animationType='fade'>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View
              className='flex-1 justify-center items-center z-50 relative'
              style={{ backgroundColor: 'rgba(170, 170, 170, 0.8)' }}>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className='ml-auto mr-[3%] mt-[-8px] mb-1'>
                <FontAwesome name='close' size={28} color='black' />
              </TouchableOpacity>
              <View className='bg-white w-[90%] px-[6%] pt-3 pb-4 rounded-lg'>
                <Text className='text-base font-msemibold mb-3 text-center '>
                  Đánh giá buổi học {formatDate(String(date))}
                </Text>
                <View className='flex-row items-center'>
                  <Text className='text-base font-mregular mr-2'>Tài liệu</Text>
                  <RatingLayout
                    size={23}
                    rating={review.documentScore}
                    style={'gap-[6px]'}
                    changeRating={e =>
                      setReview({ ...review, documentScore: e })
                    }
                    readOnly={false}
                  />
                </View>
                <View className='flex-row items-center'>
                  <Text className='text-base font-mregular mt-2 mr-2'>
                    Không khí lớp học
                  </Text>
                  <RatingLayout
                    rating={review.atmosphereScore}
                    size={23}
                    style={'gap-[6px] mt-1'}
                    changeRating={e =>
                      setReview({ ...review, atmosphereScore: e })
                    }
                    readOnly={false}
                  />
                </View>
                <View className='flex-row items-center'>
                  <Text className='text-base font-mregular mt-2 mr-2'>
                    Phương pháp dạy
                  </Text>
                  <RatingLayout
                    rating={review.teachingMethodScore}
                    size={23}
                    style={'gap-[6px] mt-1'}
                    changeRating={e =>
                      setReview({ ...review, teachingMethodScore: e })
                    }
                    readOnly={false}
                  />
                </View>
                <View className='flex-row items-center'>
                  <Text className='text-base font-mregular mt-2 mr-2'>
                    Mức độ hiểu bài
                  </Text>
                  <SliderCustom
                    minValue={0}
                    maxValue={100}
                    initialValue={review.understandPercent}
                    onValueChange={e =>
                      setReview({ ...review, understandPercent: e })
                    }
                    readonly={false}
                    style='pt-3 w-32'
                  />
                </View>
                <View className='flex-row items-center'>
                  <Text className='text-base font-mregular mt-2 mr-2'>
                    Mức độ hữu ích
                  </Text>
                  <SliderCustom
                    minValue={0}
                    maxValue={100}
                    initialValue={review.usefulPercent}
                    onValueChange={e =>
                      setReview({ ...review, usefulPercent: e })
                    }
                    readonly={false}
                    style='pt-3 w-32'
                  />
                </View>

                <Text className='text-base font-mregular  mt-2 '>Góp ý</Text>
                <View className='w-full bg-[#F5F5F5] mt-3 py-2 px-3 rounded-md'>
                  <TextInput
                    className='text-base leading-[22px] h-[100px]'
                    multiline={true}
                    textAlignVertical='top'
                    numberOfLines={5}
                    value={review.thinking}
                    onChangeText={e => setReview({ ...review, thinking: e })}
                  />
                </View>
                <ButtonCustom
                  handle={() => sendReview()}
                  content='Gửi đánh giá'
                  otherStyle='mt-4 w-[60%]'
                />
              </View>
            </View>
          </GestureHandlerRootView>
        </Modal>
        <View className=' shadow-md  pb-[2%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center '>
          <TouchableOpacity onPress={router.back}>
            <Ionicons name='chevron-back-sharp' size={24} color='white' />
          </TouchableOpacity>
          <View className='mx-auto items-center pr-6'>
            <Text className='text-[18px] font-msemibold uppercase text-white'>
              Đánh giá
            </Text>
            <Text className='mt-[-3px] text-white font-mmedium'>
              {formatNoWeekday(date)}
            </Text>
          </View>
        </View>

        <View className=' bg-white w-[84%] pl-[4%] mx-auto rounded-2xl pt-1 pb-2 gap-y-1 mt-[5%]'>
          <Text className='mt-[-6px] mb-[2px] text-blue_primary text-center'>
            {avgReview.totalReview} đánh giá
          </Text>
          <View className='flex-row items-center'>
            <Text className='text-base font-mregular mr-2'>Tài liệu</Text>
            <RatingLayout
              rating={avgReview.documentScore}
              size={20}
              style={'gap-[6px]'}
              readOnly={true}
            />
          </View>
          <View className='flex-row items-center'>
            <Text className='text-base font-mregular mr-2'>
              Không khí lớp học
            </Text>
            <RatingLayout
              rating={avgReview.atmosphereScore}
              size={20}
              style={'gap-[6px]'}
              readOnly={true}
            />
          </View>
          <View className='flex-row items-center'>
            <Text className='text-base font-mregular mr-2'>
              Phương pháp dạy
            </Text>
            <RatingLayout
              rating={avgReview.teachingMethodScore}
              size={20}
              style={'gap-[6px]'}
              readOnly={true}
            />
          </View>
          <View className='flex-row items-center'>
            <Text className='text-base font-mregular mr-2'>Độ hữu ích</Text>
            <SliderCustom
              minValue={0}
              maxValue={100}
              initialValue={avgReview.usefulPercent}
              readonly={true}
              style='mt-[2px]'
            />
          </View>
          <View className='flex-row items-center'>
            <Text className='text-base font-mregular mr-2'>
              Mức độ hiểu bài
            </Text>
            <SliderCustom
              minValue={0}
              maxValue={100}
              initialValue={avgReview.understandPercent}
              readonly={true}
              style='mt-[2px]'
            />
          </View>
        </View>
        <Text className='ml-[8%] text-base font-msemibold mt-2'>Góp ý</Text>
        <ScrollView className='mt-4'>
          {data.length == 0 ? 
          <Text className='text-base font-medimum text-gray-500 mt-2 text-center'>Không có góp ý</Text> 
          :
            data.map((item: any, index: number) => (
              item.thinking.trim() &&
              <View
                key={index}
                className='bg-white w-[84%] mx-auto px-4 py-2 rounded-[10px] border-[1px] border-gray_line mb-2 rounded-tl-[4px] rounded-br-[4px]'>
                <Text className='text-base'>{item.thinking}</Text>
              </View>
            ))}
        </ScrollView>
        <ButtonCustom
          content='Đánh giá buổi học'
          otherStyle='my-3 w-[84%]'
          handle={() => setVisible(true)}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
