import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import RatingLayout from "@/components/ui/ratingLayout";
import SliderCustom from "@/components/ui/SliderCustom";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { localHost } from "@/utils/localhost";
import { useLocalSearchParams } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import get from "@/utils/get";
import Loading from "@/components/ui/Loading";
import UserStatCard from "@/components/ui/UserStatCard";
import { formatNoWeekday } from "@/utils/formatDate";

type Props = {};
type Absentee = {
  totalAbsences: number;
  user: {
    _id: string;
    name: string;
    email: string;
  }
}

export default function Absence({ }: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi");
    return;
  }
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topAbsentees, setTopAbsentees] = useState<Absentee[]>([]);
  const { accessToken, user } = authContext;
  const { attendId, date, code, subjectId } = useLocalSearchParams();
  const getTopAbsentees = async () => {
    const url = `${localHost}/api/v1/subject/top-absentees/${subjectId}?top=10`;
    const token = accessToken;
    setLoading(true);
    const response = await get({ url, token });
    setLoading(false);
    if (response) {
      if (response.status === 200) {
        const data = response.data;
        setTopAbsentees(data.topAbsentStudents ? data.topAbsentStudents : []);
      } else {
        Alert.alert("Thông báo", "Đã xảy ra lỗi");
      }
    } else {
      Alert.alert("Thông báo", "Đã xảy ra lỗi");
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      getTopAbsentees();
    }, [])
  );
  const router = useRouter();
  const renderEmpty = () => (
    <View className="items-center py-10">
      <Text className="text-gray-500 italic">No data available</Text>
    </View>
  );
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
            <Text className="mt-[-3px] text-white font-mmedium">Thống kê vắng mặt</Text>
          </View>
        </View>
        
        <ScrollView className="mx-4 my-4" showsVerticalScrollIndicator={false}>{
          topAbsentees.length > 0
            ? topAbsentees.map((item, i) => (
              <UserStatCard
                user={item.user}
                type='absences'
                key={item.user._id}
                value={item.totalAbsences}
                top={i + 1}
              />
            ))
            : renderEmpty()
        }</ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
