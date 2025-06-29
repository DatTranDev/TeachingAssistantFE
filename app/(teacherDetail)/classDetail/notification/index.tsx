import {
  FontAwesome5,
  FontAwesome6,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
type Props = {};

export default function Notification({}: Props) {
  const { code, name, subjectId } = useLocalSearchParams();
    const cancellation = () => {
      router.push({
        pathname: `/(teacherDetail)/classDetail/notification/cancellation`,
        params: { code, name, subjectId },
      });
    };
    const reschedule = () => {
      router.push({
        pathname: `/(teacherDetail)/classDetail/notification/reschedule`,
        params: { code, name, subjectId },
      });
    };
  return (
    <SafeAreaView>
      <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-auto items-center pr-6">
          <Text className="text-[18px] font-msemibold uppercase text-white">
            {code}
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">Thông báo</Text>
        </View>
      </View>
      <View>
        <TouchableOpacity
          onPress={cancellation}
          className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-[10%]"
        >
          <FontAwesome6 name="ban" size={24} color="black" />
          <Text className="text-base font-msemibold ml-4 mr-auto ">
            Thông báo nghỉ học
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={reschedule}
          className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-3"
        >
          <FontAwesome6 name="calendar-check" size={24} color="black" />
          <Text className="text-base font-msemibold ml-4 mr-auto">
            Thông báo học bù
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
