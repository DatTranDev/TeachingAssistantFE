import { TouchableOpacity, Text, View } from "react-native";

import { AntDesign, FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native";
import { formatNoWeekday } from "@/utils/formatDate";

export default function MenuAttendance() {
  const { subjectId, name, code, date, sessionNumber, attendId } = useLocalSearchParams();
  const rollCall = async () => {
    router.push({
      pathname: "/classDetail/teachFeature/attendance/rollCall",
      params: {
        subjectId: subjectId,
        name: name,
        code: code,
        date: date,
        sessionNumber: sessionNumber,
        attendId: attendId,
      },
    });
  };
  const absence = async () => {
    router.push({
      pathname: "/classDetail/teachFeature/attendance/absence",
      params: {
        subjectId: subjectId,
        name: name,
        code: code,
        date: date,
        sessionNumber: sessionNumber,
        attendId: attendId,
      },
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
          <Text className="mt-[-3px] text-white font-mmedium">
            Chuyên cần
          </Text>
        </View>
      </View>
      <View>
        <TouchableOpacity
          onPress={rollCall}
          className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-[8%] "
        >
          <FontAwesome6 name="calendar-check" size={24} color="black" />
          <Text className="text-base font-msemibold ml-4 mr-auto">
            Điểm danh
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={absence}
          className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-3 "
        >
          <MaterialCommunityIcons
            name="newspaper-variant-outline"
            size={24}
            color="black"
          />
          <Text className="text-base font-msemibold ml-4 mr-auto">
            Giấy phép
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

