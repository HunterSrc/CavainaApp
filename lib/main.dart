import 'package:flutter/material.dart';

import 'login.dart';

void main() {
  runApp(const CavainaApp());
}

class CavainaApp extends StatelessWidget {
  const CavainaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CavainaApp',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF2D282A),
        colorScheme: const ColorScheme(
          brightness: Brightness.dark,
          primary: Color(0xFFE26A2B),
          onPrimary: Colors.white,
          secondary: Color(0xFFFF8A4F),
          onSecondary: Colors.white,
          error: Color(0xFFFF6B6B),
          onError: Colors.white,
          surface: Color(0xFF3A3437),
          onSurface: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF2D282A),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: const LoginPage(),
    );
  }
}
