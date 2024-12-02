import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, KeyboardAvoidingView, TextInput, Modal, Linking, ActivityIndicator, Alert, Keyboard } from 'react-native';
// import { icons } from "@constants";
// import { styles } from "./mainRoom.style";
import { Question } from '@/components/student/question';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import mime from 'react-native-mime-types';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import post from '@/utils/post';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { AuthContext } from '@/context/AuthContext'
import { SocketContext } from '@/context/SocketContext'
import get from '@/utils/get';
import Loading from '@/components/ui/Loading';
import Feather from '@expo/vector-icons/Feather';
import { EvilIcons, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { localHost } from '@/utils/localhost';


export type Question = {
  _id: string,
  subjectId:string,
  content: string,
  studentId: string,
  createdAt: string,
  type: string,
  isResolved: boolean,
  updatedAt: string,
  __v: string,
  id: string,
  
}

type FormatName={
  id:string,
  number:number
}
export default function GeneralRoom() {
  const authContext = useContext(AuthContext);
  const socketContext = useContext(SocketContext);
  const router = useRouter()
  if (!authContext) {
    return;
  }
  const { user,accessToken } = authContext;
  const [listFormat,setListFormat]=useState<FormatName[]>([])
  const { subjectId } = useLocalSearchParams();
  const [numberName,setNumberName]=useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isUploading, setUploading] = useState(false);
  const isFocused = useIsFocused();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkScroll, setcheckScroll] = useState(true);
  const handleLoadMore = async () => {
    setPage(page + 1);
  };
  const onRefresh = () => {
    setRefreshing(true);
    handleLoadMore().then(() => setRefreshing(false));
  };
  //Connect to socket
  useEffect(() => {
    if (socketContext) {
      console.log('socket: ', socketContext.socket.id);
      const { socket } = socketContext;
      if (socket) {
        socket.emit('joinSubject', { userID: user?.id,subjectID: subjectId });
        socket.on('receiveSubjectMessage', (message: Question) => {
          if(message.studentId!=user?.id)
            setQuestionList((prevList) => [...prevList, message]);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      }
    }
    return () => {
      if (socketContext) {
        const { socket } = socketContext;
        if (socket) {
          socket.emit('leaveSubject', { userID: user?.id,subjectID: subjectId });
          socket.off('receiveSubjectMessage');
        }
      }
    };
  }, [socketContext]);


  useEffect(() => {
    setPage(0);
  }, [isFocused])
  useEffect(() => {
    loadQuestion();
  }, []);
  useEffect(() => {
    // Lắng nghe sự kiện bàn phím
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Thực hiện hành động khi bàn phím xuất hiện
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    // Xóa bỏ lắng nghe khi component bị unmount
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);


  const formatTimeQuestion = (time: Date) => {
    const hours = Math.floor(time.getHours());
    const minutes = Math.floor(time.getMinutes());
    const formattedMinutes = String(minutes).padStart(2, '0');
    let formattedHours = String(hours).padStart(2, '0');


    return `${formattedHours}:${formattedMinutes}`;
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const formattedDate = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    return formattedDate;
  };
  const checkTimeDifference = (dateTime1: Date, dateTime2: Date) => {
    const diff = Math.abs(dateTime2.getTime() - dateTime1.getTime()); // Lấy giá trị tuyệt đối của hiệu hai thời điểm

    // Chuyển đổi từ milliseconds sang phút
    const diffMinutes = Math.floor(diff / (1000 * 60)); // 1000 milliseconds = 1 giây, 60 giây = 1 phút

    // Kiểm tra nếu hiệu của hai thời điểm lớn hơn 10 phút
    return diffMinutes > 5;
  };
 
  const renderQuestion = () => {
    const list: JSX.Element[] = [];
    const totalMessages = questionList.length;
  
    if (totalMessages === 0) {
      return (
        <Text style={{ marginHorizontal: "auto", marginVertical: "auto", fontSize: 18, color: "#FF9400", marginTop: "80%" }}>
          Gửi thắc mắc của bạn tại đây!
        </Text>
      );
    }
  
    const start = totalMessages >= (page * 4 + 15) ? totalMessages - (page * 4 + 15) : 0;
  
    for (let i = start; i < totalMessages; i++) {
      let sender = '';
      const currentQuestion = questionList[i];
      const time = new Date(currentQuestion.createdAt);
  
      // Hiển thị ngày nếu cần
      if (i > 0) {
        const previousQuestionTime = new Date(questionList[i - 1].createdAt);
        if (previousQuestionTime.getDate() !== time.getDate()) {
          list.push(
            <Text key={formatDateTime(currentQuestion.createdAt)} className="bg-[#BBB3B3] rounded-[10px] py-[3px] max-w-[200px] font-semibold text-[10px] mt-[15px] mb-[15px] mx-auto text-white px-[7px]">
              {formatDateTime(currentQuestion.createdAt)}
            </Text>
          );
        }
      }
  
      sender = currentQuestion.studentId === user?.id ? "My message" : "";
      // Xử lý ẩn danh
      if(!sender)
      {
        if (i === 0 || (i > 0 && (currentQuestion.studentId !== questionList[i - 1].studentId || time.getDate()!==new Date(questionList[i-1].createdAt).getDate()))) {
          const formatName = listFormat.find((item) => item.id === currentQuestion.studentId);
          if (formatName) {
            list.push(<Text key={`${formatName.number}${i}`} className='mr-auto ml-9'>Ẩn danh {formatName.number}</Text>);
          } else {
            const num=numberName + 1;
            listFormat.push({ id: currentQuestion.studentId, number: numberName + 1 });
            setNumberName(numberName + 1);
            list.push(<Text key={num} className='mr-auto ml-9'>Ẩn danh {num}</Text>);
          }
        }
      }
      
  
      // Xử lý hiển thị câu hỏi
      const isSameSender = i+1 < totalMessages && currentQuestion.studentId === questionList[i + 1].studentId &&(time.getDate() ==new Date(questionList[i+1].createdAt).getDate()) ;
      let shouldDisplayTime = i < totalMessages - 1 && checkTimeDifference(time, new Date(questionList[i + 1].createdAt));
      //Tin nhắn cuối cùng luôn hiển thị thời gian
      if(i==totalMessages-1)
      {
        shouldDisplayTime = true;
      }
  
      list.push(
        <Question
          key={currentQuestion._id}
          User={sender}
          Content={currentQuestion.content}
          Time={shouldDisplayTime ? formatTimeQuestion(time) : ''}
          Avatar={isSameSender ? 'no' : ''}
          Type={currentQuestion.type}
        />
      );
    }
  
    return list;
  };

  const loadQuestion = async () => {
    setLoading(true);
    const url = `${localHost}/api/v1/question/findBySubject/${subjectId}`
    const response = await get({ url: url, token: accessToken });
    if (response) {
      if (response.status == 200) {
        const list = await response.data;
        setQuestionList(list.questions)
       
      }else{
        Alert.alert("Thông báo","Đã xảy ra lỗi");
      }
    }
    setLoading(false);
  }

  const generateID = () => {
    const codeInit = "qwertyuiopasdfghjklzxcvbnm1234567890"
    let code = ""
    for (let i = 0; i < 10; i++) {
      const index = Math.floor(Math.random() * codeInit.length)
      code += codeInit.charAt(index)
    }
    return code
  }
  const sendQuestion = async (Type: string, Content: string) => {
    
    if (!Content || Content=='') {
      Content = message;
      setMessage('');
    }

    const dataPost = {

      subjectId: `${subjectId}`,
      studentId: `${user?.id}`,
      content: Content,
      type: Type,
      isResolved: false
    }

    const idMsg = generateID()
   
    if (user) {
      const msg: Question = {
        _id: idMsg,
        subjectId:`${subjectId}`,
        content: Content,
        studentId: `${user?.id}`,
        createdAt: `${new Date().toISOString()}`,
        type: Type,
        isResolved:  false,
        updatedAt: `${new Date().toISOString()}`,
        __v: '0',
        id: idMsg,
      }
      
      setQuestionList((prevList) => [...prevList, msg])
     
      const url = `${localHost}/api/v1/question/add`;
      
      const response = await post({ url: url, data: dataPost, token: accessToken });
     
      if(response)
      {
        if(socketContext?.socket){
          socketContext.socket.emit('sendMessageToSubject', {subjectID:subjectId, message:msg, senderID:user.id});
        }
        if(response.status!=201)
        {
          const msgList = questionList.filter((value) => value._id !== idMsg)
          
          setQuestionList(msgList)
          
          Alert.alert(
            'Alert',
            'Message could not be sent',)
          return false
        }
      }

      
    }

  }

  const uploadImage = async (imageUri: string, name: string) => {
    const formData = new FormData();
    const extension = imageUri.split('.').pop();
   if(extension)
   {
    const type = mime.lookup(extension);
    if(type)
    {
    
      formData.append('image', {
        uri: imageUri,
        type: type || 'image/jpeg', // Mặc định là JPEG nếu không xác định được loại
        name: name|| 'photo.jpg',
      }as any);
    }  
   }
    const url=`${localHost}/api/v1/upload/image`
    try {
      const response = await post({url:url,token:accessToken,data:formData})
      if(response)
      {
        if (response.status == 200) {
          const json = await response.data;
          console.log(json)
          return json.image;
        }else{
          Alert.alert('Thông báo','Không thể gửi')
          return false;
        }
      }
     
    }
    catch (error) {
      Alert.alert(
        'Alert',
        'Unable to send photo',)
      return false;
    }
    finally {
      
    }
  }  
  const handleChooseImage = async () => {
    let image = [];
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      // allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setUploading(true);
      const listImage = Array.from(result.assets);
      for (let i = 0; i < listImage.length; i++) {
        const currentTime = new Date();
        const timestamp = currentTime.getTime();
        let imageUri = await uploadImage(listImage[i].uri, "" + timestamp + user?.id);
        if (imageUri) {
          image.push(imageUri);
        }
      }
      const Image = image.join(" ");
      // setMessage(Image);
      if (image.length > 0)
        await sendQuestion('image', Image);
      // setMessage('');
      setUploading(false);

    }
  };
  const handleCamera = async () => {
    let image;
    let result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setUploading(true);
      image = result.assets;
      const currentTime = new Date();
      const timestamp = currentTime.getTime();
      const imageUrl = await uploadImage(image[0].uri, "" + timestamp + user?.id)
      if (imageUrl) {
        sendQuestion('image', imageUrl);
        setMessage('');
      }
    }
  };

  //send
  const handlesendQuestion = async () => {
    setcheckScroll(true);
    await sendQuestion('text', '');

  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">

      <View className="justify-center h-full flex-1 w-full">

        <View className='h-[54] w-full justify-start items-center flex-row mt-[9%] px-[4%]'>
          <TouchableOpacity className='' onPress={() => router.back()} >
          <Ionicons name="chevron-back" size={24} color="black" style={{marginRight:'auto', marginTop:3}} />
          </TouchableOpacity >
          <Text className="font-semibold text-xl mx-auto" numberOfLines={1} ellipsizeMode="tail">Kênh chung</Text>
        </View>
        <LinearGradient style={{ height: 1.2, backgroundColor: '#F7F7F7' }}
          colors={["#C0BDBD", "#ffffff"]}>
        </LinearGradient>


        {isLoading ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" color="#FF9557" animating={true} />
          </View>
        ) :
          (
            <ScrollView className="flex-1 w-full"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: 'flex-end',
                paddingVertical: 0,
                paddingHorizontal:'0.5%'
            }}
              onContentSizeChange={(contentWidth, contentHeight) => {
                if (checkScroll) {
                  scrollViewRef?.current?.scrollToEnd({ animated: true });
                  setcheckScroll(false);
                }
              }}
              ref={scrollViewRef}
              onScroll={({ nativeEvent }) => {
                if (nativeEvent.contentOffset.y <= 0) {
                  handleLoadMore();
                }
              }}
              scrollEventThrottle={16}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              {renderQuestion()}

            </ScrollView>

          )
        }         
            <View className='h-[60px] w-[90%] ml-[5%] justify-center items-center flex-row'>

              {

                (
                  <View className="flex-1 border rounded-3xl px-[10px] border-[#E6E6E6] p-[5px]">
                    <TextInput value={message}
                      onChangeText={(e) => setMessage(e)}
                      multiline={true}
                      placeholder="Message" />
                  </View>
                )
              }

              {(message.trim().length > 0) ? (
                <TouchableOpacity onPress={handlesendQuestion} >
                  <Feather name="send" size={26} color="gray" style={{marginLeft:9, marginTop:3}} />
                </TouchableOpacity>) : (
                <>

                  <TouchableOpacity onPress={handleCamera} >
                  <Feather name="camera" size={27} color="#767676" style={{marginLeft:10}} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleChooseImage} >
                  <FontAwesome6 name="image" size={24} color="#767676" style={{marginLeft:10}} />
                  </TouchableOpacity>

                </>
              )}

            </View>
          
     
        <Loading loading={isUploading} />
      </View>
    </KeyboardAvoidingView>

  )
}


// registerRootComponent(ScreenChatRoom);