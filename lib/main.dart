import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

// ไฟล์หลักของแอป Flutter
void main() async {
  // ต้องเรียก WidgetsFlutterBinding.ensureInitialized() ก่อนเรียก Firebase
  WidgetsFlutterBinding.ensureInitialized();
  
  // เริ่มต้น Firebase
  await Firebase.initializeApp();
  
  // รันแอป
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Firebase Auth Flutter',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: AuthScreen(),
    );
  }
}

// หน้าจอหลักสำหรับการ Authentication
class AuthScreen extends StatefulWidget {
  @override
  _AuthScreenState createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  // สร้าง instance ของ Firebase Auth
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  // สร้าง instance ของ Google Sign In
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  
  // ตัวแปรเก็บข้อมูลผู้ใช้
  User? _user;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // ตรวจสอบสถานะการเข้าสู่ระบบเมื่อเริ่มต้นแอป
    _checkCurrentUser();
  }

  // ตรวจสอบผู้ใช้ปัจจุบัน
  void _checkCurrentUser() {
    _auth.authStateChanges().listen((User? user) {
      setState(() {
        _user = user;
      });
    });
  }

  // ฟังก์ชันเข้าสู่ระบบด้วย Google
  Future<void> _signInWithGoogle() async {
    try {
      setState(() {
        _isLoading = true;
      });

      // เริ่มต้นกระบวนการ Google Sign In
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        // ผู้ใช้ยกเลิกการเข้าสู่ระบบ
        setState(() {
          _isLoading = false;
        });
        return;
      }

      // รับข้อมูล authentication จาก Google
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      // สร้าง credential สำหรับ Firebase
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // เข้าสู่ระบบด้วย Firebase
      await _auth.signInWithCredential(credential);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('✅ เข้าสู่ระบบด้วย Google สำเร็จ')),
      );
    } catch (error) {
      print('❌ เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ เข้าสู่ระบบด้วย Google ล้มเหลว: $error')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // ฟังก์ชันเข้าสู่ระบบด้วย Apple
  Future<void> _signInWithApple() async {
    try {
      setState(() {
        _isLoading = true;
      });

      // ตรวจสอบว่า Apple Sign In รองรับหรือไม่
      final isAvailable = await SignInWithApple.isAvailable();
      if (!isAvailable) {
        throw Exception('Apple Sign In ไม่รองรับบนอุปกรณ์นี้');
      }

      // เริ่มต้นกระบวนการ Apple Sign In
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      // สร้าง OAuthProvider สำหรับ Apple
      final oauthProvider = OAuthProvider('apple.com');
      final oauthCredential = oauthProvider.credential(
        idToken: credential.identityToken,
        accessToken: credential.authorizationCode,
      );

      // เข้าสู่ระบบด้วย Firebase
      await _auth.signInWithCredential(oauthCredential);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('✅ เข้าสู่ระบบด้วย Apple สำเร็จ')),
      );
    } catch (error) {
      print('❌ เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Apple: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ เข้าสู่ระบบด้วย Apple ล้มเหลว: $error')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // ฟังก์ชันเข้าสู่ระบบด้วย LINE (ผ่าน Cloud Functions)
  Future<void> _signInWithLine() async {
    try {
      setState(() {
        _isLoading = true;
      });

      // URL ของ Cloud Functions (ต้องเปลี่ยนเป็นของโปรเจคคุณ)
      const String functionsBaseUrl = 'https://asia-southeast1-traveltech-f0674.cloudfunctions.net';
      
      // ขอ URL สำหรับ LINE authorization
      final response = await http.get(
        Uri.parse('$functionsBaseUrl/getLineAuthUrlHttp'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          // เปิด URL ใน browser หรือ WebView
          // สำหรับ Flutter ควรใช้ url_launcher package
          print('LINE Auth URL: ${data['authUrl']}');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('🔄 กำลังเปิด LINE Login...')),
          );
        } else {
          throw Exception(data['error'] ?? 'ไม่สามารถรับ LINE authorization URL ได้');
        }
      } else {
        throw Exception('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Cloud Functions');
      }
    } catch (error) {
      print('❌ เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย LINE: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ เข้าสู่ระบบด้วย LINE ล้มเหลว: $error')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // ฟังก์ชันออกจากระบบ
  Future<void> _signOut() async {
    try {
      // ออกจากระบบจาก Firebase
      await _auth.signOut();
      
      // ออกจากระบบจาก Google Sign In
      await _googleSignIn.signOut();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('🚪 ออกจากระบบสำเร็จ')),
      );
    } catch (error) {
      print('❌ เกิดข้อผิดพลาดในการออกจากระบบ: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ ออกจากระบบล้มเหลว: $error')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Firebase Auth Flutter'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.blue[100]!, Colors.purple[100]!],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // หัวข้อหลัก
                Icon(
                  Icons.security,
                  size: 80,
                  color: Colors.blue[700],
                ),
                SizedBox(height: 20),
                Text(
                  'Firebase Authentication',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue[800],
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  'ระบบเข้าสู่ระบบที่ปลอดภัยด้วย Firebase',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 40),

                // แสดงข้อมูลผู้ใช้ถ้าเข้าสู่ระบบแล้ว
                if (_user != null) ...[
                  _buildUserInfo(),
                  SizedBox(height: 30),
                ],

                // ปุ่มเข้าสู่ระบบ (แสดงเฉพาะเมื่อยังไม่ได้เข้าสู่ระบบ)
                if (_user == null) ...[
                  _buildAuthButtons(),
                ] else ...[
                  // ปุ่มออกจากระบบ
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _signOut,
                    icon: Icon(Icons.logout),
                    label: Text('ออกจากระบบ'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ],

                // แสดง loading indicator
                if (_isLoading) ...[
                  SizedBox(height: 20),
                  CircularProgressIndicator(),
                  SizedBox(height: 10),
                  Text('กำลังดำเนินการ...'),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  // สร้าง Widget แสดงข้อมูลผู้ใช้
  Widget _buildUserInfo() {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundImage: _user!.photoURL != null
                ? NetworkImage(_user!.photoURL!)
                : null,
            child: _user!.photoURL == null
                ? Icon(Icons.person, size: 40, color: Colors.grey)
                : null,
          ),
          SizedBox(height: 15),
          Text(
            _user!.displayName ?? 'ไม่มีชื่อ',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 5),
          Text(
            _user!.email ?? 'ไม่มีอีเมล',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 10),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.green[100],
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'เข้าสู่ระบบแล้ว',
              style: TextStyle(
                color: Colors.green[800],
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // สร้าง Widget ปุ่มเข้าสู่ระบบ
  Widget _buildAuthButtons() {
    return Column(
      children: [
        // ปุ่ม Google Sign In
        ElevatedButton.icon(
          onPressed: _isLoading ? null : _signInWithGoogle,
          icon: Icon(Icons.g_mobiledata, color: Colors.white),
          label: Text(
            'เข้าสู่ระบบด้วย Google',
            style: TextStyle(color: Colors.white),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
        SizedBox(height: 15),

        // ปุ่ม Apple Sign In
        ElevatedButton.icon(
          onPressed: _isLoading ? null : _signInWithApple,
          icon: Icon(Icons.apple, color: Colors.white),
          label: Text(
            'เข้าสู่ระบบด้วย Apple',
            style: TextStyle(color: Colors.white),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black,
            padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
        SizedBox(height: 15),

        // ปุ่ม LINE Sign In
        ElevatedButton.icon(
          onPressed: _isLoading ? null : _signInWithLine,
          icon: Icon(Icons.chat, color: Colors.white),
          label: Text(
            'เข้าสู่ระบบด้วย LINE',
            style: TextStyle(color: Colors.white),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
      ],
    );
  }
} 