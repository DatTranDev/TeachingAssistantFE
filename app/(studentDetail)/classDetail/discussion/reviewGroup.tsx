import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Modal,
  Linking,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
// import { icons } from "@constants";
// import { styles } from "./mainRoom.style";
import { Question } from "@/components/student/question";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import mime from "react-native-mime-types";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import post from "@/utils/post";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import { SocketContext } from "@/context/SocketContext";
import get from "@/utils/get";
import Loading from "@/components/ui/Loading";
import Feather from "@expo/vector-icons/Feather";
import {
  AntDesign,
  EvilIcons,
  FontAwesome6,
  Ionicons,
} from "@expo/vector-icons";
import { localHost } from "@/utils/localhost";
import { colors } from "@/constants/colors";
import patch from "@/utils/patch";
import { MessageGroup } from "@/components/student/chat/messageGroup";
import ButtonCustom from "@/components/ui/ButtonCustom";
import deleteApi from "@/utils/delete";

export type Message = {
  _id: string;
  subjectId: string;
  content: string;
  senderId: {
    name: string;
    userCode: string;
    role: string;
    avatar: string;
    id: string;
  };
  createdAt: string;
  type: string;
  isRevoked: boolean;
  updatedAt: string;
  __v: string;
  id: string;
};

type FormatName = {
  id: string;
  number: number;
};
export default function ReviewGroup() {
  const authContext = useContext(AuthContext);
  const socketContext = useContext(SocketContext);
  const router = useRouter();
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const { subjectId, name, code, group } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isUploading, setUploading] = useState(false);
  const isFocused = useIsFocused();
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [checkScroll, setcheckScroll] = useState(true);
  const [hostId, setHostId] = useState<string>("");
  const [showMenu, setShowMenu] = useState(false);
  const [positionMenu, setPositionMenu] = useState({
    x: 0,
    y: 0,
  });
  const [visibleQR, setVisibleQR] = useState(false);
  const [joinCode, setJoinCode] = useState(JSON.parse(String(group)).id);
  const [myGroup, setMyGroup] = useState<any>(JSON.parse(String(group)));
  const [showMember, setShowMember] = useState(false);
  const handleLoadMore = async () => {
    setPage(page + 1);
  };
  const onRefresh = () => {
    setRefreshing(true);
    handleLoadMore().then(() => setRefreshing(false));
  };
  useEffect(() => {
    setPage(0);
  }, [isFocused]);
  useEffect(() => {
    loadMessage();
  }, []);
  useEffect(() => {
    // Lắng nghe sự kiện bàn phím
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // Thực hiện hành động khi bàn phím xuất hiện
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );
    // Xóa bỏ lắng nghe khi component bị unmount
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);
  //Connect to socket
  useEffect(() => {
    if (socketContext) {
      console.log("socket: ", socketContext.socket.id);
      const { socket } = socketContext;
      if (socket) {
        socket.emit("joinSubject", { userID: user?.id, subjectID: subjectId });
        socket.on("receiveSubjectMessage", (message: Message) => {
          if (message.senderId.id != user?.id)
            setMessageList((prevList) => [...prevList, message]);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      }
    }
    return () => {
      if (socketContext) {
        const { socket } = socketContext;
        if (socket) {
          socket.emit("leaveSubject", {
            userID: user?.id,
            subjectID: subjectId,
          });
          socket.off("receiveSubjectMessage");
        }
      }
    };
  }, [socketContext]);

  const formatTimeMessage = (time: Date) => {
    const hours = Math.floor(time.getHours());
    const minutes = Math.floor(time.getMinutes());
    const formattedMinutes = String(minutes).padStart(2, "0");
    let formattedHours = String(hours).padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const formattedDate = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")} ${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
    return formattedDate;
  };
  const checkTimeDifference = (dateTime1: Date, dateTime2: Date) => {
    const diff = Math.abs(dateTime2.getTime() - dateTime1.getTime()); // Lấy giá trị tuyệt đối của hiệu hai thời điểm

    // Chuyển đổi từ milliseconds sang phút
    const diffMinutes = Math.floor(diff / (1000 * 60)); // 1000 milliseconds = 1 giây, 60 giây = 1 phút

    // Kiểm tra nếu hiệu của hai thời điểm lớn hơn 10 phút
    return diffMinutes > 5;
  };
  const recallMessage = async (Id: string) => {
    setMessageList((prevList) =>
      prevList.map((item) =>
        item._id === Id ? { ...item, isRevoked: true } : item
      )
    );
  };

  const renderMessage = () => {
    const list: JSX.Element[] = [];
    const totalMessages = messageList.length;
    if (totalMessages === 0) {
      return (
        <Text className="mx-auto text-base text-blue_primary mt-[80%]">
          Thảo luận cùng nhau tại đây !
        </Text>
      );
    }

    const start =
      totalMessages >= page * 4 + 15 ? totalMessages - (page * 4 + 15) : 0;

    for (let i = start; i < totalMessages; i++) {
      let sender = "";
      const currentQuestion = messageList[i];
      const time = new Date(currentQuestion.createdAt);

      // Hiển thị ngày nếu cần
      if (i > 0) {
        const previousQuestionTime = new Date(messageList[i - 1].createdAt);
        if (previousQuestionTime.getDate() !== time.getDate()) {
          list.push(
            <Text
              key={formatDateTime(currentQuestion.createdAt)}
              className="bg-[#BBB3B3] rounded-[10px] py-[3px] max-w-[200px] font-semibold text-[10px] mt-[15px] mb-[15px] mx-auto text-white px-[7px]"
            >
              {formatDateTime(currentQuestion.createdAt)}
            </Text>
          );
        }
      }
      sender = currentQuestion.senderId.id === user?.id ? "My message" : "";
      // Xử lý ẩn danh
      if (!sender) {
        if (
          i === 0 ||
          (i > 0 &&
            (currentQuestion.senderId.id !== messageList[i - 1].senderId.id ||
              time.getDate() !==
                new Date(messageList[i - 1].createdAt).getDate()))
        ) {
          list.push(
            <Text
              key={i}
              className="mr-auto ml-10 -mb-[2px] mt-1 text-gray-500 text-[12px]"
            >
              {currentQuestion.senderId.name} -{" "}
              {currentQuestion.senderId.userCode}
            </Text>
          );
        }
      }
      // Xử lý hiển thị câu hỏi
      const isSameSender =
        i + 1 < totalMessages &&
        currentQuestion.senderId.id === messageList[i + 1].senderId.id &&
        time.getDate() == new Date(messageList[i + 1].createdAt).getDate();
      let shouldDisplayTime =
        i < totalMessages - 1 &&
        checkTimeDifference(time, new Date(messageList[i + 1].createdAt));
      //Tin nhắn cuối cùng luôn hiển thị thời gian
      if (i == totalMessages - 1) {
        shouldDisplayTime = true;
      }

      list.push(
        <MessageGroup
          key={currentQuestion._id}
          Id={currentQuestion._id}
          IsRecall={currentQuestion.isRevoked}
          User={sender}
          Content={currentQuestion.content}
          Time={shouldDisplayTime ? formatTimeMessage(time) : ""}
          Avatar={isSameSender ? "no" : currentQuestion.senderId.avatar}
          Type={currentQuestion.type}
          HandleRecall={recallMessage}
        />
      );
    }

    return list;
  };

  const loadMessage = async () => {
    setLoading(true);
    const url = `${localHost}/api/v1/group/${myGroup.id}/message?page=1&limit=1000`;
    const response = await get({ url: url, token: accessToken });
    if (response) {
      if (response.status == 200) {
        const list = await response.data.groupMessages.reverse();
        console.log("list: ",list)
        setMessageList(
          list.map((item: any) => ({
            _id: item._id,
            content:
              item.images.length > 0 && item.images[0] != ""
                ? item.images[0]
                : item.content,
            senderId: item.senderId,
            createdAt: item.createdAt,
            type:
              item.images.length > 0 && item.images[0] != "" ? "image" : "text",
            isRevoked: item.isRevoked,
          }))
        );
      }
    }
    setLoading(false);
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View className="justify-center h-full flex-1 w-full ">
        <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center">
          <TouchableOpacity onPress={router.back}>
            <Ionicons name="chevron-back-sharp" size={24} color="white" />
          </TouchableOpacity>
          <View className="mx-auto items-center">
            <Text className="text-[18px] font-msemibold uppercase text-white">
              {code}
            </Text>
            <Text className="mt-[-3px] text-white font-mmedium">
              {myGroup.name}
            </Text>
          </View>
        </View>
        <LinearGradient
          className="h-[1.2px] bg-[#F7F7F7]"
          colors={["#C0BDBD", "#ffffff"]}
        />
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              size="large"
              color={colors.blue_primary}
              animating={true}
            />
          </View>
        ) : (
          <ScrollView
            className="flex-1 w-full"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              alignItems: "flex-end",
              paddingVertical: 0,
              paddingHorizontal: "0.5%",
            }}
            onContentSizeChange={(contentWidth, contentHeight) => {
              if (checkScroll) {
                scrollViewRef?.current?.scrollToEnd({ animated: true });
                setcheckScroll(false);
              }
            }}
            ref={scrollViewRef}
            onScroll={({ nativeEvent }) => {
              // if (nativeEvent.contentOffset.y <= 0.5) {
              //   handleLoadMore();
              // }
            }}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderMessage()}
          </ScrollView>
        )}
        <LinearGradient className="h-[1px]" colors={["#fafafa", "#d6d4d4"]} />

        <Loading loading={isUploading} />
        <Modal
          animationType="fade"
          transparent={true}
          visible={showMenu}
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            className="flex-1"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            onPress={() => setShowMenu(false)}
          >
            <View
              className=" bg-white pl-3 rounded-md w-fit h-fit mx-auto pr-8 gap-y-1 pb-3 pt-1 absolute "
              style={{
                top: positionMenu.y,
                left: positionMenu.x - 135,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setVisibleQR(true);
                  setShowMenu(false);
                }}
              >
                <Text className="font-mmedium text-base">Mã tham gia</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowMember(true);
                  setShowMenu(false);
                }}
              >
                <Text className="font-mmedium text-base">Thành viên</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        
      </View>
    </KeyboardAvoidingView>
  );
}
