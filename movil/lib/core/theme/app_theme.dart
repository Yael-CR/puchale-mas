
import 'package:flutter/material.dart';

class AppTheme {
  static const Color background = Color(0xFF0B0B0B);
  static const Color brand = Color(0xFFA3FF00);
  static const Color brandLight = Color(0xFF639900);

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: background,
    colorScheme: const ColorScheme.dark(
      primary: brand,
      secondary: brandLight,
      surface: Color(0xFF171717),
      onPrimary: Colors.black,
      onSecondary: Colors.white,
      onSurface: Colors.white,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: background,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
    ),
  );
}
