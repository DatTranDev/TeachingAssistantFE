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

export default function Statistical({}: Props) {
  const { code, name, subjectId } = useLocalSearchParams();
  const rollCall = () => {
    router.push({
      pathname: `/(teacherDetail)/classDetail/statistical/rollCall`,
      params: { code, name, subjectId },
    });
  };
  const review = () => {
    router.push({
      pathname: `/(teacherDetail)/classDetail/statistical/review`,
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
          <Text className="mt-[-3px] text-white font-mmedium">Thống kê</Text>
        </View>
      </View>
      <View>
        <TouchableOpacity
          onPress={rollCall}
          className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-[10%]"
        >
          <FontAwesome6 name="calendar-check" size={24} color="black" />
          <Text className="text-base font-msemibold ml-4 mr-auto">
            Tổng hợp điểm danh
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={review}
          className="flex-row items-center bg-white w-[94%] mx-auto px-[7%] py-4 rounded-2xl mt-3"
        >
          <Foundation name="clipboard-pencil" size={24} color="black" />
          <Text className="text-base font-msemibold ml-4 mr-auto">
            Tổng hợp đánh giá
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
