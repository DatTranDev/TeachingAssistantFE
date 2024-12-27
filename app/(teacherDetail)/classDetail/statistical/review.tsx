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
import { useFocusEffect, useRouter } from "expo-router";
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
type DetailReview = {
  attendId: string;
  sessionNumber: number;
  date: string;
  understandPercent: number;
  usefulPercent: number;
  teachingMethodScore: number;
  atmosphereScore: number;
  documentScore: number;
  totalReview: number;
};
export default function Review({}: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi");
    return;
  }
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { accessToken, user } = authContext;
  const { attendId, date, code, subjectId } = useLocalSearchParams();
  const [avgReview, setAvgReview] = useState({
    understandPercent: 0,
    usefulPercent: 0,
    teachingMethodScore: 0,
    atmosphereScore: 0,
    documentScore: 0,
    totalReview: 0,
  });
  const [detailReviews, setDetailReviews] = useState<DetailReview[]>([]);
  const getData = async () => {
    setLoading(true);
    const url = `${localHost}/api/v1/cAttend/findBySubject/${subjectId}`;
    const res = await get({ url: url, token: accessToken });
    if (res && res.status == 200) {
      const listAttend: DetailReview[] = res.data.cAttends.map((item: any) => {
        return {
          attendId: item.id,
          sessionNumber: item.sessionNumber,
          date: item.date,
        };
      });
      const updatedListAttend = await Promise.all(
        listAttend.map(async (item: DetailReview) => {
          const url2 = `${localHost}/api/v1/review/findByCAttend/${item.attendId}`;
          const res2 = await get({ url: url2, token: accessToken });
          if (res2 && res2.status == 200) {
            const avg = {
              understandPercent:
                res2.data.reviews.reduce(
                  (sum: number, item: any) =>
                    sum + Number(item.understandPercent),
                  0
                ) / res2.data.reviews.length,
              usefulPercent:
                res2.data.reviews.reduce(
                  (sum: number, item: any) => sum + Number(item.usefulPercent),
                  0
                ) / res2.data.reviews.length,
              teachingMethodScore:
                res2.data.reviews.reduce(
                  (sum: number, item: any) =>
                    sum + Number(item.teachingMethodScore),
                  0
                ) / res2.data.reviews.length,
              atmosphereScore:
                res2.data.reviews.reduce(
                  (sum: number, item: any) =>
                    sum + Number(item.atmosphereScore),
                  0
                ) / res2.data.reviews.length,
              documentScore:
                res2.data.reviews.reduce(
                  (sum: number, item: any) => sum + Number(item.documentScore),
                  0
                ) / res2.data.reviews.length,
              totalReview: res2.data.reviews.length,
            };
            return {
              ...item,
              documentScore: avg.documentScore || 0,
              teachingMethodScore: avg.teachingMethodScore || 0,
              atmosphereScore: avg.atmosphereScore || 0,
              usefulPercent: avg.usefulPercent || 0,
              understandPercent: avg.understandPercent || 0,
              totalReview: res2.data.reviews.length,
            };
          }
          return item; // Trả về item gốc nếu không có dữ liệu
        })
      );
      console.log(updatedListAttend);
      const totalReview = updatedListAttend.reduce(
        (sum: number, item: any) => sum + item.totalReview,
        0
      );
      const avg = {
        understandPercent:
          updatedListAttend.reduce(
            (sum: number, item: any) => sum + Number(item.understandPercent),
            0
          ) / totalReview,
        usefulPercent:
          updatedListAttend.reduce(
            (sum: number, item: any) => sum + Number(item.usefulPercent),
            0
          ) / totalReview,
        teachingMethodScore:
          updatedListAttend.reduce(
            (sum: number, item: any) => sum + Number(item.teachingMethodScore),
            0
          ) / totalReview,
        atmosphereScore:
          updatedListAttend.reduce(
            (sum: number, item: any) => sum + Number(item.atmosphereScore),
            0
          ) / totalReview,
        documentScore:
          updatedListAttend.reduce(
            (sum: number, item: any) => sum + Number(item.documentScore),
            0
          ) / totalReview,
        totalReview: totalReview,
      };
      console.log(avg);
      setAvgReview(avg);
      setDetailReviews(
        updatedListAttend.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    }
    // const url2 = `${localHost}/api/v1/review/findByCAttend/${attendId}`;
    // const res2 = await get({ url: url2, token: accessToken });
    // if (res2 && res2.status == 200) {
    //    setDetailReviews(res2.data.reviews);
    //    // Tính trung bình các thuộc tính
    //    if (res2.data.reviews.length > 0) {
    //       const avg = {
    //          understandPercent:
    //             res2.data.reviews.reduce(
    //                (sum: number, item: any) => sum + Number(item.understandPercent),
    //                0
    //             ) / res2.data.reviews.length,
    //          usefulPercent:
    //             res2.data.reviews.reduce(
    //                (sum: number, item: any) => sum + Number(item.usefulPercent),
    //                0
    //             ) / res2.data.reviews.length,
    //          teachingMethodScore:
    //             res2.data.reviews.reduce(
    //                (sum: number, item: any) =>
    //                   sum + Number(item.teachingMethodScore),
    //                0
    //             ) / res2.data.reviews.length,
    //          atmosphereScore:
    //             res2.data.reviews.reduce(
    //                (sum: number, item: any) => sum + Number(item.atmosphereScore),
    //                0
    //             ) / res2.data.reviews.length,
    //          documentScore:
    //             res2.data.reviews.reduce(
    //                (sum: number, item: any) => sum + Number(item.documentScore),
    //                0
    //             ) / res2.data.reviews.length,
    //          totalReview: res2.data.reviews.length
    //       };
    //       console.log(avg);
    //       setAvgReview(avg);
    //    }
    // }
    setLoading(false);
  };
  const goToDetailReview = (attendId:string,date:string)=>{
    router.push({
      pathname:"/classDetail/teachFeature/review",
      params:{
        attendId:attendId,
        date:date
      }
    });
  }
  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );
  const router = useRouter();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <Loading loading={loading} />
        <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
          <TouchableOpacity onPress={router.back}>
            <Ionicons name="chevron-back-sharp" size={24} color="white" />
          </TouchableOpacity>
          <View className="mx-auto items-center pr-6">
            <Text className="text-[18px] font-msemibold uppercase text-white">
              {code}
            </Text>
            <Text className="mt-[-3px] text-white font-mmedium">Đánh giá</Text>
          </View>
        </View>
        <Text className="ml-[8.5%] text-base font-msemibold mt-[4%]">Tất cả</Text>

        <View className=" bg-white w-[84%] pl-[4%] mx-auto rounded-2xl pt-1 pb-2 gap-y-1 mt-2">
          <Text className="mt-[-6px] mb-[2px] text-blue_primary text-center">
            {avgReview.totalReview} đánh giá
          </Text>
          <View className="flex-row items-center">
            <Text className="text-base font-mregular mr-2">Tài liệu</Text>
            <RatingLayout
              rating={avgReview.documentScore}
              size={20}
              style={"gap-[6px]"}
              readOnly={true}
            />
          </View>
          <View className="flex-row items-center">
            <Text className="text-base font-mregular mr-2">
              Không khí lớp học
            </Text>
            <RatingLayout
              rating={avgReview.atmosphereScore}
              size={20}
              style={"gap-[6px]"}
              readOnly={true}
            />
          </View>
          <View className="flex-row items-center">
            <Text className="text-base font-mregular mr-2">
              Phương pháp dạy
            </Text>
            <RatingLayout
              rating={avgReview.teachingMethodScore}
              size={20}
              style={"gap-[6px]"}
              readOnly={true}
            />
          </View>
          <View className="flex-row items-center">
            <Text className="text-base font-mregular mr-2">Độ hữu ích</Text>
            <SliderCustom
              minValue={0}
              maxValue={100}
              initialValue={avgReview.usefulPercent}
              readonly={true}
              style="mt-[2px]"
            />
          </View>
          <View className="flex-row items-center">
            <Text className="text-base font-mregular mr-2">
              Mức độ hiểu bài
            </Text>
            <SliderCustom
              minValue={0}
              maxValue={100}
              initialValue={avgReview.understandPercent}
              readonly={true}
              style="mt-[2px]"
            />
          </View>
        </View>
        <Text className="ml-[8.5%] text-base font-msemibold mt-2 ">Chi tiết</Text>
        <ScrollView className="mt-2">
          {detailReviews.length == 0 ? (
            <Text className="text-center text-gray-500 font-msemibold mt-5">
              Không có đánh giá
            </Text>
          ) : (
            detailReviews.map((item: DetailReview, index: number) => (
              <View key={index} className="w-[84%]  mx-auto">
               <Text className="ml-[2.5%] text-gray-500">Buổi {item.sessionNumber} - {formatNoWeekday(item.date)}</Text>
                <TouchableOpacity onPress={()=>goToDetailReview(item.attendId,item.date)} className=" bg-white pl-[4%]  rounded-2xl pt-1 pb-2 gap-y-1 mb-2 mt-1">
                  {/* <View className='flex-row items-center mt-[-6px] mb-[2px]'>
                  <Text className=' text-blue_primary text-center'>
                 {item.totalReview} đánh giá
               </Text>
                  </View> */}

                  <View className="flex-row items-center">
                    <Text className="text-base font-mregular mr-2">
                      Tài liệu
                    </Text>
                    <RatingLayout
                      rating={item.documentScore}
                      size={20}
                      style={"gap-[6px]"}
                      readOnly={true}
                    />
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-base font-mregular mr-2">
                      Không khí lớp học
                    </Text>
                    <RatingLayout
                      rating={item.atmosphereScore}
                      size={20}
                      style={"gap-[6px]"}
                      readOnly={true}
                    />
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-base font-mregular mr-2">
                      Phương pháp dạy
                    </Text>
                    <RatingLayout
                      rating={item.teachingMethodScore}
                      size={20}
                      style={"gap-[6px]"}
                      readOnly={true}
                    />
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-base font-mregular mr-2">
                      Độ hữu ích
                    </Text>
                    <SliderCustom
                      minValue={0}
                      maxValue={100}
                      initialValue={item.usefulPercent}
                      readonly={true}
                      style="mt-[2px]"
                    />
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-base font-mregular mr-2">
                      Mức độ hiểu bài
                    </Text>
                    <SliderCustom
                      minValue={0}
                      maxValue={100}
                      initialValue={item.understandPercent}
                      readonly={true}
                      style="mt-[2px]"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
