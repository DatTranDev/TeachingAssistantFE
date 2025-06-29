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
import { formatNoWeekday } from "@/utils/formatDate";

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
export default function RandomGroup() {
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
    let numberName = 0;

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
        setMessageList(
          list.map((item: any) => ({
            _id: item._id,
            content: item.images.length > 0 && item.images[0] != "" ? item.images[0] : item.content,
            senderId: item.senderId,
            createdAt: item.createdAt,
            type: item.images.length > 0 && item.images[0] != "" ? "image" : "text",
            isRevoked: item.isRevoked,
          }))
        );
      }
    }
    setLoading(false);
  };

  const sendMessage = async (Type: string, Content: string) => {
    if (!Content || Content == "") {
      Content = message;
      setMessage("");
    }

    const dataPost = {
      groupId: `${myGroup.id}`,
      senderId: `${user?.id}`,
      content: Type == "text" ? Content : "",
      images: Type == "image" ? Content : "",
    };
    console.log("dataPost: ", dataPost);
    if (user) {
      const msg: Message = {
        _id: "",
        subjectId: `${subjectId}`,
        content: Content,
        senderId: {
          name: user.name,
          userCode: user.userCode,
          role: user.role,
          avatar: user.avatar,
          id: user.id,
        },
        createdAt: `${new Date().toISOString()}`,
        type: Type,
        isRevoked: false,
        updatedAt: `${new Date().toISOString()}`,
        __v: "0",
        id: "",
      };
      const url = `${localHost}/api/v1/group/message/create`;

      const response = await post({
        url: url,
        data: dataPost,
        token: accessToken,
      });

      if (response) {
        if (response.status == 201) {
          msg.id = response.data.groupMessage.id;
          msg._id = response.data.groupMessage._id;
          setMessageList((prevList) => [...prevList, msg]);
          if (socketContext?.socket) {
            const dataMsg = {
              title: `${name}`, //Tên môn học
              body: Type == "text" ? msg.content : "Đã gửi một ảnh", //Nội dung tin nhắn
              type: "message", //Loại tin nhắn
              senderId: user.id, //ID người gửi
              sender: "Ẩn danh", //Tên người gửi
              subject: `${name}`, //Tên môn học
              room: "", //Phòng học
            };
            socketContext.socket.emit("sendMessageToSubject", {
              subjectID: subjectId,
              message: msg,
              dataMsg: dataMsg,
            });
          }
        }

        if (response.status != 201) {
          Alert.alert("Thông báo", "Không thể gửi tin nhắn !");
          return false;
        }
      } else {
        Alert.alert("Thông báo", "Không thể gửi tin nhắn !");
        return false;
      }
    }
  };

  const uploadImage = async (imageUri: string, name: string) => {
    const formData = new FormData();
    const extension = imageUri.split(".").pop();
    if (extension) {
      const type = mime.lookup(extension);
      if (type) {
        formData.append("image", {
          uri: imageUri,
          type: type || "image/jpeg", // Mặc định là JPEG nếu không xác định được loại
          name: name || "photo.jpg",
        } as any);
      }
    }
    const url = `${localHost}/api/v1/upload/image`;
    try {
      const response = await post({
        url: url,
        token: accessToken,
        data: formData,
      });
      if (response) {
        if (response.status == 200) {
          const json = await response.data;
          return json.image;
        } else {
          Alert.alert("Thông báo", "Không thể gửi");
          return false;
        }
      }
      return false;
    } catch (error) {
      Alert.alert("Thông báo", "Không thể gửi");
      return false;
    }
  };
  const handleChooseImage = async () => {
    let image = [];
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: false,
      quality: 0.4,
    });
    if (!result.canceled) {
      setUploading(true);
      const listImage = Array.from(result.assets);
      for (let i = 0; i < listImage.length; i++) {
        const currentTime = new Date();
        const timestamp = currentTime.getTime();
        let imageUri = await uploadImage(
          listImage[i].uri,
          "" + timestamp + user?.id
        );
        if (imageUri) {
          image.push(imageUri);
        }
      }
      const Image = image.join(" ");
      // setMessage(Image);
      if (image.length > 0) await sendMessage("image", Image);
      // setMessage('');
      setUploading(false);
    }
  };
  const handleCamera = async () => {
    let image;
    let result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.back,
      allowsEditing: false,
      quality: 0.2,
    });
    if (!result.canceled) {
      setUploading(true);
      image = result.assets;
      const currentTime = new Date();
      const timestamp = currentTime.getTime();
      const imageUrl = await uploadImage(
        image[0].uri,
        "" + timestamp + user?.id
      );
      if (imageUrl) {
        sendMessage("image", imageUrl);
        setMessage("");
      }
      setUploading(false);
    }
  };
  //send
  const handlesendQuestion = async () => {
    setcheckScroll(true);
    await sendMessage("text", "");
  };
  const redirectReviewGroup = async () => {
    if(!myGroup.reviewedBy || !myGroup.reviewedBy.id || !myGroup.reviewedBy.name)
    {
      setShowMenu(false);
      Alert.alert("Thông báo", "Nhóm chưa được phân công chấm bài!");
      return;
    }
    router.push({
      pathname: "/(studentDetail)/classDetail/discussion/reviewGroup",
      params: {
        subjectId: subjectId,
        name: name,
        code: code,
        group: JSON.stringify(myGroup.reviewedBy),
      },
    });
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
              {myGroup.name}
            </Text>
            <Text className="mt-[-3px] text-white font-mmedium">
              Buổi {myGroup.cAttend.sessionNumber} -{" "}
              {formatNoWeekday(myGroup.cAttend.date)}
            </Text>
          </View>
          <TouchableOpacity
            className=""
            onLayout={(event) => {
              const { x, y } = event.nativeEvent.layout;
              setPositionMenu({
                x,
                y,
              });
            }}
            onPress={() => {
              setShowMenu(true);
            }}
          >
            <AntDesign name="exclamationcircleo" size={22} color="white" />
          </TouchableOpacity>
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
        <View className="h-[60px] w-[90%] ml-[5%] justify-center items-center flex-row">
          {
            <View className="flex-1 border rounded-3xl px-[10px] border-[#E6E6E6] p-[5px]">
              <TextInput
                value={message}
                onChangeText={(e) => setMessage(e)}
                multiline={true}
                placeholder="Message"
              />
            </View>
          }

          {message.trim().length > 0 ? (
            <TouchableOpacity onPress={handlesendQuestion}>
              <Feather
                name="send"
                size={26}
                color="gray"
                style={{ marginLeft: 9, marginTop: 3 }}
              />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={handleCamera}>
                <Feather
                  name="camera"
                  size={27}
                  color="#767676"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChooseImage}>
                <FontAwesome6
                  name="image"
                  size={24}
                  color="#767676"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
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
                  setShowMember(true);
                  setShowMenu(false);
                }}
              >
                <Text className="font-mmedium text-base">Thành viên</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={redirectReviewGroup}>
                <Text className="font-mmedium text-base">Chấm điểm</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        {/* modal qr code */}
        <Modal
          visible={visibleQR}
          transparent={true}
          onRequestClose={() => setVisibleQR(false)}
        >
          <View
            className="relative p-0 m-0 w-full h-full"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            <View className="flex-row absolute top-2 right-3 z-50">
              <TouchableOpacity
                className="ml-auto bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
                onPress={() => setVisibleQR(false)}
              >
                <AntDesign name="close" size={23} color="red" />
              </TouchableOpacity>
            </View>
            <View className="w-full h-[85%] my-auto">
              <Image
                className="w-[90%] h-[90%] mx-auto"
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${joinCode}`,
                }}
                style={{ resizeMode: "contain" }}
              />
              <Text className="mx-auto text-white text-2xl">{joinCode}</Text>
            </View>
          </View>
        </Modal>
        {/* modal thanh vien */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showMember}
          onRequestClose={() => setShowMember(false)}
        >
          <View
            className="flex-1 justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <TouchableOpacity
              className="ml-auto mr-3 -mb-1"
              onPress={() => setShowMember(false)}
            >
              <Ionicons name="close" size={26} color="red" />
            </TouchableOpacity>

            <View className="mt-2 bg-white p-2 rounded-xl w-[90%] mx-auto px-4 pb-3">
              <Text className="text-base font-semibold text-center">
                {myGroup.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-base ml-1">Thành viên</Text>
              </View>
              <ScrollView className="max-h-[240px] pb-1">
                {myGroup.members.map((member: any) => (
                  <View
                    key={member.id}
                    className="bg-gray-200 rounded-xl py-2 px-4 mt-2"
                  >
                    <Text className={`text-base ${member.id === myGroup.admin ? "text-red" : ""}`}>
                      {member.userCode} - {member.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}
