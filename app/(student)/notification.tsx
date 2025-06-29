import { getAPI } from "@/utils/api";
import { View, Text, ScrollView, Alert, TouchableOpacity, RefreshControl } from "react-native";
import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useFocusEffect, useRouter } from "expo-router";
import { localHost } from "@/utils/localhost";  
import get from "@/utils/get";
import { formatNoWeekday } from "@/utils/formatDate";
export type Notification={
    id:string,
    title:string,
    content:string,
    createdAt:string,
    type:string,
}
export type NotificationData={
  id: string,
  notificationId: {
    senderId?: string,
    title: string,
    content: string,
    type?: string,
    referenceModel: string,
    referenceId: string,
    createdAt: string,
    updatedAt?: string,
  },
  receiverId: string,
  isRead: boolean,
  createdAt: string,
  updatedAt?: string,
}

export default function Notification() {
  const router = useRouter();
    const authContext = useContext(AuthContext);
    if (!authContext) {
        Alert.alert('Thông báo', 'Đã xảy ra lỗi');
        return;
    }
    const { user, accessToken } = authContext
    const [notification,setNotification]= useState<NotificationData[]>([])
    const [refreshing, setRefreshing] = useState(false);

    const getNotification= async()=>{
        const url = `${localHost}/api/v1/notification/get`; 
        const token = accessToken;
        const response = await get({url,token})
        if(response)
        {
            if(response.status==200)
            {
                const data = response.data;
                const result = data.notifications.filter((item: NotificationData) => {
                    return item.notificationId != null;
                })
                
                setNotification(result);
            }
            else{
                Alert.alert("Thông báo","Đã xảy ra lỗi, vui lòng thử lại sau !")
            }
        }
    }

    const onRefresh = async () => {
      setRefreshing(true);
      await getNotification();
      setRefreshing(false);
    };

    useFocusEffect(
      useCallback(() => {
        getNotification();
      }, [])
    );
  return (
    <View>
      <View className="bg-blue_primary pb-[3.5%]  border-b-[1px] border-gray-200 ">
        <Text className="mx-auto mt-[13%] text-[18px] font-msemibold text-white uppercase">
          Thông báo
        </Text>
      </View>
      <ScrollView className="mb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notification.length > 0 ? (
          notification.map((item) => (
            <TouchableOpacity 
              className="px-5 py-3 border-b-[0.5px] border-gray-400" 
              key={item.id}
              touchSoundDisabled={true}
              onPress={() => {
                if (item.notificationId.type == "absence_request") {
                  router.push({
                    pathname: "/(studentDetail)/notification/notificationDetail",
                    params: {
                      id: item.notificationId.referenceId,
                      model: item.notificationId.referenceModel,
                    },
                  });
                }
              }}
              disabled={item.notificationId.type == 'absence_request' ? false : true}
              >
              <Text className={`text-base font-msemibold 
              ${item.notificationId.type == 'absent_warning' ? `text-red`:``}
              ${item.notificationId.type == 'absence_request'? `text-orange`:``}`}>{item.notificationId.title}</Text>
            <Text
              className={`text-base  text-gray-500 font-light`}
            >
              {item.notificationId.content}
            </Text>
            <Text className="text-[12px] text-gray-400 font-light">
              {formatNoWeekday(item.notificationId.createdAt)}
            </Text>
          </TouchableOpacity>
        ))
        ) : (
          <View className="flex justify-center items-center mt-4">
            <Text className="text-gray-400">Không có thông báo</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

