import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import mime from 'react-native-mime-types';
import { Platform, Alert } from 'react-native';

export const openFile = async (fileUri: string, fileName: string) => {
  console.log("File URI:", fileUri);
  
  if (Platform.OS === 'android') {
    try {
      // Kiểm tra xem tệp có tồn tại không
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      let mimeType = 'application/octet-stream'; // Mặc định MIME type

      if (fileInfo.exists) {
        // Sử dụng thư viện mime để xác định MIME type từ phần mở rộng
        mimeType = mime.lookup(fileUri) || mimeType;
      }

      // Di chuyển tệp vào thư mục cache (có thể chia sẻ)
      const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: fileUri,
        to: destinationUri,
      });
      console.log("Destination URI:", destinationUri);
      console.log("MIME Type:", mimeType);
      const contentUri = `${destinationUri}`.replace('file://', 'content://');

      // Mở tệp bằng IntentLauncher mà không cần FLAG_GRANT_READ_URI_PERMISSION
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: mimeType,
      });
      
    } catch (error) {
      console.error('Error opening file with FileProvider:', error);
      Alert.alert('Lỗi', 'Không thể mở tệp.');
    }
  } else {
    // Xử lý cho iOS hoặc các nền tảng khác nếu cần
    console.log("Không hỗ trợ mở tệp trên nền tảng này");
    Alert.alert("Thông báo", "Không hỗ trợ mở tệp trên nền tảng này.");
  }
};
